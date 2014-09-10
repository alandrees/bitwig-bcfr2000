/**
 * Copyright 2014 Alan Drees
 *   
 * Purpose:
 *  Defines the BCF2000 controller object
 * 
 * Dependencies
 *  bc_controls.js
 *  bcfr2000_options.js
 *
 */

var BCF = BCF || {};

/**\fn BCF.BCF2000Controller
 *
 * Constructor for the BCF2000 controller object
 *
 * @param options options to be set internally for the controller
 * @param instace instance of the controller
 * @param control_builder function to build the control objects
 * @param channel channel this controller exists on
 * @param midi_instance midi io instance this controller exists on
 *
 * @returns None
 */

BCF.BCF2000Controller = function(options, instance, control_builder, channel, midi_instance)
{
    if(typeof midi_instance === 'undefined') var midi_instance = instance;
    this.set_options(options);
    this.instance = instance;
    this.midi_instance = midi_instance;
    this.channel = channel;

    this.enable_output = false;

    this.io_controller = false;
    this.io_instance = 0;

    this.track_offset

    this.controls = control_builder.call(this);

    this.indexed_controls = this.build_indexed_controls();
}

/**\fn BCF.BCF2000Controller.prototype.init
 *
 * Init function to be called to initalize the controller
 *
 * @param io_controller sets if that controller is the one which has it's io bound to bitwig
 * @param banks passed from the encapsulating object (when running in standalone mode, this will be in the global scope)
 *
 * @returns None
 */


BCF.BCF2000Controller.prototype.init = function(io_controller, banks)
{
    this.io_controller = io_controller;
 
    this.banks = banks;

    //setup observers
    BCF.bind_observers.call(this);
    this.enable_output = true;
}

/**\fn BCF.BCF2000Controller.prototype.exit
 *
 * Exit function to be called when the exit event is fired
 *
 * @param None
 *
 * @returns None
 */


BCF.BCF2000Controller.prototype.exit = function()
{
    
}

/**\fn BCF.BCF2000Controller.prototype.flush
 *
 * Flush function to be called when a controller's values need updating
 *
 * @param None
 *
 * @returns None
 */


BCF.BCF2000Controller.prototype.flush = function()
{
}

/**\fn BCF.BCFController.prototype.onMidi
 *
 * Function to be fired on midi input from the controller
 *
 * @param status midi status byte
 * @param data1 midi data byte 1
 * @param data2 midi data byte 2
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onMidi = function(status, data1, data2)
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

/**\fn BCFController.prototype.set_options
 *
 * Sets controller options
 *
 * @param options with which to set (use defaults if not set)
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.set_options = function(options)
{
    this.options = {'channel'  : 1,
		    'faders'   : 8,
		    'encoders' : 0,
		    'buttons'  : 16,
		    'gencoder' : 32,
		    'gbuttons' : 8,
		    'misc'     : 4};

    if(typeof options === 'object')
    {
	for(var option in options)
	{
	    this.options[option] = options[option];
	}
    }
}


/**\fn BCF.BCF2000Controller.prototype.build_indexed_controls
 *
 * Builds a quick and easy referential list to do control lookups going index -> controller
 * Offers a shortcut to setting properties via the index
 * 
 * @param None
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.build_indexed_controls = function()
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


/**\fn BCF.BCF2000Controller.prototype.send_midi
 *
 * Sends a midi message using the specified IO
 *
 * @param status midi status byte
 * @param data1 midi data1 byte
 * @param data2 midi data2 byte
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.send_midi = function(status, data1, data2){
    sendMidi(status, 
	     data1,
	     data2, 
	     this.midi_instance);
}

/**\fn BCF.bind_observers
 *
 * Implementation-specific function to bind observers
 * CALLED With this pointing to the BCF instance
 *
 * @param None
 *
 * @returns None
 */

BCF.bind_observers = function()
{
    var self = this;

    //setup fader callbacks

    this.output_callbacks = {}

    this.output_callbacks.volumefunc = function(value, index)
    {
	if(this.enable_output)
	{
	    var status = 0xB0 + this.channel;
	    var data1  = 0;
	    var data2  = value;

	    for(var control in this.indexed_controls[index])
	    {
		if(this.indexed_controls[index][control].param === 'volume')
		{
		    data1 = this.indexed_controls[index][control].control;
		}
	    }

	    if(this.indexed_controls[index][control].value != value)
	    {
		this.indexed_controls[index][control].value = value;

		this.send_midi(status,
			       data1,
			       data2);
			       
	    }
	}
    }
	    
    this.output_callbacks.sendfunc = function(value, index, sendid)
    {
	if(this.enable_output)
	{
	    var status = 0xB0 + this.channel;
	    var data1  = 0;
	    var data2  = value;

	    switch(sendid)
	    {
	    case 0:
		var sendbank = "senda";
		break;
	    case 1:
		var sendbank = "sendb";
		break;
	    case 2:
		var sendbank = "sendc";
		break;
	    default:
		println('invalid send');
	    }

	    for(var control in this.indexed_controls[index])
	    {
		if(this.indexed_controls[index][control].param === sendbank)
		{
		    data1 = this.indexed_controls[index][control].control;
		    break;
		}
	    }

	    if(this.indexed_controls[index][control].value != value)
	    {
		this.indexed_controls[index][control].value = value;

		this.send_midi(status,
			       data1,
			       data2);
	    }
	}
    }

    this.output_callbacks.panfunc = function(value, index)
    {
	if(this.enable_output)
	{
	    var status = 0xB0 + this.channel;
	    var data1  = 0;
	    var data2  = value;

	    for(var control in this.indexed_controls[index])
	    {
		if(this.indexed_controls[index][control].param === 'pan')
		{
		    data1 = this.indexed_controls[index][control].control;
		}
	    }

	    if(this.indexed_controls[index][control].value != value)
	    {
		this.indexed_controls[index][control].value = value;

		this.send_midi(status,
			       data1,
			       data2);
	    }
	}	
    }

    this.output_callbacks.solofunc = function(value, index)
    {
	if(this.enable_output)
	{
	    var status = 0xB0 + this.channel;
	    var data1  = 0;
	    var data2  = value === true ? BC.MIDI_ON : BC.MIDI_OFF;

	    for(var control in this.indexed_controls[index])
	    {
		if(this.indexed_controls[index][control].param === 'solo')
		{
		    data1 = this.indexed_controls[index][control].control;
		}
	    }

	    if(this.indexed_controls[index][control].value != value)
	    {
		this.indexed_controls[index][control].value = value;

		this.send_midi(status,
			       data1,
			       data2);
	    }
	}
    }

    this.output_callbacks.armfunc = function(value, index)
    {
	if(this.enable_output)
	{
	    var status = 0xB0 + this.channel;
	    var data1  = 0;
	    var data2  = value === true ? BC.MIDI_ON : BC.MIDI_OFF;

	    for(var control in this.indexed_controls[index])
	    {
		if(this.indexed_controls[index][control].param === 'arm')
		{
		    data1 = this.indexed_controls[index][control].control;
		}
	    }

	    if(this.indexed_controls[index][control].value != value)
	    {
		this.indexed_controls[index][control].value = value;

		this.send_midi(status,
			       data1,
			       data2);
	    }
	}
    }

    this.output_callbacks.mutefunc = function(value, index)
    {
	if(this.enable_output)
	{
	    var status = 0xB0 + this.channel;
	    var data1  = 0;
	    var data2  = value === true ? BC.MIDI_ON : BC.MIDI_OFF;

	    for(var control in this.indexed_controls[index])
	    {
		if(this.indexed_controls[index][control].param === 'mute')
		{
		    data1 = this.indexed_controls[index][control].control;
		}
	    }

	    if(this.indexed_controls[index][control].value != value)
	    {
		this.indexed_controls[index][control].value = value;

		this.send_midi(status,
			       data1,
			       data2);
	    }
	}
    }
    
    var tracks = [];
    
    for(var index = 0; index < this.indexed_controls.length; index++)
    {
	tracks[index] = this.banks.trackbank.getTrack(index);

	//volume observer
	tracks[index].getVolume().addValueObserver(128,
					   (function(cb, index)
					   {
					       return function(value)
					       {
						   cb(value, index);
					       }
					   }).call(this, 
						   function(v, n){ self.output_callbacks.volumefunc.call(self, v, n); }, 
						   index));


	//sends observer
	for(var send_index = 0; send_index < this.options.sends; send_index++)
	{
	    tracks[index].getSend(send_index).addValueObserver(BC.MIDI_MAX,
							       (function(cb, index, sendid)
								{
								    return function(value)
								    {
									cb(value, index, sendid);
								    }
								}).call(this, 
									function(v, n, s){ self.output_callbacks.sendfunc.call(self, v, n, s); }, 
									index,
									send_index));
	}

	//pan observer
	tracks[index].getPan().addValueObserver(BC.MIDI_MAX,
						(function(cb, index)
						 {
						     return function(value)
						     {
							 cb(value, index);
						     }
						 }).call(this, 
							 function(v, n){ self.output_callbacks.panfunc.call(self, v, n); }, 
							 index));

	//solo observer
	tracks[index].getSolo().addValueObserver((function(cb, index)
						 {
						     return function(value)
						     {
							 cb(value, index);
						     }
						 }).call(this, 
							 function(v, n){ self.output_callbacks.solofunc.call(self, v, n); }, 
							 index));
		
	//arm observer
	tracks[index].getArm().addValueObserver((function(cb, index)
						 {
						     return function(value)
						     {
							 cb(value, index);
						     }
						 }).call(this, 
							 function(v, n){ self.output_callbacks.armfunc.call(self, v, n); }, 
							 index));
	//mute observer
	tracks[index].getMute().addValueObserver((function(cb, index)
						 {
						     return function(value)
						     {
							 cb(value, index);
						     }
						 }).call(this, 
							 function(v, n){ self.output_callbacks.mutefunc.call(self, v, n); }, 
							 index));
    }

}    



/**\fn BCF.build_control_layout
 *
 * Non-method function to handle building the controller layout
 * **WILL BE CALLED WITH .call() and passed a this pointer to 
 *   the object to generate the control layout for**
 *
 * @param None
 *
 * @returns None
 */

BCF.build_control_layout = function()
{
    var ccs = [];
    var return_value = {};
    var self = this;
    var x = function(midi, control){};

    //first build a list of faders
    ccs = [32, 33, 34, 35, 36, 37, 38, 39];
	
    x = function(midi, control)
    {
	var value = midi.data2;

	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getVolume().set(value, BC.MIDI_MAX);
	}
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Fader(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'volume';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //the 16 top buttons

    //arm buttons
    ccs = [40, 41, 42, 43, 44, 45, 46, 47];

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getArm().toggle();
	}


    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'arm';
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //mute buttons
    ccs = [48, 49, 50, 51, 52, 53, 54, 55];
	
    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getMute().toggle();
	}
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'mute';
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //the 32 grouped encoders
    //pan controls
    ccs = [102, 103, 104, 105, 106, 107, 108, 109];

    x = function(midi, control)
    {
	var value = midi.data2;

	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getPan().set(value, BC.MIDI_MAX);
	}
	
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'pan';
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }


    //senda
    ccs = [64, 65, 66, 67, 68, 69, 70, 71];

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getSend(0).set(value, BC.MIDI_MAX);
	}
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'senda';
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //sendb
    ccs = [72, 73, 74, 75, 76, 77, 78, 79]

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getSend(1).set(value, BC.MIDI_MAX);
	}
    }
    
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'sendb';
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //sendc
    ccs = [80, 81, 82, 83, 84, 85, 86, 87];

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getSend(2).set(value, BC.MIDI_MAX);
	}
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'sendc';
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //the 32 grouped buttons
    //only 8 different ccs's used for the BCF layout
    
    //solo
    ccs = [56,  57,  58,  59,  60,  61,  62, 63];

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	if(typeof track !== 'null')
	{
	    track.getSolo().toggle();
	}
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(BC.MIDI_MAX, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'solo';
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //User buttons
   
    ccs = [89, 90, 91, 92]

    var banking = function(midi, control)
    {
	if(control.control == 89)
	{
	    if(midi.data2 == 127) 
	    {
		this.track_offset = 0; 

		var status = 0xB0 + this.channel;

		this.send_midi(status,
			       89,
			       127);

		this.send_midi(status,
			       90,
			       0);
	    }
	}
	else if(control.control == 90)
	{
	    if(midi.data2 == 127) 
	    {
		this.track_offset = 8; 

		var status = 0xB0 + this.channel;

		this.send_midi(status,
			       89,
			       0);

		this.send_midi(status,
			       90,
			       127);
	    }
	}
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(BC.MIDI_MAX, 0, ccs[index], 0);
	
	if(index === 0)
	{
	    return_value[ccs[index]].callback = {'cb'   : banking,
						 'obj' : this};
	}
	
	if(index === 1)
	{
	    return_value[ccs[index]].callback = {'cb'   : banking,
						 'obj' : this};
	}
	
	if(index === 2)
	{
	    return_value[ccs[index]].callback = {'cb'   : function(midi, control){},
						 'obj' : this};
	}

	if(index === 3)
	{
	    return_value[ccs[index]].callback = {'cb'   : function(midi, control){},
						 'obj' : this};
	}
    }

    return return_value
}
