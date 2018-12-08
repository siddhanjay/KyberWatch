const config = require('../common/config.json');
const fetch = require('node-fetch');
const EtherScan = require('./etherscan.js');

const Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider(config.infura.mainnet.host));

const Kyber = {
  getSupportedCurrencies: async () => {
    let data = [];
    try {
      const ret = await fetch(config.kyber.mainnet.host + '/currencies');
      data = await ret.json();
    } catch (err) {
      throw err;
    }

    // Filter just the token symbols.
    let tokens = [];
    for (let i = 0; i < data.data.length; ++i) {
      tokens.push(data.data[i].symbol);
    }
    return tokens;
  },

  getTokenStats: async (token) => {
    let data = [];
    try {
      const ret = await fetch(config.kyber.mainnet.host + '/market');
      data = await ret.json();
    } catch (err) {
      throw err;
    }

    // Filter out the token we want.
    for (let i = 0; data.data.length; ++i) {
      if (data.data[i].quote_symbol === token) {
        return data.data[i];
      }
    }

    return null;
  },

  checkForTokenSupport: async (token) => {
    try {
      const supportedCurrencies = await Kyber.getSupportedCurrencies();
      if (supportedCurrencies.indexOf(token) === -1) {
        throw new Error('Token is not supported by Kyber');
      }
    } catch (err) {
      throw err;
    }
  },

  getLastOrders: async (count) => {
    currentBlock = await web3.eth.getBlockNumber();

    let results = [];
    do {
      const args = {
        startBlock: currentBlock - 20,
        stopBlock: currentBlock,
        count: count,
        pathAction: 'tokentx',
      };

      try {
        const txns = await EtherScan.getTxnsByAddress(args);
        if (txns.length > 0) {
          results = results.concat(txns.reverse());
          if (results.length >= 2 * count) {
            return results.slice(0, 2 * count);
          }
        }
      } catch (err) {
        console.log(err.message);
        return results;
      }

      currentBlock -= 100;
    } while (true);

    return results;
  },
};

module.exports = Kyber;
