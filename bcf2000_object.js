/**
 * Copyright 2014 Alan Drees
 *   
 * Purpose:
 *  Defines the BCF2000 controller object
 * 
 * Dependencies
 *  bcfr2000_controls.js
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
 *
 * @returns None
 */


BCF.BCF2000Controller = function(options, instance)
{
    
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
