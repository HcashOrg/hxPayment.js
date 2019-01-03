# hxPay(in development)

[![](https://data.jsdelivr.com/v1/package/npm/hxpay.js/badge)](https://www.jsdelivr.com/package/npm/hxpay.js)

[![NPM](https://nodei.co/npm/hxpay.js.png)](https://nodei.co/npm/hxpay.js/)

This is the hx payment JavaScript API. Users can use it in browser on both PC and mobile. Users can do HX payment through [Chrome extension]  with it.


## Install && Package

Use `npm` to install dependencies:

```
npm install
```

 **Notice:The official version of the package in NPMJS is `hxpay.js`, not `hxpay` and etc.**


Use `gulp` to package the hxPay:

```
gulp
```

Now we can check the newly created files in `/dist`

Here you should see a bunch of js files. 

 * `hxPay.js`: Used in browser side. Including outside dependency.

###### CDN Support
Hxpay has been released to [NPM](https://www.npmjs.com/package/hxpay.js), and developers can use the following code through [CDN](https://www.jsdelivr.com/package/npm/hxpay.js) addition.

```html
<script src="https://cdn.jsdelivr.net/npm/hxpay.js@0.2.1/dist/hxPay.min.js"></script>
```

## Usage

`hxPay.js` is a useful library for HX DApp developers. It provides rich underlying support in web's DApp. It implements the payment functions.

For the usage of hxPay please refer to this example:

* [example](examples/example.html) 

***

#### Chrome extension wallet

An implementation of chrome extension contributed by community is:

* HxExtWallet

The parameter [`options.callback`](/doc/HxPay_Introduction.md#options) is used for querying transaction result. And it's mainnet by default if you don't specify it. 

* to select mainnet: `callback : HxPay.config.mainnetUrl` (default value)
* to select testnet: `callback : HxPay.config.testnetUrl` 

## Documentation

All HxPay SDK documents are in `doc` folder.

* [doc](/doc)

## The process of a transaction using HxPay
![](doc/flow_chart.png)
