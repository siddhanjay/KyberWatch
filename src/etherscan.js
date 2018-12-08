const config = require('../common/config.json');
const fetch = require('node-fetch');

const EtherScan = {
  getTokenTxnsByAddress: async (args) => {

    const url = config.etherscan.host +
                '?module=account&action=tokentx' +
                '&address=0x91a502C678605fbCe581eae053319747482276b9' +
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

  getEthTxnsByAddress: async (args) => {

    const url = config.etherscan.host +
                '?module=account&action=txlistinternal' +
                '&address=0x91a502C678605fbCe581eae053319747482276b9'  +
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
      if(val.isError === "1") 
        continue;
      let amount = parseFloat(val.value) / (Math.pow(10, parseInt(18)));
      result.push({
        token: "ETH",
        txHash: val.hash,
        timestamp: val.timeStamp,
        block: val.blockNumber,
        quantity: amount,
      });
    }
    return result;
  },

  getEthTxnsByAddressAndToken: async (args) => {
    const txns = await EtherScan.getEthTxnsByAddress(args);
    let results = {
      token: "ETH",
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
      results.volume += val.quantity;
      results.results.push(val);
    }

    return results;
  },

  getVolume : async (args) => {
    let results = [];
    let result = {
      timeStamp : null,
      volume : 0
    };

    
    let map = {};
    if(args.token === "ETH"){
      const ethtxns = await EtherScan.getEthTxnsByAddressAndToken(args);
      for(let i=0;i<ethtxns.results.length;i+=2){
        const val = ethtxns.results[i];

        let result = {
          timeStamp : val.timestamp,
          volume : val.quantity
        };
          results.push(result);
      } 
    } else {
      const txns = await EtherScan.getTokenTxnsByAddressAndToken(args);
      for(let i=0;i<txns.results.length;i+=2){
        const val = txns.results[i];
        let result = {
          timeStamp : val.timestamp,
          volume : val.quantity
        };
          results.push(result);
      }
    }
    
    return results;
    
  },

};

module.exports = EtherScan;
