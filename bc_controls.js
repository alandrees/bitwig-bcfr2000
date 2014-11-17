/**
 * Copyright 2014 Alan Drees
 *
 * Purpose:
 *  Implements controls used by the BCF/BCR2000
 *
 * Dependencies
 *
 */
var BC = BC || {};

BC.MIDI_MAX = 127; //constant for MIDI CC's.  Change this if using NRPN's or something with a higher resolution.
BC.MIDI_ON = BC.MIDI_MAX; //constant for MIDI on value
BC.MIDI_OFF = 0;          //constant for MIDI off value

/**\fn BC.Control
 *
 * Base object which all other BC controls inherit from
 *
 * @param min
 * @param max
 * @param control
 * @param init_value
 *
 * @returns None
 */

BC.Control = function(min, max, control, init_value)
{
    this.value = init_value;
    this.min   = min;
    this.max   = max;
    this.control = control;
}


/**\fn BC.Control.prototype.valueToMidi
 *
 * Converts an internal value to a MIDI value between 0 and 127
 *
 * @param None
 *
 * @returns midi value (between 1 and 127
 */

BC.Control.prototype.valueToMidi = function()
{
    return Math.round((this.value / this.max) * BC.MIDI_MAX)
}

/**\fn BC.Control.prototype.valueFromMidi
 *
 * Converts a MIDI value to an internal representation
 *
 * @param None
 *
 * @returns internal value rounded to the nearest integer
 */

BC.Control.prototype.valueFromMidi = function(value)
{
    return (value / BC.MIDI_MAX) * this.max;
}


/**\fn BC.Control.prototype.value_in
 *
 * Placeholder function for a value in callback function
 *
 * @param value value passed from external source
 *
 * @returns None
 */

BC.Control.prototype.value_in = function(value)
{
    println("value_in function called.  This should be over-ridden");
}


/**\fn BC.Control.prototype.value_out
 *
 * Placeholder function for a value out callback function
 *
 * @param value value passed from external source
 *
 * @returns None
 */

BC.Control.prototype.value_out = function(value)
{
    println("value_out function called.  This should be over-ridden");
}





/**\fn Encoder
 *
 * Constructor for the BCFR2000 Encoder object
 *
 * @param max maximum value
 * @param min minimum value
 * @param control control value it represents
 * @param init_value inital value (option)
 *
 * @returns None
 */

BC.Encoder = function(max, min, control, init_value)
{
    if(typeof init_value === 'undefined') init_value = 0;

    BC.Control.apply(this,[max, min, control, init_value]);
}

//facilitates inheritance
BC.Encoder.prototype = BC.Control.prototype;
BC.Encoder.prototype.constructor = BC.Encoder;






/**\fn Button
 *
 * Constructor for the BCFR2000 Fader object
 *
 * @param None
 *
 * @returns None
 */

BC.Button = function(param, max, min, init_value)
{
    if(typeof init_value === 'undefined') init_value = 0;

    BC.Control.apply(this,[param, max, min, init_value]);
}

//facilitates inheritance
BC.Button.prototype = BC.Control.prototype;
BC.Button.prototype.constructor = BC.Button;

/**\fn Fader
 *
 * Constructor for the BCFR2000 Fader object
 *
 * @param None
 *
 * @returns None
 */

BC.Fader = function(param, max, min, init_value)
{
    if(typeof init_value === 'undefined') init_value = 0;

    BC.Control.apply(this,[param, max, min, init_value]);
}

//facilitates inheritance
BC.Fader.prototype = BC.Control.prototype;
BC.Fader.prototype.constructor = BC.Fader;
