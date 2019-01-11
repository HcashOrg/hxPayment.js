# hxPay

This is the hx payment JavaScript API. Users can use it in browser on both PC and mobile. Users can do HX payment through [Chrome extension]  with it.


## Install && Package

Use `npm` to install dependencies:

```
npm install
```

Use `npm run build` to package the hxPay:

```
npm run build
```

Now we can check the newly created files in `/dist`

Here you should see a bunch of js files. 

 * `hxPay.js`: Used in browser side. Including outside dependency.

## Usage

`hxPay.js` is a useful library for HX DApp developers. It provides rich underlying support in web's DApp. It implements the payment functions.

For the usage of hxPay please refer to this example:

* [example](examples/example.html) 
* [Red Packet Dapp demo](examples/redpacket_dapp.html)

***

#### Chrome extension wallet

An implementation of chrome extension contributed by community is:

* HxExtWallet

The parameter [`options.callback`](/doc/HxPay_Introduction.md#options) is used for querying transaction result. And it's mainnet by default if you don't specify it. 

* to select mainnet: `callback : HxPay.config.mainnetUrl` (default value)
* to select testnet: `callback : HxPay.config.testnetUrl` 
