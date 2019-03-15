"use strict";

var mainnetUrl = "http://wallet.hx.cash/api";
var testnetUrl = "http://wallet.hx.cash/testnet_api";

var payUrl = function(debug) {
    debug = debug || false;
    if (debug) {
        return testnetUrl;
    } else {
        return mainnetUrl;
    }
};

var nanoScheme = function(debug) {
    debug = debug || false;
    if (debug) {
        return "openapp.HXnano.testnet";
    } else {
        return "openapp.HXnano";
    }
};

module.exports = {
    payUrl: payUrl,
    nanoScheme: nanoScheme,
    mainnetUrl: mainnetUrl,
    testnetUrl: testnetUrl
};