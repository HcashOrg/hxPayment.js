const HxPay = require("hxpay");
const hxPay = new HxPay();

const {
    PrivateKey,
    PublicKey,
    Address,
    key,
    TransactionBuilder,
    TransactionHelper,
    Apis,
    ChainConfig
} = hx_js;

const app = new Vue({
    el: '#app',
    data: {
        contractAddress: 'HXCaPs4VynvySuVAQFEG6jvWML9DggEG3Srm',
        myAddress: null,
        myPubKey: null,
        contractHxBalance: 0,
        myBonus: 0,
        hxConfig: null,
        apisInstance: null,

        lastSerialNumber: null,
        lastResponse: null,
        lastTxid: null,
    },
    mounted() {
        hxPay.getConfig()
            .then((config) => {
                console.log('config', config);
                if (!config) {
                    alert("please install hx extension wallet first");
                    return;
                }
                this.hxConfig = config;
                ChainConfig.setChainId(config.chainId);
                this.apisInstance = Apis.instance(config.network, true);
                this.loadInfo();
            }, (err) => {
                console.log('get config error', err);
                this.showError(err);
            })
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

    },
    methods: {
        hxPayListener(serialNumber, resp, name) {
            console.log("resp: " + JSON.stringify(resp));
            this.lastSerialNumber = serialNumber;
            if (name === 'txhash') {
                const txid = resp;
                this.lastTxid = txid;
                hxPay.waitTransaction(this.apisInstance, txid)
                    .then((tx) => {
                        console.log("found tx", tx);
                        alert("transaction successfully");
                    }, this.showError);
            } else {
                this.lastResponse = resp;
            }
        },
        receiveFromRedPacket() {
            this.apisInstance.init_promise
                .then(() => {
                    var assetId = "1.3.0";
                    var to = this.contractAddress;
                    var value = 0;
                    var callFunction = "getBonus"
                    var callArgs = "_";
                    hxPay.simulateCall(assetId, to, value, callFunction, callArgs, {
                        gasPrice: '0.00001',
                        gasLimit: 5000,
                        listener: this.hxPayListener.bind(this)
                    });
                }).catch(this.showError);
        },
        testGetState() {
            this.apisInstance.init_promise
                .then(() => {
                    var assetId = "1.3.0";
                    var to = this.contractAddress;
                    var value = 0;
                    var callFunction = "getState"
                    var callArgs = "_";
                    hxPay.simulateCall(assetId, to, value, callFunction, callArgs, {
                        gasPrice: '0.00001',
                        gasLimit: 5000,
                        listener: this.hxPayListener.bind(this)
                    });
                }).catch(this.showError);
        },
        loadInfo() {
            this.apisInstance.init_promise
                .then(() => {
                    TransactionHelper.getContractBalances(this.apisInstance, this.contractAddress)
                        .then(balances => {
                            console.log("contract balances: ", balances);
                            this.contractHxBalance = 0;
                            for (const balance of balances) {
                                if (balance.asset_id === '1.3.0') {
                                    this.contractHxBalance = balance.amount;
                                }
                            }
                        }).catch(this.showError);
                    if (this.myPubKey) {
                        TransactionHelper.invokeContractOffline(
                            this.apisInstance,
                            this.myPubKey,
                            this.contractAddress,
                            'checkBonus',
                            this.myAddress
                        ).then(result => {
                            console.log("checkBonus result: ", result);
                            this.myBonus = parseInt(result);
                        }).catch(this.showError);
                    }
                }).catch(this.showError);
        },
        showError(err) {
            alert(JSON.stringify(err));
        }
    }
});