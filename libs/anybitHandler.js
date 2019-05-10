"use strict";

var callbackMap = {};

var openAnyBitDapp = function(params) {
    if (params.listener) {
        callbackMap[params.serialNumber] = params.listener;
    }
    //params.callback = undefined;     //postMessage can't contains a function attr
    // params.listener = undefined;     //postMessage can't contains a function attr

    dsBridge.call("AnybitDapp.hxCall", params, function(s) {
        console.log("AnybitDapp.hxCall: " + JSON.stringify(s))
        var data = JSON.parse(s);
        return typeof params.listener === 'function' ? params.listener(params.serialNumber, data.resp, data.name) : null;
    });
};

module.exports = openAnyBitDapp;
