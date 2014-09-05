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
    this.track_offset = 0;

    this.io_controller = false;

    this.controls = control_builder.call(this);
}

/**\fn BCF.BCF2000Controller.prototype.init
 *
 * Init function to be called to initalize the 
 *
 * @param io_controller sets if that controller is the one which has it's io bound to bitwig
 * @param track_offset determines what the track offset is at init time
 *
 * @returns None
 */


BCF.BCF2000Controller.prototype.init = function(io_controller, track_offset)
{
    if(typeof track_offset === 'undefined'){ var track_offset = 0; }

    this.track_offset = track_offset;

    this.io_controller = io_controller;
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
 * @param status
 * @param data1
 * @param data2
 * @param tb trackbank object
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onMidi = function(status, data1, data2, tb)
{
    if(typeof this.controls[data1].callback !== 'undefined')
    {
	var callback = this.controls[data1].callback

	var msg = {'status' : status,
		   'data1'  : data1,
		   'data2'  : data2};

	callback.cb.call(callback.obj, 
			 msg, 
			 this.controls[data1],
			 tb);
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
    this.options = {'bcfs'          : 1, 
		    'bcrs'          : 1,
		    'io'            : 'bcr',
		   };

    if(typeof options === 'object')
    {
	for(var option in options)
	{
	    this.options[option] = options[option];
	}
    }
}

/**\fn BCF.BCF2000Controller.prototype.onArmStateChange
 *
 * Callback to be executed when the state of an arm button changes
 *
 * @param value new value of the arm button
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onArmStateChange = function(value)
{
    
}


/**\fn BCF.BCF2000Controller.prototype.onMuteStateChange
 *
 * Callback to be executed when the state of a mute button changes
 *
 * @param value new value of the arm button
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onMuteStateChange = function(value)
{
    
}


/**\fn BCF.BCF2000Controller.prototype.onSoloStateChange
 *
 * Callback to be executed when the state of a solo button changes
 *
 * @param value new value of the solo button
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onSoloStateChange = function(value)
{
    
}


/**\fn BCF.BCF2000Controller.prototype.onVolumeChange
 *
 * Callback to be executed when the volume changes
 *
 * @param value new value of the track volume parameter
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onVolumeChange = function(value)
{

}


/**\fn BCF.BCF2000Controller.prototype.onPanChange
 *
 * Callback to be executed when the pan value changes
 *
 * @param value new value of the track pan parameter
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onPanChange = function(value)
{

}


/**\fn BCF.BCF2000Controller.prototype.onSendChange
 *
 * Callback to be executed when the send values change for a track
 *
 * @param value new value of the send parameter
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onSendChange = function(value)
{

}


/**\fn BCF.build_control_layout
 *
 * Non-member function to handle building the controller layout
 * **MUST BE CALLED WITH .call() and passed a this pointer to 
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
	
    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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

    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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
	
    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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

    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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

    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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

    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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

    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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
    
    //???
    ccs = [56,  57,  58,  59,  60,  61,  62, 63];

    x = function(midi, control, tb)
    {
	var value = midi.data2;
	
	var track = tb.getTrack(control.track_index)

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
	return_value[ccs[index]].callback = {'cb'   : x,
					     'obj' : this};
    }

    return return_value;
}
