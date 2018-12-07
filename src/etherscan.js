const config = require('../common/config.json');
const fetch = require('node-fetch');

const EtherScan = {
  getTokenTxnsByAddress: async (args) => {

    const url = config.etherscan.host +
                '?module=account&action=tokentx' +
                '&address=' + args.address +
                '&startblock=' + args.startBlock + '&endblock=' + args.endBlock +
                '&sort=asc' + '&apikey=' + config.etherscan.apiKey;

    let result = [];

    let data = null;
    try {
      const ret = await fetch(url);
      data = await ret.json();
    } catch (err) {
      console.log(err);
      return result;
    }
    if (data === null || data.result === null) {
      console.log(data);
      return result;
    }

    for (let i = 0; i < data.result.length; ++i) {
      let val = data.result[i];
      if (val.tokenSymbol === '') {
        continue;
      }
      // if (val.to === args.address) {
      //   continue;
      // }

      let amount = parseFloat(val.value) / (Math.pow(10, parseInt(val.tokenDecimal)));
      result.push({
        token: val.tokenSymbol,
        txHash: val.hash,
        timestamp: val.timeStamp,
        block: val.blockNumber,
        quantity: amount,
      });
    }
    return result;
  },

  getTokenTxnsByAddressAndToken: async (args) => {
    const txns = await EtherScan.getTokenTxnsByAddress(args);
    let results = {
      token: args.token,
      startBlock: args.startBlock,
      endBlock: args.endBlock,
      volume: 0,
      results: [],
    };
    if (txns === null || txns.length === 0) {
      return results;
    }

    for (let i = 0; i < txns.length; ++i) {
      const val = txns[i];
      if (val.token !== args.token) {
        continue;
      }
      delete val.token;
      results.volume += val.quantity;
      results.results.push(val);
    }

    return results;
  },
};

module.exports = EtherScan;
