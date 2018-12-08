const config = require('../common/config.json');
const fetch = require('node-fetch');

const EtherScan = {
  getTxnsByAddress: async (args) => {
    const url = config.etherscan.host +
                '?module=account&action=' + args.pathAction +
                '&address=' + config.kyber.mainnet.contract.KyberNetwork +
                '&startblock=' + args.startBlock + '&endblock=' + args.stopBlock +
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
      if (typeof val.isError !== 'undefined' && val.isError == "1") {
        continue;
      }
      if (val.tokenSymbol === '') {
        continue;
      }

      let amount = parseFloat(val.value) / (Math.pow(10, parseInt(val.tokenDecimal)));
      const prices = await EtherScan.getPrices({token: args.token ,timeStamp:val.timeStamp });

      result.push({
        token: val.tokenSymbol,
        txHash: val.hash,
        timestamp: parseInt(val.timeStamp),
        block: val.blockNumber,
        quantity: amount,
        priceUSD: prices.USD,
        priceETH: prices.ETH
      });
    }
    return result;
  },

  getTokenTxnsByAddress: async (args) => {
    args.pathAction = (typeof args.token !== 'undefined' && args.token === 'ETH') ? 'txlistinternal': 'tokentx';
    const result = await EtherScan.getTxnsByAddress(args);
    return result;
  },

  getTokenTxnsByAddressAndToken: async (args) => {
    let results = {
      token: args.token,
      startBlock: args.startBlock,
      stopBlock: args.stopBlock,
      volume: 0,
      results: [],
      pricesUSD: [],
      pricesETH: []
    };

    const txns = await EtherScan.getTokenTxnsByAddress(args);
    if (txns === null || txns.length === 0) {
      return results;
    }

    for (let i = 0; i < txns.length; i += 2) {
      const val = txns[i];
      if (val.token !== args.token) {
        continue;
      }
      delete val.token;
      results.volume += val.quantity;
      results.results.push(val);
      results.pricesUSD.push({timeStamp: val.timestamp , price:val.priceUSD});
      results.pricesETH.push({timeStamp: val.timestamp , price:val.priceETH});
    }

    return results;
  },

  getPrices: async (args) => {
    const priceUrl = config.cryptocompare.host +
                '/pricehistorical?fsym=' + args.token +
                '&tsyms=ETH,USD' +
                '&timestamp=' + args.timeStamp
                '&apikey=' + config.cryptocompare.apiKey;

    let result = [];

    let data = null;
    try {
      const ret = await fetch(priceUrl);
      data = await ret.json();
    } catch (err) {
      return result;
    }

    if (data === null || data.result === null) {
      return result;
    }
    return data[args.token];
  }

};

module.exports = EtherScan;
