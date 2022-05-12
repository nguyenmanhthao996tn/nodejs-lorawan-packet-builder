# NodeJS LoRaWAN Packet Builder

## Introduction
This source code demonstrates how to build a <b>LoRaWAN Unconfirmed Uplink Packets</b> from scratch with <b>NodeJS</b>! This is a very simple example for who is new to LoRaWAN and want to understand the packet in LoRaWAN Protocol bit by bit!

<i>If you prefer a C/C++ version for Resource-Limited Systems, check [this](https://github.com/nguyenmanhthao996tn/lorawan-packet-builder) out!</i>

## How-to-use
1. Obviously, you need NodeJS installed on your system to run this source code. You can download and find the install guide for you OS [here](https://nodejs.org/en/download/).
2. Clone this reposistory to your system. You can either download as ZIP with this [link](https://github.com/nguyenmanhthao996tn/nodejs-lorawan-packet-builder/archive/refs/heads/main.zip) or clone by Git with the command:
```
git clone git@github.com:nguyenmanhthao996tn/nodejs-lorawan-packet-builder.git
```
3. Navigate to the source code folder & Install package dependencies
```
npm install --save
```
4. Modify parameters in the source code include <b>Device Address</b>, <b>Network Session Key</b>, <b>Application Session Key</b>, <b>Payload</b>, <b>Port</b>, <b>Frame Counter</b>. Then, save & run your source code.
```
node app.js
```
## Credit
These are the library I use in this source code. If you find it useful, consider to give a star to these reposistories:
- [brix/crypto-js](https://github.com/brix/crypto-js)
- [allan-stewart/node-aes-cmac](https://github.com/allan-stewart/node-aes-cmac)

Thanks & Have a good day!

<i>CGT</i>