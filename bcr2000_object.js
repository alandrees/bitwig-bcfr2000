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
    this.channel = channel;

    this.controls = control_builder.call(this);
}


/**\fn BCR.BCR2000Controller.prototype.init
 *
 * Init function to be called to initalize the 
 *
 * @param None
 *
 * @returns None
 */


BCR.BCR2000Controller.prototype.init = function()
{

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
 * @param status
 * @param data1
 * @param data2
 *
 * @returns None
 */

BCR.BCR2000Controller.prototype.onMidi = function(status, data1, data2)
{
    console.log('bcr midi');
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


/**\fn BCR.build_control_layout
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

    //top row
    ccs = [81, 82, 83, 84, 85, 86, 87, 88];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Fader(127, 0, ccs[index], 0);
    }

    //middle row
    ccs = [89, 90, 91, 92, 93, 94, 95, 96];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Fader(127, 0, ccs[index], 0);
    }
    
    //bottom row
    ccs = [97, 98, 99, 100, 101, 102, 103, 104];
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Fader(127, 0, ccs[index], 0);
    }


    //buttons

    //top row
    ccs = [65, 66, 67, 68, 69, 70, 71, 72];
    
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    //bottom row
    ccs = [79, 74, 75, 76, 77, 78, 79, 80];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }


    //the 32 grouped encoders
    //group 1
    ccs = [1, 2, 3, 4, 5, 6, 7, 8];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    //group 2
    ccs = [9, 10, 11, 12, 13, 14, 15, 16];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    //group 3
    ccs = [17, 18, 19, 20, 21, 22, 23, 24];
    
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    //group 4
    ccs = [25, 26, 27, 28, 29, 30, 31, 32];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }


    //the 32 grouped buttons

    //group 1
    ccs = [33, 34, 35, 36, 37, 38, 39, 40];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    //group 2
    ccs = [41, 42, 43, 44, 45, 46, 47, 48];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    //group 3
    ccs = [49, 50, 51, 52, 53, 54, 55, 56];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    //group 4
    ccs = [57, 58, 59, 60, 61, 62, 63, 64];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    //User buttons
    ccs = [105, 106, 107, 108]

    for(var index = 0; index < ccs; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    return return_value;
}
