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

var BCR = BCR || {};

/**\fn BCR.BCR2000Controller
 *
 * Constructor for the BCR2000 controller object
 *
 * @param options options to be set internally for the controller
 * @param instace instance of the controller
 * @param control_builder function to build the control objects
 * @param channel channel this controller exists on
 *
 * @returns None
 */


BCR.BCR2000Controller = function(options, instance, control_builder, channel)
{
    this.set_options(options);
    this.instance = instance;
    this.enable_output = false;

    this.channel = channel;

    this.io_controller = false;
    this.io_instance = 0;

    this.controls = control_builder.call(this);

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
    this.enable_output;
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
 */

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
    sendMidi(status, 
	     data1,
	     data2, 
	     this.instance);
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
/*
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
	    var data2  = value === true ? 127 : 0;

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
	    var data2  = value === true ? 127 : 0;

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
	    var data2  = value === true ? 127 : 0;

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
	    tracks[index].getSend(send_index).addValueObserver(127,
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
	tracks[index].getPan().addValueObserver(127,
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
*/
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
    ccs = [81, 82, 83, 84, 85, 86, 87, 88];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'encoder-top';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //middle row
    ccs = [89, 90, 91, 92, 93, 94, 95, 96];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'encoder-middle';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    
    //bottom row
    ccs = [97, 98, 99, 100, 101, 102, 103, 104];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'encoder-bottom';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }



    //buttons

    //top row
    ccs = [65, 66, 67, 68, 69, 70, 71, 72];  
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-top';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }


    //bottom row
    ccs = [79, 74, 75, 76, 77, 78, 79, 80];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-bottom';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //the 32 grouped encoders
    //group 1
    ccs = [1, 2, 3, 4, 5, 6, 7, 8];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'encoder-group1';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }


    //group 2
    ccs = [9, 10, 11, 12, 13, 14, 15, 16];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'encoder-group2';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }


    //group 3
    ccs = [17, 18, 19, 20, 21, 22, 23, 24];
    
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'encoder-group3';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 4
    ccs = [25, 26, 27, 28, 29, 30, 31, 32];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'encoder-group4';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //the 32 grouped buttons

    //group 1
    ccs = [33, 34, 35, 36, 37, 38, 39, 40];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group1';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 2
    ccs = [41, 42, 43, 44, 45, 46, 47, 48];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group2';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }


    //group 3
    ccs = [49, 50, 51, 52, 53, 54, 55, 56];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group3';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //group 4
    ccs = [57, 58, 59, 60, 61, 62, 63, 64];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	return_value[ccs[index]].track_index = index;
	return_value[ccs[index]].param = 'button-group4';
	return_value[ccs[index]].callback = {'cb'  : x,
					     'obj' : this};
    }

    //User buttons
    ccs = [105, 106, 107, 108]

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
	
	if(index === 0)
	{
	    return_value[ccs[index]].callback = {'cb'   : function(midi, control){if(midi.data2 != 0) this.banks.trackbank.scrollTracksUp();},
						 'obj' : this};
	}
	
	if(index === 1)
	{
	    return_value[ccs[index]].callback = {'cb'   : function(midi, control){if(midi.data2 != 0) this.banks.trackbank.scrollTracksDown();},
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
    return return_value;
}
