const HxPay = require("hxpay");
const hxPay = new HxPay();

let {
    PrivateKey,
    PublicKey,
    Address,
    key,
    TransactionBuilder,
    TransactionHelper
} = hx_js;
let { Apis, ChainConfig } = hx_js.bitshares_ws;

const app = new Vue({
    el: '#app',
    data: {
        contractAddress: 'HXCaPs4VynvySuVAQFEG6jvWML9DggEG3Srm',
        myAddress: null,
        myPubKey: null,
        contractHxBalance: 0,
        myBonus: 0,
        hxConfig: null,
        apiInstance: null,

        lastSerialNumber: null,
        lastResponse: null,
    },
    mounted() {
        hxPay.getConfig()
            .then((config) => {
                console.log('config', config);
                this.hxConfig = config;
                ChainConfig.setChainId(config.chainId);
                this.apiInstance = Apis.instance(config.network, true);
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
        hxPayListener(serialNumber, resp) {
            console.log("resp: " + JSON.stringify(resp));
            this.lastSerialNumber = serialNumber;
            this.lastResponse = resp;
        },
        receiveFromRedPacket() {
            this.apiInstance.init_promise
                .then(() => {
                    var assetId = "1.3.0";
                    var to = this.contractAddress;
                    var value = 0;
                    var callFunction = "getBonus"
                    var callArgs = "_";
                    hxPay.simulateCall(assetId, to, value, callFunction, callArgs, {
                        qrcode: {
                            showQRCode: true
                        },
                        goods: {
                            name: "test",
                            desc: "test goods"
                        },
                        gasPrice: '0.00001',
                        gasLimit: 5000,
                        listener: this.hxPayListener.bind(this)
                    });
                }).catch(this.showError);
        },
        loadInfo() {
            this.apiInstance.init_promise
                .then(() => {
                    TransactionHelper.getContractBalances(this.apiInstance, this.contractAddress)
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
                            this.apiInstance,
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