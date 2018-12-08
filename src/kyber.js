const config = require('../common/config.json');
const fetch = require('node-fetch');

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
};

module.exports = Kyber;
