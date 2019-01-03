"use strict";

var mainnetUrl = "https://pay.hx.cash/api/mainnet/pay";
var testnetUrl = "https://pay.hx.cash/api/pay";

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