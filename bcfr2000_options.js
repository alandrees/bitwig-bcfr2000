/**
 * Copyright 2014 Alan Drees
 *
 * Purpose:
 *  Implements configuraable options for each of the component modules of the design
 * Dependencies
 *  bcfr2000_controller_object.js
 */

var BCFR2000 = BCFR2000 || {};
var BCR = BCR || {};
var BCF = BCF || {};

/**\fn BCFR2000.options
 *
 * Options used for the BCFR2000 encapsulating controller
 *
 * @param None
 *
 * @returns None
 */

BCFR2000.options = {'bcfs'          : 1,
		    'bcrs'          : 1,
		    'io'            : 'bcr',
		    'discoveryname' : [["BCF2000", "BCF2000"]],
		    'tracks'        : 8,
		    'sends'         : 3,
		    'scenes'        : 0
		   };

/**\fn BCF.options
 *
 * Options used for the BCF2000 portion of the controller
 *
 */

BCF.options = {'channel'  : 1,
	       'faders'   : 8,
	       'encoders' : 0,
	       'buttons'  : 16,
	       'gencoder' : 32,
	       'gbuttons' : 8,
	       'misc'     : 4,
	       'tracks'   : BCFR2000.options.tracks || 8,
	       'sends'    : BCFR2000.options.sends  || 3,
	       'scenes'   : BCFR2000.options.scenes || 0};

/**\fn BCR.options
 *
 * Options used for the BCR2000 portion of the controller
 *
 */

BCR.options = {'channel'                 : 2,
	       'faders'                  : 0,
	       'encoders'                : 24,
	       'buttons'                 : 16,
	       'gencoder'                : 32,
	       'gbuttons'                : 32,
	       'misc'                    : 4,
	       'tracks'                  : BCFR2000.options.tracks || 8,
	       'sends'                   : BCFR2000.options.sends  || 3,
	       'scenes'                  : BCFR2000.options.scenes || 0,
	       'enable_preset_switching' : false,
	       'bpm_low'  : 75,
	       'bpm_high' : 200};

