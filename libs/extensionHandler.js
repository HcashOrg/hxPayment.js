"use strict";

var callbackMap = {};

var openExtension = function (params) {

    if (params.listener) {
        callbackMap[params.serialNumber] = params.listener;
    }
    //params.callback = undefined;     //postMessage can't contains a function attr
    params.listener = undefined;     //postMessage can't contains a function attr

    window.postMessage({
        "src": "hxPay",
        "logo": "hx",  //to distinguish from other messages
        "params": params
    }, "*");

};

window.addEventListener('message', function (resp) {

    console.log("hxpay: received resp.data: " + JSON.stringify(resp.data));
    if (resp.data.src !== "content")
        return;

    var key = resp.data.serialNumber;

    var sourceName = 'HxExtWallet';

    if (resp.data.data && resp.data.data.source !== sourceName)
        return;

    var callback = callbackMap[key];
    if (typeof callback === "function") {
        callback(key, resp.data.resp, resp.data.name);
    }

    //delete callbackMap[key];

});


module.exports = openExtension;
