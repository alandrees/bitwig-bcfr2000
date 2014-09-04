/**
 * Copyright 2014 Alan Drees
 *   
 * Purpose:
 *  Implements configuraable options for each of the component modules of the design
 * Dependencies
 *  bcfr2000_controller_object.js
 */

var BCFR2000 = BCFR2000 || {}:

if(typeof BCFR2000.BCR === 'undefined') BCFR2000.BCR = {};
if(typeof BCFR2000.BCF === 'undefined') BCFR2000.BCF = {};

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
		    'discoveryname' : [["BCF2000", "BCF2000"]]
		   }

/**\fn BCFR2000.BCF2000.options
 *
 * Options used for the BCF2000 portion of the controller
 *
 */

BCFR2000.BCF2000.options = {'channel' : 1};

/**\fn BCFR.BCR2000.options
 *
 * Options used for the BCR2000 portion of the controller
 *
 */

BCFR2000.BCR2000.options = {'channel' : 2};
