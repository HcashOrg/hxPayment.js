"use strict";

var extend = require('extend');
var http = require("./libs/http");
var config = require("./libs/config");
var Pay = require("./libs/pay");

var BigNumber = require("bignumber.js");

var HxPay = function (appKey, appSecret) {
	this._pay = new Pay(appKey, appSecret);
};

HxPay.config = config;

var defaultOptions = function () {
	return {
		goods: {
			name: "",
			desc: "",
			orderId: "",
			ext: ""
		},
		qrcode: {
			showQRCode: false,
			completeTip: undefined, // string of complete payment tip
			cancelTip: undefined, // string of cancel payment tip
			container: undefined
		},
		extension: {
			openExtension: true //set if need show extension payment mode
		},

		mobile: {
			showInstallTip: true,
			installTip: undefined // string of install NASNano tip
		},

		// callback is the return url after payment
		//callback: config.payUrl,
		callback: undefined,

		//listener：specify a listener function to handle payment feedback message(only valid for browser extension)
		listener: undefined,

		// if debug mode, should open testnet nano and reset the callback
		debug: false,

		gasPrice: undefined,// 1 ,
		gasLimit: undefined //10000
	};
};

var hxChainConfigCacheInHxPay = null;

HxPay.prototype = {
	pay: function (assetId, to, value, options) {
		var payload = {
			type: "binary"
		};
		options = extend(defaultOptions(), options);
		return this._pay.submit(assetId, to, value, payload, options);
	},

	defaultConfig: {
		chainId: '2e13ba07b457f2e284dcfcbd3d4a3e4d78a6ed89a61006cdb7fdad6d67ef0b12',
		network: 'wss://nodeapi.hxlab.org'
	},

	postMessageRequest: function (method, data, callbackRegisterMethod, timeout) {
		timeout = timeout || 10000;
		data = data || {};
		return new Promise(function (resolve, reject) {
			var ended = false;
			if (typeof (HxExtWallet) === 'undefined') {
				if (ended) {
					return;
				}
				ended = true;
				reject("HxExtWallet not installed");
				return;
			}
			HxExtWallet[callbackRegisterMethod](function (config) {
				if (ended) {
					return;
				}
				ended = true;
				resolve(config);
			});
			setTimeout(function () {
				if (ended) {
					return;
				}
				ended = true;
				reject(method + " timeout");
			}, timeout);
		});
	},

	getConfig: function () {
		return this.postMessageRequest('getConfig', {}, 'getConfig', 10000).then(function (config) {
			hxChainConfigCacheInHxPay = config;
			return config;
		});
	},
	getConfigWithCache: function () {
		if (hxChainConfigCacheInHxPay) {
			return Promise.resolve(hxChainConfigCacheInHxPay);
		} else {
			return this.getConfig();
		}
	},
	getUserAddress: function () {
		return this.postMessageRequest('getUserAddress', {}, 'getUserAddress', 5000);
	},
	getChainConfigObject: function () {
		return hx_js.ChainConfig;
	},
	getApis: function () {
		return hx_js.Apis;
	},
	getAssets: function (apisInstance) {
		return apisInstance
			.init_promise.then(function () {
				return apisInstance
					.db_api()
					.exec("list_assets", ["", 100])
					.then(function (r) {
						var assets = r.sort(function (a, b) {
							if (a.id === b.id) {
								return 0;
							} else if (a.id < b.id) {
								return -1;
							} else {
								return 1;
							}
						});
						return assets;
					});
			});
	},
	getBalances: function (apisInstance, userAddress) {
		return apisInstance
			.init_promise.then(function () {
				return apisInstance
					.db_api()
					.exec("get_addr_balances", [userAddress])
					.then(function (r) {
						var coreCoinBalances = r.sort(function (a, b) {
							if (a.id === b.id) {
								return 0;
							} else if (a.id < b.id) {
								return -1;
							} else {
								return 1;
							}
						});
						return coreCoinBalances;
					});
			});
	},
	getTransaction: function (apisInstance, txid) {
		return apisInstance
			.init_promise.then(function () {
				return apisInstance
					.db_api()
					.exec("get_transaction_by_id", [txid]);
			});
	},
	waitTransaction: function (nodeClient, txid, timeout) {
		timeout = timeout || 8000;
		return new Promise(function (resolve, reject) {
			var executedTimeout = 0;
			var lastError = "transaction timeout, maybe transaction not successfully";
			var intervalFunc = function () {
				if (executedTimeout >= timeout) {
					clearInterval(intervalHandler);
					reject(lastError);
					return;
				}
				executedTimeout += 2000;
				nodeClient.getTransactionById(txid)
					.then(function (tx) {
						clearInterval(intervalHandler);
						resolve(tx);
					}).catch(function (err) {

					});
			};
			var intervalHandler = setInterval(intervalFunc, 2000);
		});
	},

	// TODO: get tx status by payId

	lockBalanceToCitizen: function(citizenIdOrName, assetId, amount, options) {
		var payload = {
			type: "lockBalanceToCitizen",
			citizen: citizenIdOrName,
			assetId: assetId,
			amount: amount
		};
		options = extend(defaultOptions(), options);
		options.qrcode.showQRCode = false;
		options.mobile.showInstallTip = false;
		options.extension.openExtension = true;
		payload.memo = options.memo;

		return this._pay.submit(assetId, citizenIdOrName, amount, payload, options);
	},
	simulateCall: function (assetId, to, value, func, args, options) {
		var payload = {
			type: "simulateCall",
			function: func,
			args: args
		};
		options = extend(defaultOptions(), options);
		options.qrcode.showQRCode = false;
		options.mobile.showInstallTip = false;
		options.extension.openExtension = true;
		payload.memo = options.memo;

		return this._pay.submit(assetId, to, value, payload, options);
	},
	invokeContract: function (assetId, to, value, func, args, options) {
		return this.simulateCall.apply(this, arguments);
	 },
	transferToContract: function (assetId, to, value, args, options) {
		var payload = {
			type: "transferToContract",
			args: args
		};
		options = extend(defaultOptions(), options);
		options.qrcode.showQRCode = false;
		options.mobile.showInstallTip = false;
		options.extension.openExtension = true;
		payload.memo = options.memo;

		return this._pay.submit(assetId, to, value, payload, options);
	},
	queryPayInfo: function (serialNumber, options) {
		options = extend(defaultOptions(), options);
		var url = options.callback || config.payUrl(options.debug);
		url = url + "/query?payId=" + serialNumber;
		return http.get(url);
	}
};

module.exports = HxPay;

