loadAPI(1);

/**
 * Copyright 2014 Alan Drees
 *   
 * Purpose:
 *  BCFR2000 controller script entry point
 *
 * Dependencies:
 *  bcfr2000_controller_object.js
 *
 */

var console = {};

console.log = function(string)
{
    println(string);
};

load('bcfr2000_options.js');
load('bcfr2000_controller_object.js');
load('bcf2000_object.js');
load('bcr2000_object.js');
load('bc_controls.js');

host.defineController("Stealthascope", "BCFR2000", "0.0", "CA3EEFAF-636D-454F-81A8-E67EAF1B01AE");
host.defineMidiPorts(1, 1);

for(var pair_index in BCFR2000.options.discoveryname)
{
    var pair_array = BCFR2000.options.discoveryname[pair_index];
    host.addDeviceNameBasedDiscoveryPair([pair_array[0]],[pair_array[1]]);
}

var controllers = new Array();
var icc_network = new Array();

icc_network.push(ICC.create_new_icc_network('bcfr2000'));

controllers[1] = new BCFR2000.BCFRController(BCFR2000.options, 0);

function init()
{
    for(var controller in controllers)
    {
	controllers[controller].init();
    }
}

function exit()
{
    for(var controller in controllers)
    {
	controllers[controller].exit();
    }
}

function flush()
{
    for(var controller in controllers)
    {
	controllers[controller].flush();
    }
}
