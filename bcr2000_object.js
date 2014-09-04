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
 * @param None
 *
 * @returns None
 */


BCR.BCR2000Controller = function(options, instance)
{
    
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
