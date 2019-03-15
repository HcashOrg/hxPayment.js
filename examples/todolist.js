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

const app = new Vue({
    el: '#app',
    data: {
        contractAddress: 'HXCQjjhJNDjz8gTtqvAWneocsEP3teAbmsvw',
        myAddress: null,
        myPubKey: null,
        contractHxBalance: 0,

        apisInstance: null,
        nodeClient: null,

        lastSerialNumber: null,
        lastResponse: null,
        lastTxid: null,

        queryForm: {},
        createForm: {},
        myTodoList: [],
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
                        this.queryForm.address = address;
                        this.myPubKey = pubKey;
                        this.loadInfo();
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
        hxPayListener(serialNumber, resp, name) {
            console.log("resp: " + JSON.stringify(resp));
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
            } else {
                this.lastResponse = resp;
            }
        },
        donateToCitizen() {
            this.nodeClient.afterInited()
                .then(() => {
                    var assetId = "1.3.0";
                    hxPay.lockBalanceToCitizen('zoowii', assetId, 1, {
                        listener: this.hxPayListener.bind(this)
                    });
                }).catch(this.showError);
        },
        createTodoItem() {
            const content = this.createForm.content || '';
            if (content.length < 1) {
                this.showError("content can't be empty");
                return;
            }
            if (content.length > 400) {
                this.showError("too long content");
                return;
            }
            this.nodeClient.afterInited()
                .then(() => {
                    var assetId = "1.3.0";
                    var to = this.contractAddress;
                    var value = 0;
                    var callFunction = "addTodo"
                    var callArgs = content;
                    hxPay.simulateCall(assetId, to, value, callFunction, callArgs, {
                        gasPrice: '0.00001',
                        gasLimit: 5000,
                        listener: this.hxPayListener.bind(this)
                    });
                }).catch(this.showError);
        },
        queryTodos() {
            this.loadInfo();
        },
        loadInfo() {
            this.nodeClient.afterInited()
                .then(() => {
                    this.nodeClient.execDbApi('get_dynamic_global_properties').then(info => {
                        console.log("info", info);
                    }).catch(this.showError);
                    this.nodeClient.getContractBalances(this.contractAddress)
                        .then(balances => {
                            console.log("contract balances: ", balances);
                            this.contractHxBalance = 0;
                            for (const balance of balances) {
                                if (balance.asset_id === '1.3.0') {
                                    this.contractHxBalance = balance.amount;
                                }
                            }
                        }).catch(this.showError);
                    const dummyPubKey = 'HX8mT7XvtTARjdZQ9bqHRoJRMf7P7azFqTQACckaVenM2GmJyxLh';
                    this.nodeClient.invokeContractOffline(
                        this.myPubKey || dummyPubKey,
                        this.contractAddress,
                        'listTodosOfUser',
                        this.queryForm.address || this.myAddress
                    ).then(result => {
                        console.log("listTodosOfUser result: ", result);
                        this.myTodoList = JSON.parse(result);
                    }).catch(this.showError);

                }).catch(this.showError);
        },
        showError(err) {
            alert(JSON.stringify(err));
        }
    }
});