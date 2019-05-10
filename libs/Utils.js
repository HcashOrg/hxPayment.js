"use strict";

var isChrome = function() {
    if (typeof window !== "undefined") {
        var userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.match(/chrome\/([\d\.]+)/))  {
            return true;
        }
    } 
    return false;
};

var isExtInstalled = function() {
    return (typeof(HxExtWallet) !== 'undefined');
};

var isMobile = function() {
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("mobile") > -1)  {
        return true;
    }
    return false;
};

var _isAnybit = false;
var isAnybitMobile = function() {
    if (window.isAnybit === true) {
        _isAnybit = window.isAnybit;
        return true;
    }

    return _isAnybit;
};

window.addEventListener('AnybitLoaded', function () {
	console.log('AnybitLoaded');
    _isAnybit = true;
    window.isAnybit = true;
    //delete callbackMap[key];
});

var anybitDappNamespace = "AnybitDapp";
var wrappedAnybitMethod = function (method) {
    if (method.startsWith(anybitDappNamespace)) {
        return method;
    }
    return anybitDappNamespace + "." + method;
};

var getOrigin = function() {
    var origin;
    var plugin = "";

    if(typeof location !== 'undefined') {
        if(location.hasOwnProperty('hostname') && location.hostname.length && location.hostname !== 'localhost') {
            origin = location.hostname;
        } else { origin = plugin; }
    } else { origin = plugin; }

    if(origin.substr(0, 4) === 'www.') origin = origin.replace('www.','');
    
    return origin;
};

var isNano = function() {
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("nasnanoapp") > -1)  {
        return true;
    }
    return false;
};

var isWechat = function () {
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("micromessenger") > -1)  {
        return true;
    }
    return false;
};

var randomCode = function (len) {
    var d,
        e,
        b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        c = "";
        for (d = 0; len > d; d += 1){
            e = Math.random() * b.length;
            e = Math.floor(e);
            c += b.charAt(e);
        }
        return c;
};

var addCssRule = function() {
    function createStyleSheet() {
        var style = document.createElement('style');
        style.type = 'text/css';
        document.head.appendChild(style);
        return style.sheet;
    }
  
    var sheet = createStyleSheet();
  
    return function(selector, rules, index) {
        index = index || 0;
        sheet.insertRule(selector + "{" + rules + "}", index);
    };
}();

module.exports = {
    isExtInstalled: isExtInstalled,
    isChrome: isChrome,
    isMobile: isMobile,
    isNano: isNano,
    isWechat: isWechat,
    randomCode: randomCode,
    addCssRule: addCssRule,
    getOrigin: getOrigin,
    isAnybitMobile: isAnybitMobile,
    wrappedAnybitMethod: wrappedAnybitMethod,
};
