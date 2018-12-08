const config = require('../common/config.json');
const fetch = require('node-fetch');

const EtherScan = {
  getTxnsByAddress: async (args) => {
    txlistinternal
    const url = config.etherscan.host +
                '?module=account&action=' + args.pathAction +
                '&address=' + config.kyber.mainnet.contract.address +
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
      if (typeof val.isError !== 'undefined' && val.isError === "1") {
        continue;
      }
      if (val.tokenSymbol === '') {
        continue;
      }

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

  getTokenTxnsByAddress: async (args) => {
    args.pathAction = 'tokentx';
    const result = await getTxnsByAddress(args);
    return result;
  },

  getTokenTxnsByAddressAndToken: async (args) => {
    let results = {
      token: args.token,
      startBlock: args.startBlock,
      endBlock: args.endBlock,
      volume: 0,
      results: [],
    };

    const txns = await EtherScan.getTokenTxnsByAddress(args);
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

  getEthTxnsByAddress: async (args) => {
    args.pathAction = 'txlistinternal';
    let results = {
      token: 'ETH',
      startBlock: args.startBlock,
      endBlock: args.endBlock,
      volume: 0,
      results: [],
    };

    const txns = await getTxnsByAddress(args);
    if (txns === null || txns.length === 0) {
      return results;
    }

    for (let i = 0; i < txns.length; ++i) {
      const val = txns[i];
      results.volume += val.quantity;
      results.results.push(val);
    }

    return results;
  },

  getVolume : async (args) => {
    let results = [];

    if (args.token === "ETH") {
      const ethtxns = await EtherScan.getEthTxnsByAddressAndToken(args);
      for (let i = 0; i < ethtxns.results.length; i += 2) {
        const val = ethtxns.results[i];
        let result = {
          timestamp: val.timestamp,
          volume: val.quantity
        };
        results.push(result);
      }
    } else {
      const txns = await EtherScan.getTokenTxnsByAddressAndToken(args);
      for (let i = 0; i < txns.results.length; i += 2) {
        const val = txns.results[i];
        let result = {
          timeStamp: val.timestamp,
          volume: val.quantity
        };
        results.push(result);
      }
    }

    return results;
  },

};

module.exports = EtherScan;
