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
};

module.exports = Kyber;
