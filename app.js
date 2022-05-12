/**
 * This source code demonstrate how to build a LoRaWAN Unconfirm Uplink Packet from raw data with NodeJS.
 * To use this, modify 6 const parameters at the beginning of this source code.
 * 
 * Filename: app.js
 * Author: nguyenmanhthao996tn
 * Modified: May 12, 2022 02:58 AM
 * 
*/

const DEV_ADDR = '260B7AC6';                          // Device Address (Hex String)
const NWK_S_KEY = 'F34B7EC4653C9E7805AC21442E1B472B'; // Network Session Key (Hex String)
const APP_S_KEY = '2E1B2E2E88363E2216485BA8FDC2CC14'; // Application Session Key (Hex String)
const PAYLOAD = 'HELLOWORLD!';                        // Payload string
const FPORT = 1;                                      // Frame Port
const FCNT = 10;                                      // Frame Counter

var CryptoJS = require("crypto-js");
var aesCmac = require('node-aes-cmac').aesCmac;

var uplink_properties = {
  data: PAYLOAD,
  fport: FPORT,
  fcnt: FCNT
};

var uplink_message = [];

// MType
uplink_message[0] = 0x40; // Unconfirmed data up

// Device Address
var dev_addr_buffer = Buffer.from(DEV_ADDR, 'hex');
uplink_message[1] = dev_addr_buffer.at(3);
uplink_message[2] = dev_addr_buffer.at(2);
uplink_message[3] = dev_addr_buffer.at(1);
uplink_message[4] = dev_addr_buffer.at(0);

// Frame Control
uplink_message[5] = 0x00; // ADR=0 | ACK=0 | FPending=0 | FOptsLen=0

// Frame Counter
uplink_message[6] = (uplink_properties.fcnt & 0xFF);
uplink_message[7] = ((uplink_properties.fcnt >> 8) & 0xFF);

// Frame Port
uplink_message[8] = uplink_properties.fport;

// Frame Payload
var uplink_data_buffer = Buffer.from(uplink_properties.data);
var Frame_Payload = computeFramePayload(uplink_data_buffer, APP_S_KEY, DEV_ADDR, uplink_properties.fcnt);
for (var i = 0; i < uplink_data_buffer.length; i++) {
  uplink_message[9 + i] = Frame_Payload[i];
}
var uplink_message_len = 9 + uplink_data_buffer.length;

// MIC
var full_mic = computeMIC(uplink_message, NWK_S_KEY, DEV_ADDR, uplink_properties.fcnt);
uplink_message[uplink_message_len] = full_mic[0];
uplink_message[uplink_message_len + 1] = full_mic[1];
uplink_message[uplink_message_len + 2] = full_mic[2];
uplink_message[uplink_message_len + 3] = full_mic[3];

var uplink_message_buffer = Buffer.from(uplink_message);
console.log(uplink_message_buffer.toString('hex'));


/**
 * Compute LoRaWAN Uplink Frame Payload with AES-128.
 * 
 * @param data Frame data include headers and encrypted frame payload | Type: Hexadecimal Array
 * @param key LoRaWAN Device Key, use AppSKey for FCnt=0 and NwkSKey for other FCnt | Type: Hex String
 * @param dev_addr LoRaWAN Device Address | Type: Hex String
 * @param fcnt Current frame counter | Type: Number
 * 
 * @returns The encrypted frame payload
*/
function computeFramePayload(data, key, dev_addr, fcnt) {
  var aBlock = [];
  aBlock[0] = 0x01;

  aBlock[1] = 0x00;
  aBlock[2] = 0x00;
  aBlock[3] = 0x00;
  aBlock[4] = 0x00;

  aBlock[5] = 0x00; // Dir: 0x00 = Uplink | 0x01=Downlink

  var dev_addr_buffer = Buffer.from(dev_addr, 'hex');
  aBlock[6] = dev_addr_buffer.at(3);
  aBlock[7] = dev_addr_buffer.at(2);
  aBlock[8] = dev_addr_buffer.at(1);
  aBlock[9] = dev_addr_buffer.at(0);

  aBlock[10] = (fcnt >> 0) & 0x00FF;
  aBlock[11] = (fcnt >> 8) & 0x00FF;
  aBlock[12] = (fcnt >> 16) & 0x00FF;
  aBlock[13] = (fcnt >> 24) & 0x00FF;

  aBlock[14] = 0x00;

  aBlock[15] = 0; // i

  var round = 0;
  var output = [];
  do {
    aBlock[15]++;

    // Compute sBlock AES-128 with key and aBlock
    const data_parse = CryptoJS.enc.Hex.parse(Buffer.from(aBlock).toString('hex'));
    const key_parse = CryptoJS.enc.Hex.parse(key);
    const ivvar = CryptoJS.enc.Hex.parse('0000000000000000000000000000000');
    var cipherText = CryptoJS.AES.encrypt(data_parse, key_parse, { iv: ivvar, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }).ciphertext.toString();
    var sBlock = Buffer.from(cipherText, 'hex');

    var msg_len = data.length;
    console.log(msg_len);
    var len = msg_len;
    if (msg_len > 16) {
      len = 16;
      msg_len -= 16;
    } else {
      len = msg_len;
      msg_len = 0;
    }
    for (var i = 0; i < len; i++) {
      output[16 * round + i] = data[16 * round + i] ^ sBlock[i];
    }
    round++;
  } while (msg_len > 0)

  return output;
}

/**
 * Compute LoRaWAN Uplink MIC with AES-CMAC.
 * 
 * @param data Frame data include headers and encrypted frame payload | Type: Hexadecimal Array
 * @param key LoRaWAN Device Network Key | Type: Hex String
 * @param dev_addr LoRaWAN Device Address | Type: Hex String
 * @param fcnt Current frame counter | Type: Number
 * 
 * @returns Full output of EAS-CMAC Algorithm, only first 4 bytes used as LoRaWAN Packet MIC
*/
function computeMIC(data, key, dev_addr, fcnt) {
  var bBlock = [];
  bBlock[0] = 0x49;

  bBlock[1] = 0x00;
  bBlock[2] = 0x00;
  bBlock[3] = 0x00;
  bBlock[4] = 0x00;

  bBlock[5] = 0x00; // Dir: 0x00 = Uplink | 0x01=Downlink

  var dev_addr_buffer = Buffer.from(dev_addr, 'hex');
  bBlock[6] = dev_addr_buffer.at(3);
  bBlock[7] = dev_addr_buffer.at(2);
  bBlock[8] = dev_addr_buffer.at(1);
  bBlock[9] = dev_addr_buffer.at(0);

  bBlock[10] = (fcnt >> 0) & 0x00FF;
  bBlock[11] = (fcnt >> 8) & 0x00FF;
  bBlock[12] = (fcnt >> 16) & 0x00FF;
  bBlock[13] = (fcnt >> 24) & 0x00FF;

  bBlock[14] = 0x00;

  bBlock[15] = data.length & 0x00ff;

  var bBlock_buffer = Buffer.from(bBlock);
  var data_buffer = Buffer.from(data);
  var Message_buffer = Buffer.concat([bBlock_buffer, data_buffer]);

  var key_buffer = Buffer.from(key, 'hex');

  var options = { returnAsBuffer: true };
  cmac = aesCmac(key_buffer, Message_buffer, options);

  return cmac;
}