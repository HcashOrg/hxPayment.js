hxPay.js Document
=======================

hx payment javascript sdk. 

SDK that allows Dapps intergrated with hxExtWallet or hx mobile wallet.

# Examples

* [Red Packet Dapp demo](../examples/redpacket_dapp.html)
* [TODO List Dapp demo](../examples/todolist_dapp.html)


# Build


```
npm run build
```

# Install

include the dist/hxPay.min.js to your dapp html file

# Usage

* connect to wallet(hx chrome extension wallet or hx mobile wallet like anybit)

```
    hxPay.onConnectedWallet()
        .then(() => {
            // get config of current wallet state
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
                    this.nodeClient = new NodeClient(this.apisInstance);
                    // do other things using nodeClient

                    hxPay.getUserAddress()
                        .then(({ address, pubKey, pubKeyString }) => {
                            console.log('address', address);
                            console.log('pubKey', pubKey);
                            console.log('pubKeyStr', pubKeyString);
                        }, (err) => {
                        });
                }, (err) => {
                })
        });
```

* transfer to contract

```
    const hxPayListener = (serialNumber, resp, name) => {
        console.log("resp: " + JSON.stringify(resp));
        this.lastSerialNumber = serialNumber;
        if (name === 'txhash') {
            const txid = resp;
            this.lastTxid = txid;
            hxPay.waitTransaction(this.nodeClient, txid)
                .then((tx) => {
                    console.log("found tx", tx);
                    alert("transaction successfully");
                }, this.showError);
        } else {
            this.lastResponse = resp;
        }
    };
    const assetId = "1.3.0";
    const to = this.contractAddress;
    const value = 1;
    const gasPrice = '0.00001';
    const gasLimit = 5000;
    hxPay.transferToContract(assetId, to, value, [], {
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        listener: hxPayListener.bind(this)
    });
```

* invoke contract api

```
    const assetId = "1.3.0"; // asset HX's asset id
    const to = this.contractAddress;
    const value = 0;
    const callFunction = "contractApiName"
    const callArgs = "contractArgument";
    hxPay.simulateCall(assetId, to, value, callFunction, callArgs, {
        gasPrice: '0.00001',
        gasLimit: 5000,
        listener: hxPayListener.bind(this)
    });
```

* transfer to address

```
    const assetId = "1.3.0"
    const to = "targetAddress";
    const value = '1.2345'; // transfer amount
    hxPay.pay(assetId, to, value, {
        listener: hxPayListener.bind(this)
    });
```

* use wallet's private key to sign text

```
    const orderSigCallbacks = {}; // orderNonce => Function<signature, error, void_result>
    let lastSigOrderNonce = null;

    function bindOrderSigCallback(orderNonce, callback) {
        orderSigCallbacks[orderNonce] = callback;
        lastSigOrderNonce = orderNonce;
    }
    const hxSigListen = (serialNumber, resp, name) => {
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
            if (lastSigOrderKey) {
                const callback = orderSigCallbacks[lastSigOrderKey];
                if (callback) {
                    callback(sigHex);
                }
            }
        }
    };
    const orderId = "demoOrderId";
    const cancelOrderStr = `{"type":"cancel","orderId":"${orderId}"}`;
    hxPay.signBufferText(cancelOrderStr, {
        listener: hxSigListener.bind(this)
    });
```

# API

* pay: function (assetId, to, value, options)

notify wallet to transfer asset to other address

* signBufferText: function (text, options)

notify wallet to use wallet's private key to sign text message

* setConfig: function(chainId, networkKey, optionalNodeRpcUrl, optionalNodeClientRpcUrl): return Promise of result

notify wallet to use specified hx chain and network

* onConnectedWallet: function(): return Promise

try to connect to wallet(hx chrome extension wallet or hx mobile wallet). return Promise of connect status

* getConfig: function (): return Promise of config info

* getConfigWithCache: function (): return Promise of config info

* getUserAddress: function (): return Promise of wallet's current address

* waitTransaction: function (nodeClient, txid, timeout): return Promise of sent transaction status

* lockBalanceToCitizen: function(citizenIdOrName, assetId, amount, options)

notify wallet to lock user's balances to specified citizen

* invokeContract: function (assetId, to, value, func, args, options)

notify wallet to invoke contract's api with argument

* simulateCall: function (assetId, to, value, func, args, options)

same as invokeContract api

* transferToContract: function (assetId, to, value, args, options)

notify wallet to transfer some asset to specified contract address

* queryPayInfo: function (serialNumber, options): return Promise of sent payId/serialNumber state

when HxExtWallet or hx mobile wallet send a transaction in dapp usage, they can bind the transaction's payId to txid. and Dapp can use hxPay.queryPayInfo to query payId's txid and transaction state.
