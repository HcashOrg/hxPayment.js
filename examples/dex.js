const HxPay = require("hxpay");
const hxPay = new HxPay();

const {
    PrivateKey,
    PublicKey,
    Address,
    key,
    TransactionBuilder,
    TransactionHelper,
    NodeClient,
    Apis,
    ChainConfig
} = hx_js;

const orderSigCallbacks = {}; // orderNonce => Function<signature, error, void_result>
let lastSigOrderNonce = null;

function bindOrderSigCallback(orderNonce, callback) {
    orderSigCallbacks[orderNonce] = callback;
    lastSigOrderNonce = orderNonce;
}

const app = new Vue({
    el: '#app',
    data: {
        contractAddress: '',
        myAddress: null,
        myPubKey: null,

        apisInstance: null,
        nodeClient: null,

        lastSerialNumber: null,
        lastResponse: null,
        lastTxid: null,

        addOrderForm: {
            tradeAsset: 'BTC',
            baseAsset: 'HX',
            price: 4000,
            amount: null,
            tradeAssetPricision: 100000000
        },
        orderBook : {
            asks: [],
            bids: [],
        },

        dexEngineEndpoint: "http://127.0.0.1:40000/api",
    },
    mounted() {
        hxPay.getConfig()
            .then((config) => {
                console.log('config', config);
                if (!config) {
                    this.showError("please install hx extension wallet first");
                    return;
                }

                this.hxConfig = config;
                ChainConfig.setChainId(config.chainId);
                this.apisInstance = Apis.instance(config.network, true);
                this.nodeClient = new NodeClient(this.apisInstance);
                this.loadInfo();

                hxPay.getUserAddress()
                    .then(({ address, pubKey, pubKeyString }) => {
                        console.log('address', address);
                        console.log('pubKey', pubKey);
                        console.log('pubKeyStr', pubKeyString);
                        this.myAddress = address;
                        this.myPubKey = pubKey;
                    }, (err) => {
                        this.showError(err);
                    });

            }, (err) => {
                console.log('get config error', err);
                this.showError(err);
                const config = hxPay.defaultConfig;

                this.hxConfig = config;
                ChainConfig.setChainId(config.chainId);
                this.apisInstance = Apis.instance(config.network, true);
                this.nodeClient = new NodeClient(this.apisInstance);
                this.loadInfo();
            })

    },
    methods: {
        waitTxByPayId(payId) {
            setTimeout(() => {
                hxPay.queryPayInfo(payId, {
                    callback: 'http://wallet.hx.cash/api',
                }).then((result) => {
                    console.log("get tx by payId result", result);
                }).catch((e) => {
                    console.log("get tx by payId error", e);
                })
            }, 6000);
        },
        hxSigListener(serialNumber, resp, name) {
            console.log("resp: " + JSON.stringify(resp));
            console.log("name: " + name);
            this.lastSerialNumber = serialNumber;
            console.log("serialNumber: ", serialNumber);
            // you can get txid by serialNumber(on web or mobile app) or use txid(only on web)
            this.waitTxByPayId(serialNumber);
            if (name === 'sig') {
                const sigHex = resp;
                console.log("got sig", sigHex);
                const lastSigOrderKey = lastSigOrderNonce;
                if(lastSigOrderKey) {
                    const callback = orderSigCallbacks[lastSigOrderKey];
                    if(callback) {
                        callback(sigHex);
                    }
                }
            }
            // TODO: orderSigCallbacks 中order签名的超时失败回调
        },
        hxPayListener(serialNumber, resp, name) {
            console.log("resp: " + JSON.stringify(resp));
            console.log("name: " + name);
            this.lastSerialNumber = serialNumber;
            console.log("serialNumber: ", serialNumber);
            // you can get txid by serialNumber(on web or mobile app) or use txid(only on web)
            this.waitTxByPayId(serialNumber);
            if (name === 'txhash') {
                const txid = resp;
                this.lastTxid = txid;
                hxPay.waitTransaction(this.nodeClient, txid)
                    .then((tx) => {
                        console.log("found tx", tx);
                        alert("transaction successfully");
                        this.loadInfo();
                    }, this.showError);
            } else if (name === 'sig') {
                const sigHex = resp;
                console.log("got sig", sigHex);
                this.showError("Siganture: " + sigHex);
            } else {
                this.lastResponse = resp;
            }
        },

        loadInfo() {
            this.nodeClient.afterInited()
                .then(() => {
                    this.nodeClient.execDbApi('get_dynamic_global_properties').then(info => {
                        console.log("info", info);
                    }).catch(this.showError);

                    const dummyPubKey = 'HX8mT7XvtTARjdZQ9bqHRoJRMf7P7azFqTQACckaVenM2GmJyxLh';

                    this.updateDexStatus();

                }).catch(this.showError);

            this.updateOrderbook();
        },
        showError(err) {
            alert(JSON.stringify(err));
        },
        requestDexRpc(method, params) {
            return axios.post(this.dexEngineEndpoint, {
                method: method,
                params: params,
                id: 1,
            })
                .then((res) => {
                    return res.data;
                })
                .then((res) => {
                    return new Promise((resolve, reject) => {
                        if (!res) {
                            reject("invalid jsonrpc response format");
                            return;
                        }
                        if (res.error) {
                            reject(res.error);
                            return;
                        }
                        resolve(res.result);
                    });
                });
        },
        updateDexStatus() {
            this.requestDexRpc("GetStatus", {})
                .then((status)=> {
                    console.log("status", status)
                }).catch(this.showError);
        },
        updateOrderbook() {
            this.requestDexRpc("QueryAsks", {
                baseAssetSymbol: this.addOrderForm.baseAsset,
                tradeAssetSymbol: this.addOrderForm.tradeAsset,
                limit: 5,
                pricePosition: 5,
            }).then(asks => {
                console.log("asks", asks);
                this.orderBook.asks = asks.items;
            }).catch(this.showError.bind(this));
            this.requestDexRpc("QueryBids", {
                baseAssetSymbol: this.addOrderForm.baseAsset,
                tradeAssetSymbol: this.addOrderForm.tradeAsset,
                limit: 5,
                pricePosition: 5,
            }).then(bids => {
                console.log("bids", bids);
                this.orderBook.bids = bids.items;
            }).catch(this.showError.bind(this));
        },
        // TODO: 展示用户当前挂单，成交历史，最新价格
        // TODO: 合约充值提现，查询在合约内余额
        addOrder(form, isBuy) {
            const tradeAsset = form.tradeAsset;
            const baseAsset = form.baseAsset;
            const price = form.price;
            const priceNum = parseFloat(price);
            const tradeAssetPricision = form.tradeAssetPricision;
            const amount = parseFloat(form.amount);
            if (!amount || amount <= 0) {
                this.showError("invalid amount")
                return;
            }
            if (!priceNum || priceNum <= 0) {
                this.showError("invalid price");
                return;
            }
            const fullAmount = parseInt(amount * tradeAssetPricision);
            const fullBaseAmount = parseInt(priceNum * fullAmount);
            // make order string
            const orderNonce = new Date().getTime().toString();
            const orderInfo = {
                purchaseAsset: isBuy ? tradeAsset : baseAsset,
                purchaseNum: isBuy ? fullAmount : fullBaseAmount,
                payAsset: isBuy ? baseAsset : tradeAsset,
                payNum: isBuy ? fullBaseAmount : fullAmount,
                nonce: orderNonce,
                relayer: 'HXTNa5ZMhvFYXSYN4E2sAKqDVBKZgU9AGEBfZ',
                fee: "0",
                type: isBuy ? "buy" : "sell",
                expiredAt: parseInt(new Date().getTime() / 1000 + 3600),
                version: 1,
            };
            const orderStr = JSON.stringify(orderInfo);
            hxPay.signBufferText(orderStr, {
                listener: this.hxSigListener.bind(this)
            });
            bindOrderSigCallback(orderNonce, (sig, err) => {
                console.log("order sig callback", sig, err);
                // submit order info and sig to dex engine
                this.requestDexRpc("SubmitOrder", {
                    orderRawStr: orderStr,
                    sigHex: '0x' + sig
                }).then((orderId) => {
                    console.log("order " + orderId + " submited to dex engine");
                    // TODO: update order book and current user order history
                    this.updateOrderbook();
                }).catch(this.showError.bind(this));
            });
        },
        addBuyOrder() {
            return this.addOrder(this.addOrderForm, true);
        },
        addSellOrder() {
            return this.addOrder(this.addOrderForm, false);
        },
    }
});