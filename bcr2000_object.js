/**
 * Copyright 2014 Alan Drees
 *
 * Purpose:
 *  Defines the BCR2000 controller object used to handle the BCR2000 aspect of the BCFR2000
 *
 * Dependencies
 *  bc_controls.js
 *  bcfr2000_options.js
 *
 */

/*
TODO:
1: fix parameter pages to work how I want them to work (using user pages)
2: fix nested macros upon release of version 1.1
3: display the parameter page name on change
*/

var BCR = BCR || {};

//constants to define the 4 grouped banks
BCR.MACRO_BANK1 = 1;
BCR.MACRO_BANK2 = 2;
BCR.MACRO_BANK3 = 3;
BCR.MACRO_BANK4 = 4;

/**\fn BCR.BCR2000Controller
 *
 * Constructor for the BCR2000 controller object
 *
 * @param options options to be set internally for the controller
 * @param instace instance of the controller
 * @param control_builder function to build the control objects
 * @param channel channel this controller exists on
 * @param midi_instance midi io instance this controller exists on
 *
 *
 * @returns None
 */


BCR.BCR2000Controller = function(options, instance, control_builder, channel, midi_instance)
{
    if(typeof midi_instance === 'undefined') var midi_instance = instance;

    this.set_options(options);
    this.instance = instance;
    this.midi_instance = midi_instance
    this.enable_output = false;

    if(this.options.enable_preset_switching === false)
    {
	this.current_preset = 1;
	this.parameter_values = {1 : [0,0,0,0,0,0,0,0],
				 2 : [0,0,0,0,0,0,0,0],
				 3 : [0,0,0,0,0,0,0,0],
				 4 : [0,0,0,0,0,0,0,0]};
    }

    this.channel = channel;

    this.io_controller = false;
    this.io_instance = 0;
    this.parameter_offset = 0;

    this.controls = control_builder.call(this);
    this.tempo_lock = true;
    this.current_tempo = null;
    this.master_volume_lock = true;
    this.transport_lock = true;

    this.indexed_controls = this.build_indexed_controls();
}


/**\fn BCR.BCR2000Controller.prototype.init
 *
 * Init function to be called to initalize the controller
 *
 * @param io_controller sets a flag if this controller has it's own midi IO port and runs independantly or if it's a slave connected to another
 * @param banks passed from the encapsulating object (when running in standalone mode, this will be inside the global scope)
 *
 * @returns None
 */


BCR.BCR2000Controller.prototype.init = function(io_controller, banks)
{
    if(typeof track_offset === 'undefined'){ var track_offset = 0; }

    this.track_offset = track_offset;

    this.io_controller = io_controller;

    this.banks = banks;

    //setup observers
    BCR.bind_observers.call(this);

    this.enable_output = true;
}


/**\fn BCR.BCR2000Controller.prototype.exit
 *
 * Exit function to be called when the exit event is fired
 *
 * @param None
 *
 * @returns None
 */


BCR.BCR2000Controller.prototype.exit = function()
{

}


/**\fn BCR.BCR2000Controller.prototype.flush
 *
 * Flush function to be called when a controller's values need updating
 *
 * @param None
 *
 * @returns None
 */


BCR.BCR2000Controller.prototype.flush = function()
{

}


/**\fn BCR.BCRController.prototype.onMidi
 *
 * Function to be fired on midi input from the controller
 *
 * @param status midi status byte
 * @param data1 midi data byte 1
 * @param data2 midi data byte 2
 *
 * @returns None
s */

BCR.BCR2000Controller.prototype.onMidi = function(status, data1, data2)
{
    if(typeof this.controls[data1] !== 'undefined')
    {
	if(typeof this.controls[data1].callback !== 'undefined')
	{
	    var callback = this.controls[data1].callback

	    var msg = {'status' : status,
		       'data1'  : data1,
		       'data2'  : data2};

	    callback.cb.call(callback.obj,
			     msg,
			     this.controls[data1]);
	}
    }
}


/**\fn BCR.BCRController.prototype.set_options
 *
 * Sets controller options
 *
 * @param options with which to set (use defaults if not set)
 *
 * @returns None
 */

BCR.BCR2000Controller.prototype.set_options = function(options)
{
    this.options = {'channel' : 2,
		    'faders'   : 0,
		    'encoders' : 24,
		    'buttons'  : 16,
		    'gencoder' : 32,
		    'gbuttons' : 32,
		    'misc'     : 4,
		   };

    if(typeof options === 'object')
    {
	for(var option in options)
	{
	    this.options[option] = options[option];
	}
    }
}


/**\fn BCR.BCR2000Controller.prototype.build_indexed_controls
 *
 * Builds a quick and easy referential list to do control lookups going index -> controller
 * Offers a shortcut to setting properties via the index
 *
 * @param None
 *
 * @returns None
 */

BCR.BCR2000Controller.prototype.build_indexed_controls = function()
{
    var channel_object = {};

    channel_object.length = 0;

    for(var control in this.controls)
    {

	if(typeof this.controls[control].track_index !== 'undefined')
	{
	    if(typeof channel_object[this.controls[control].track_index] === 'undefined')
	    {
		channel_object[this.controls[control].track_index] = {};
		channel_object.length++;
	    }

	    channel_object[this.controls[control].track_index][control] = this.controls[control];
	}
	else
	{
	    if(typeof channel_object[-1] === 'undefined')
	    {
		channel_object[-1] = {};
	    }

	    channel_object[-1][control] = this.controls[control];
	}
    }

    return channel_object;
}

/**\fn BCR.BCR2000Controller.prototype.send_midi
 *
 * Sends a midi message using the specified IO
 *
 * @param status midi status byte
 * @param data1 midi data1 byte
 * @param data2 midi data2 byte
 *
 * @returns None
 */

BCR.BCR2000Controller.prototype.send_midi = function(status, data1, data2){
    try
    {
	host.getMidiOutPort(this.midi_instance).sendMidi(status, data1, data2);
    }
    catch(e)
    {

    }
}

/**\fn BCR.BCR2000Controller.prototype.calc_preset_switch
 *
 * Calculate how many switches and what direction are required to move
 *
 * @param preset new preset to switch to
 *
 * @returns (integer) indicating direction (- for previous, + for next) and number of calls
 */

BCR.BCR2000Controller.prototype.calc_preset_switch = function(preset)
{
    if(this.current_preset === preset)
    {
	return 0;
    }
    else
    {
	return preset - this.current_preset;
    }
}

/**\fn BCR.BCR2000Controller.prototype.switch_preset
 *
 * Stores the current preset values,
 *
 * @param switcherator switching iterator calculated by calc_preset_switch
 *
 * @returns None
 */

BCR.BCR2000Controller.prototype.switch_preset = function(switcherator)
{
    if(switcherator !== 0)
    {
	//new parameter bank
	if(switcherator > 0)
	{
	    for(var i = 1; i < Math.abs(switcherator); i++)
	    {
		this.banks.cursortrack.getPrimaryDevice().switchToNextPreset();
		this.current_preset++;
	    }
	}
	else if(switcherator < 0)
	{
	    for(var i = 1; i < Math.abs(switcherator); i++)
	    {
		this.banks.cursortrack.getPrimaryDevice().switchToPreviousPreset();
		this.current_preset--;
	    }
	}

	console.log(this.current_preset);

	var device = this.banks.cursortrack.getPrimaryDevice();

	for(var i = 0; i < this.parameter_values[this.current_preset].length; i++)
	{
	    device.getMacro(i).getAmount().set(this.parameter_values[this.current_preset][i], 
					       128);
	}
    }
}


/**\fn BCR.build_control_layout
 *
 * Non-method function to handle building the controller layout
 * **WILL BE CALLED WITH .call() and passed a this pointer to
 *   the object to generate the control layout for**
 *
 *
 * @param None
 *
 * @returns None
 */

BCR.build_control_layout = function()
{
    var ccs = [];
    var return_value = {};
    var self = this;
    var x = function(midi, control){};

    x = function(midi, control)
    {
	console.log(control.param);
    }

    //top row
    var param_encoders = function(midi, control)
    {
	if(typeof control.param_index !== 'undefined')
	{
	    try{
		control.value = midi.data2;
		this.banks.cursordevice.getParameter(control.param_index).set(midi.data2,
									      128);
	    }catch(e){
	/*	try{
		    this.banks.cursordevice.getEnvelopeParameter(control.param_index).set(midi.data2,
											  128);
		}catch(e){
		    try{
			this.banks.cursordevice.getCommonParameter(control.param_index).set(midi.data2,
											    128);
		    }catch(e){
		    }
		}
	*/
	    }
	}

    }

    var master_volume = function(midi, control)
    {
	if(!this.master_volume_lock)
	{
	    var value = midi.data2;

	    control.value = value;

	    this.banks.master_track.getVolume().set(value, 128);
	}
    }

    ccs = [81, 82, 83, 84, 85, 86, 87, 88];
    var param_index = 0;

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;

	if(index < 3)
	{
	    return_value[ccs[index]].param_index = param_index++;
	    return_value[ccs[index]].param = 'encoder-param';
	    return_value[ccs[index]].callback = {'cb'  : param_encoders,
						 'obj' : this};
	}
	else
	{
	    return_value[ccs[index]].param = 'encoder-top';
	    return_value[ccs[index]].callback = {'cb'  : x,
						 'obj' : this};
	}
    }

    //middle row
    ccs = [89, 90, 91, 92, 93, 94, 95, 96];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;

	if(index < 3)
	{
	    return_value[ccs[index]].param_index = param_index++;
	    return_value[ccs[index]].param = 'encoder-param';
	    return_value[ccs[index]].callback = {'cb'  : param_encoders,
						 'obj' : this};
	}
	else if(index === 7)
	{
	    return_value[ccs[index]].param = 'encoder-mastervolume';
	    return_value[ccs[index]].callback = {'cb'  : master_volume,
						 'obj' : this};
	}
	else
	{
	    return_value[ccs[index]].param = 'encoder-middle';
	    return_value[ccs[index]].callback = {'cb'  : x,
						 'obj' : this};
	}
    }


    //bottom row
    ccs = [97, 98, 99, 100, 101, 102, 103, 104];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;

	if(index < 3)
	{
	    return_value[ccs[index]].param_index = param_index++;
	    return_value[ccs[index]].param = 'encoder-param';
	    return_value[ccs[index]].callback = {'cb'  : param_encoders,
						 'obj' : this};
	}
	else
	{
	    return_value[ccs[index]].param = 'encoder-bottom';
	    return_value[ccs[index]].callback = {'cb'  : x,
						 'obj' : this};
	}
    }



    //buttons

    //top row

    ccs = [65, 66, 67, 68, 69, 70, 71, 72];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-top';

	if( index === 0 )
	{
	    return_value[ccs[index]].callback = {'cb'  : function(midi, control){ this.banks.cursordevice.previousParameterPage(); },
						 'obj' : this};
	}
	else if ( index === 1)
	{
	    return_value[ccs[index]].callback = {'cb'  : function(midi, control){ this.banks.cursordevice.nextParameterPage(); },
						 'obj' : this};
	}
	else
	{
	    return_value[ccs[index]].callback = {'cb'  : x,
						 'obj' : this};
	}

    }


    //bottom row
    ccs = [73, 74, 75, 76, 77, 78, 79, 80];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-bottom';

	if( (index === 0) )
	{
	}
	else
	{

	    return_value[ccs[index]].callback = {'cb'  : x,
						 'obj' : this};
	}
    }


    //the 32 grouped encoders

    x = function(midi, control)
    {
	//the macro encoders are incomplete as there is no way for pages to go down the fx chain

	var value = midi.data2;

	var index = control.track_index;
	var device = this.banks.cursortrack.getPrimaryDevice();
	var macro = device.getMacro(index);

	if(this.options.enable_preset_switching)
	{

	    switch(control.device)
	    {
	    case BCR.MACRO_BANK1:
		var switcherator = this.calc_preset_switch(1);
		break;
	    case BCR.MACRO_BANK2:
		var switcherator = this.calc_preset_switch(2);
		break;
	    case BCR.MACRO_BANK3:
		var switcherator = this.calc_preset_switch(3);
		break;
	    case BCR.MACRO_BANK4:
		var switcherator = this.calc_preset_switch(4);
		break;
	    default:
		throw('invalid macro bank');
		break;
	    }

	    if(switcherator !== 0)
	    {
		this.switch_preset(switcherator);
	    }
	}

	macro.getAmount().set(value, BC.MIDI_MAX);
    }

    //group 1
    var group = 1;

    ccs = [1, 2, 3, 4, 5, 6, 7, 8];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].device = BCR.MACRO_BANK1;
	return_value[ccs[index]].param = 'encoder-group1';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 2
    ccs = [9, 10, 11, 12, 13, 14, 15, 16];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].device = BCR.MACRO_BANK2;
	return_value[ccs[index]].param = 'encoder-group2';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 3
    ccs = [17, 18, 19, 20, 21, 22, 23, 24];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].device = BCR.MACRO_BANK3;
	return_value[ccs[index]].param = 'encoder-group3';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 4
    ccs = [25, 26, 27, 28, 29, 30, 31, 32];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].device = BCR.MACRO_BANK4;
	return_value[ccs[index]].param = 'encoder-group4';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //the 32 grouped buttons

    //group 1
    ccs = [33, 34, 35, 36, 37, 38, 39, 40];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group1';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 2
    ccs = [41, 42, 43, 44, 45, 46, 47, 48];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group2';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }


    //group 3
    ccs = [49, 50, 51, 52, 53, 54, 55, 56];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group3';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 4
    ccs = [57, 58, 59, 60, 61, 62, 63, 64];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group4';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //User buttons
    ccs = [105, 106, 107]

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], -1);

	if(index === 0)
	{
	    var tempolock = function(midi, control)
	    {
		this.tempo_lock = !this.tempo_lock;
		var status = 0xB0 + this.channel;
		var data1 = control.control;

		if(this.tempo_lock === true)
		{
		    var data2 = BC.MIDI_OFF;
		}
		else
		{
		    var data2 = BC.MIDI_ON;
		}

		control.value = data2;
	    }

	    return_value[ccs[index]].callback = {'cb'  : tempolock,
						 'obj' : this};
	}

	if(index === 1)
	{
	    var tempoincrement = function(midi, control)
	    {
		if(this.tempo_lock === true && this.current_tempo !== null)
		{
		    if(midi.data2 === 1)
		    {
			if(!(this.current_tempo + this.options.bpm_increment) >= this.options.bpm_high)
			{
			    this.current_tempo += this.options.bpm_increment;
			}
		    }
		    elseif(midi.data2 === 0)
		    {
			if(!(this.current_tempo + this.options.bpm_decrement) <= this.options.bpm_low)
			{
			    this.current_tempo += this.options.bpm_decrement;
			}
		    }

		    this.banks.transport.getTempo().set(this.current_tempo, 647);
		}
	    }

	    return_value[ccs[index]].callback = {'cb'  : tempoincrement,
						 'obj' : this};
	}

	if(index === 2)
	{
	    var mastervolumelock = function(midi, control)
	    {
		this.master_volume_lock = !this.master_volume_lock;
		var status = 0xB0 + this.channel;
		var data1 = control.control;

		if(this.master_volume_lock === true)
		{
		    var data2 = BC.MIDI_OFF;
		}
		else
		{
		    var data2 = BC.MIDI_ON;
		    //need to make sure we update the parameter with the most recent value so we don't get parameter jumping
		}

		control.value = data2;

		this.send_midi(status,
			       data1,
			       data2);
	    }

	    return_value[ccs[index]].callback = {'cb'  : mastervolumelock,
						 'obj' : this};
	}

	if(index === 3)
	{
	    //placeholder until the tempo increment/decrement buttons are implemented in software
	    return_value[ccs[index]].callback = {'cb'  : function(midi, control){},
						 'obj' : this};
	}
    }
    return return_value;
}


/**\fn BCR.bind_observers
 *
 * Implementation-specific function to bind observers
 * CALLED With this pointing to the BCR instance
 *
 * @param None
 *
 * @returns None
 */

BCR.bind_observers = function()
{
    var self = this;

    if(typeof this.output_callbacks === 'undefined') this.output_callbacks = {};

    this.output_callbacks.tempofunc = function(value)
    {
	if(this.enable_output)
	{

	    var control = this.controls[88];

	    value = Math.min(value - 56, 127);
	    value = Math.max(value, 0);

	    var status = 0xB0 + this.channel;
	    var data1  = control.control;
	    data2 = value;

	    control.value = data2;

	    this.send_midi(status,
			   data1,
			   data2);

	    this.tempo = data2;
	}
    }

    this.output_callbacks.macro_func = function(value, index)
    {
	var controllist = new Array();

	for(var controlid in this.controls)
	{
	    if(typeof this.controls[controlid].param !== 'undefined')
	    {
		if( (this.controls[controlid].track_index ===  index) && (this.controls[controlid].param.indexOf('encoder-group') !== -1) )
		{
		    controllist.push(this.controls[controlid]);
		}
	    }
	}

	for(var i = 0; i < controllist.length; i++)
	{
	    var control = controllist[i];

	    var status = 0xB0 + this.channel;
	    var data1  = control.control;
	    var data2  = value;

	    control.value = data2;

	    this.send_midi(status,
			   data1,
			   data2);
	}
    }

    this.output_callbacks.param_func = function(value, index)
    {

    }

    this.output_callbacks.page_change_func = function(pagename)
    {
	//eventually output to pagename controller
	host.showPopupNotification(pagename);
    }

    this.output_callbacks.master_func = function(value)
    {
	if(this.enable_output)
	{
	    var control = this.controls[96];

	    var status = 0xB0 + this.channel;
	    var data1  = control.control;
	    var data2  = value;

	    control.value = data2;

	    this.send_midi(status,
			   data1,
			   data2);
	}
    }

    self.banks.cursortrack.getPrimaryDevice().addSelectedPageObserver(0,
								      (function(cb)
								       {
									   return function(name)
									   {
									       cb(name);
									   }
								       }).call(this,
									       function(n){ self.output_callbacks.page_change_func(n) }));
    for(var i = 0; i < 8; i++)
    {
	this.banks.cursordevice.getMacro(i).getAmount().addValueObserver(BC.MIDI_MAX,
									 (function(cb, index)
									  {
									      return function(value)
									      {
										  cb(value, index);
									      }
									  }).call(this,
										  function(v, i){ self.output_callbacks.macro_func.call(self, v, i); },
										  i));
    }

    //track changes in the tempo
    this.banks.transport.getTempo().addValueObserver(666,
						     (function(cb)
						      {
							  return function(value)
							  {
							      cb(value);
							  }
						      }).call(this,
							      function(v){ self.output_callbacks.tempofunc.call(self, v); }));

    //master volume update
    this.banks.master_track.getVolume().addValueObserver(BC.MIDI_MAX,
							 (function(cb)
							  {
							      return function(value)
							      {
								  cb(value);
							      }
							  }).call(this,
								  function(v){ self.output_callbacks.master_func.call(self, v); }));



    if(this.options.enable_preset_switching)
    {
	var macrofunc = function(value, index)
	{
	    this.parameter_values[this.current_preset][index] = value;
	}

	for(var i = 0; i < 8; i++)
	{
	    self.banks.cursortrack.getPrimaryDevice().getMacro(i).getAmount().addValueObserver(128,
											       (function(cb, index)
												{
												    return function(value)
												    {
													cb(value, index);
												    }
												}).call(this, 
													function(v, n){ macrofunc.call(self, v, n); },
													i));
	}
    }


    //tracks updates in the selected device paramters

    //tracks updates in the macro knobs

}
