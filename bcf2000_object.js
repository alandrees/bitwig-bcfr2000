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
 *
 * @returns None
 */

BCF.BCF2000Controller = function(options, instance, control_builder, channel)
{
    this.set_options(options);
    this.instance = instance;

    this.channel = channel;

    this.io_controller = false;

    this.controls = control_builder.call(this);

    this.indexed_controls = this.build_indexed_controls();
}

/**\fn BCF.BCF2000Controller.prototype.init
 *
 * Init function to be called to initalize the 
 *
 * @param io_controller sets if that controller is the one which has it's io bound to bitwig
 * @param banks passed from the encapsulating object (when running in standalone mode, this will be in the global scope)
 *
 * @returns None
 */


BCF.BCF2000Controller.prototype.init = function(io_controller, banks)
{
    var self = this;

    if(typeof track_offset === 'undefined'){ var track_offset = 0; }

    this.track_offset = track_offset;

    this.io_controller = io_controller;
 
    this.banks = banks;

    //setup observers

    BCF.bind_observers.call(this);
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
    for(var i = 0; i < this.indexed_controls; i++)
    {
	for(var callback in this.output_callbacks)
	{
	    output_callbacks[callback].call(this, 127, i);
	}
    }
}

/**\fn BCF.BCFController.prototype.onMidi
 *
 * Function to be fired on midi input from the controller
 *
 * @param status
 * @param data1
 * @param data2
 * @param banks banks object
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onMidi = function(status, data1, data2)
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


/**\fn BCF.bind_observers
 *
 * Implementation-specific function to bind observers
 * 
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

    }

    this.output_callbacks.sendfunc = function(sendid, value, index)
    {

    }

    this.output_callbacks.panfunc = function(value, index)
    {

    }

    this.output_callbacks.solofunc = function(value, index)
    {

    }

    this.output_callbacks.armfunc = function(value, index)
    {

    }

    this.output_callbacks.mutefunc = function(value, index)
    {

    }

    var generateObserverFunc = function(cb, index){
	return function(value)
	{
	    cb(value, index);
	}
    }

    for(var index = 0; index < this.indexed_controls.length; index++)
    {
	var track = this.banks.trackbank.getTrack(index);

	track.getVolume().addValueObserver(127,
					   (function(cb, index)
					   {
					       return function(value)
					       {
						   cb(value, index);
					       }
					   }).call(this, self.output_callbacks.volumefunc, index));

	for(var send_index = 0; send_index < this.options.sends; send_index++)
	{
	    track.getSend(send_index).addValueObserver(127,
						       (function(sendid, cb, index)
							{
							    return function(value)
							    {
								cb(sendid, value, index);
							    }
							}).call(this, send_index, self.output_callbacks.sendfunc, index));
						       
	}

	track.getPan().addValueObserver(127,
					   (function(cb, index)
					   {
					       return function(value)
					       {
						   cb(value, index);
					       }
					   }).call(this, self.output_callbacks.panfunc, index));

	track.getSolo().addValueObserver((function(cb, index)
					  {
					      return function(value)
					      {
						  cb(value, index);
					      }
					  }).call(this, self.output_callbacks.solofunc, index));
	
	track.getArm().addValueObserver((function(cb, index)
					  {
					      return function(value)
					      {
						  cb(value, index);
					      }
					  }).call(this, self.output_callbacks.armfunc, index));
	
	track.getMute().addValueObserver((function(cb, index)
					  {
					      return function(value)
					      {
						  cb(value, index);
					      }
					  }).call(this, self.output_callbacks.armfunc, index));
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
    var x = function(midi, control, tb){};

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
	return_value[ccs[index]] = new BC.Fader(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].callback = {'cb'   : x,
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
	    track.getVolume().set(value, BC.MIDI_MAX);
	}

	track.getArm().toggle();
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //mute buttons
    ccs = [48, 49, 50, 51, 52, 53, 54, 55];
	
    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	track.getMute().toggle();
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
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

	track.getPan().set(value, BC.MIDI_MAX);
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }


    //senda
    ccs = [64, 65, 66, 67, 68, 69, 70, 71];

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	track.getSend(0).set(value, BC.MIDI_MAX);
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //sendb
    ccs = [72, 73, 74, 75, 76, 77, 78, 79]

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	track.getSend(1).set(value, BC.MIDI_MAX);
    }
    
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //sendc
    ccs = [80, 81, 82, 83, 84, 85, 86, 87];

    x = function(midi, control)
    {
	var value = midi.data2;
	
	var track = this.banks.trackbank.getTrack(control.track_index)

	track.getSend(2).set(value, BC.MIDI_MAX);
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
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

	track.getSolo().toggle();
    }

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    //User buttons
   
    ccs = [89, 90, 91, 92]

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	
	if(index === 0)
	{
	    return_value[ccs[index]].callback = {'cb'   : function(midi, control){if(midi.data2 != 0) this.banks.trackbank.scrollTracksUp();},
						 'obj' : this};
	}
	else if(index === 1)
	{
	    return_value[ccs[index]].callback = {'cb'   : function(midi, control){if(midi.data2 != 0) this.banks.trackbank.scrollTracksDown();},
						 'obj' : this};
	}
	else
	{
	    return_value[ccs[index]].callback = {'cb'   : function(midi, control){},
						 'obj' : this};
	}

    }

    return return_value
}
