/**
 * Copyright 2014 Alan Drees
 *   
 * Purpose:
 *  Defines the encapsulating BCFR2000 controller
 * 
 * Dependencies
 *  bcr2000_object.js
 *  bcf2000_object.js
 *  bcfr2000_options.js
 *
 */

var BCFR2000 = BCFR2000 || {};
if(typeof BCFR2000.BCFRController === 'undefined') BCFR2000.BCFRController = {};


/**\fn BCFR2000.BCFR2000Controller
 *
 * Constructor for the BCR2000 controller object
 *
 * @param None
 *
 * @returns None
 */

BCFR2000.BCFRController = function(options, instance)
{
    this.set_options(options);
    this.instance = instance;

    this.bcr = new Array();
    this.bcf = new Array();

    for(var i = 0; i < BCFR2000.options.bcrs; i++)
    {
	this.bcr.push(new BCR.BCR2000Controller(options, i));
    }

    for(var i = 0; i < BCFR2000.options.bcfs; i++)
    {
	this.bcf.push(new BCF.BCF2000Controller(options, i));		      
    }
}

/**\fn BCFR2000.BCFR2000Controller.prototype.init
 *
 * Init function to be called to initalize the 
 *
 * @param None
 *
 * @returns None
 */

BCFR2000.BCFRController.prototype.init = function()
{

}


/**\fn BCFR2000.BCFR2000Controller.prototype.exit
 *
 * Exit function to be called when the exit event is fired 
 *
 * @param None
 *
 * @returns None
 */

BCFR2000.BCFRController.prototype.exit = function()
{

}

/**\fn BCFR2000.BCFR2000Controller.prototype.flush
 *
 * Flush function to be called when a controller's values need to be updated
 *
 * @param None
 *
 * @returns None
 */

BCFR2000.BCFRController.prototype.flush = function()
{

}

/**\fn BCFR2000.BCFRController.prototype.onMidi
 *
 * Function to be fired on midi input from the controller
 * **THIS IS ONLY A PLACEHOLDER FUNCTION.  IT DOES NOTHING**
 *
 * @param status
 * @param data1
 * @param data2
 *
 * @returns None
 */

BCFR2000.BCFRController.prototype.onMidi = function(status, data1, data2)
{

}


/**\fn BCFR2000.BCFRController.prototype.set_options
 *
 * Sets controller options
 *
 * @param options with which to set (use defaults if not set)
 *
 * @returns None
 */

BCFR2000.BCFRController.prototype.set_options = function(options)
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
