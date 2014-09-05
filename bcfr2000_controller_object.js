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

BCFR2000.BCF_CHANNEL = 1;
BCFR2000.BCR_CHANNEL = 0;


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
	this.bcr.push(new BCR.BCR2000Controller(BCR.options, i, BCR.build_control_layout, BCFR2000.BCR_CHANNEL));
    }

    for(var i = 0; i < BCFR2000.options.bcfs; i++)
    {
	this.bcf.push(new BCF.BCF2000Controller(BCF.options, i, BCF.build_control_layout, BCFR2000.BCF_CHANNEL));		      
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
    var self = this;

    host.getMidiInPort(this.instance).setMidiCallback(function(status, data1, data2){self.onMidi(status, data1, data2);});

    this.trackbank = host.createMainTrackBank(8, 3, 0);

    var io = true;

    //initialize the bcr's
    for(var i in this.bcr)
    {
	if((this.options.io === 'bcr') && io)
	{
	    this.bcr[i].init(true);
	    io = false;
	}
	else
	{
	    this.bcr[i].init(false);
	}
    }

    //initalize the bcf's
    for(var i in this.bcf)
    {
	if((this.options.io === 'bcf') && io)
	{
	    this.bcf[i].init(true);
	    io = false;
	}
	else
	{
	    this.bcf[i].init(false);
	}
    }
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
    for(var i in this.bcr)
    {
	this.bcr[i].exit();
    }

    for(var i in this.bcf)
    {
	this.bcf[i].exit();
    }
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
    //initialize the bcr's
    for(var i in this.bcr)
    {
	this.bcr[i].flush();
    }

    //initalize the bcf's
    for(var i in this.bcf)
    {
	this.bcf[i].flush();
    }
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
    for(var bcf_device in this.bcf)
    {
	if(this.bcf[bcf_device].channel === MIDIChannel(status))
	{
	    this.bcf[bcf_device].onMidi(status, data1, data2, this.trackbank);
	    return;
	}
    }

    for(var bcr_device in this.bcr)
    {
	if(this.bcr[bcr_device].channel === MIDIChannel(status))
	{
	    this.bcf[bcf_device].onMidi(status, data1, data2, this.trackbank);
	    return;
	}
    }
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
