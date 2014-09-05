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

    this.controls = control_builder.call(this);
}

/**\fn BCF.BCF2000Controller.prototype.init
 *
 * Init function to be called to initalize the 
 *
 * @param None
 *
 * @returns None
 */


BCF.BCF2000Controller.prototype.init = function()
{
    
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
 *
 * @returns None
 */

BCF.BCF2000Controller.prototype.onMidi = function(status, data1, data2)
{
    console.log('bcf midi');    
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

    //first build a list of faders
    ccs = [32, 33, 34, 35, 36, 37, 38, 39];
	
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Fader(127, 0, ccs[index], 0);
    }
    
    
    //the 16 top buttons
    ccs = [40, 41, 42, 43, 44, 45, 46, 47];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    ccs = [48, 49, 50, 51, 52, 53, 54, 55];
	
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    //the 32 grouped encoders
    //group 1
    ccs = [102, 103, 104, 105, 106, 107, 108, 109];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    ccs = [64, 65, 66, 67, 68, 69, 70, 71];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    ccs = [72, 73, 74, 75, 76, 77, 78, 79]
    
    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    ccs = [80, 81, 82, 83, 84, 85, 86, 87];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    //the 32 grouped buttons
    //only 8 different ccs's used for the BCF layout
    ccs = [56,  57,  58,  59,  60,  61,  62, 63];

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Button(127, 0, ccs[index], 0);
    }

    //User buttons
   
    ccs = [89, 90, 91, 92]

    for(var index = 0; index < ccs.length; index++){
	return_value[ccs[index]] = new BC.Encoder(127, 0, ccs[index], 0);
    }

    return return_value;
}
