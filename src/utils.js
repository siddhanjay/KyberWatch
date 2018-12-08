const config = require('../common/config.json');

const Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider(config.infura.mainnet.host));

const getLastBlockBeforeTimestamp = async (currentBlock, timestamp) => {
  // Find the block closest to stop.
  // Assuming 1 block per 15 seconds.
  let lastBlockTimestamp = currentBlock.timestamp;
  let diffBlocks = Math.floor((lastBlockTimestamp - timestamp) / 15);
  let lastBlock = currentBlock.block - diffBlocks;

  do {
    try {
      lastBlockTimestamp = (await web3.eth.getBlock(lastBlock)).timestamp;
    } catch (err) {
      console.log(err);
      break;
    }
    if (lastBlockTimestamp > timestamp) {
      diffBlocks = Math.floor((lastBlockTimestamp - timestamp) / 15);
      diffBlocks = diffBlocks == 0 ? 1 : diffBlocks;
      lastBlock -= diffBlocks;
    } else {
      try {
        const nextBlockTimestamp = (await web3.eth.getBlock(lastBlock + 1)).timestamp;
        if (nextBlockTimestamp >= timestamp) {
          lastBlock = (nextBlockTimestamp === timestamp) ? lastBlock + 1 : lastBlock;
          break;
        }
        ++lastBlock;
      } catch (err) {
        console.log(err.message);
        break;
      }
    }
  } while (true);

  return lastBlock;
}

const getFirstBlockAfterTimestamp = async (lastBlock, timestamp) => {
  // Find the block closest to start.
  // Assuming 1 block per 15 seconds.
  let startBlockTimestamp = lastBlock.timestamp;
  diffBlocks = Math.floor((startBlockTimestamp - timestamp) / 15);
  let startBlock = lastBlock.block - diffBlocks;

  do {
    if (startBlock == 0) {
      break;
    }
    startBlockTimestamp = (await web3.eth.getBlock(startBlock)).timestamp;
    if (startBlockTimestamp < timestamp) {
      ++startBlock;
    } else {
      const prevBlockTimestamp = (await web3.eth.getBlock(startBlock - 1)).timestamp;
      if (prevBlockTimestamp <= timestamp) {
        startBlock = (prevBlockTimestamp === timestamp) ? (startBlock - 1) : startBlock;
        break;
      }

      diffBlocks = Math.floor((startBlockTimestamp - timestamp) / 15);
      if (diffBlocks === 0) {
        break;
      }
      startBlock -= diffBlocks;
    }
  } while (true);

  return startBlock;
}

const Utils = {
  getBlocksBetweenTimestamps: async (start, stop) => {
    const currentBlock = await web3.eth.getBlockNumber();
    const currentBlockTimestamp = (await web3.eth.getBlock(currentBlock)).timestamp;

    // Sanitize range if out of bound.
    start = (start < 0) ? 0 : start;
    stop = (stop > currentBlockTimestamp) ? currentBlockTimestamp : stop;

    const stopBlock = await getLastBlockBeforeTimestamp(
      {block: currentBlock, timestamp: currentBlockTimestamp}, stop);
    const startBlock = await getFirstBlockAfterTimestamp(
      {block: stopBlock, timestamp: (await web3.eth.getBlock(stopBlock)).timestamp}, start);

    return {
      startBlock: startBlock,
      stopBlock: stopBlock,
    };
  },

  isValidTimestamp: (timestamp) => {
    const newTimestamp = new Date(timestamp).getTime();
    return !isNaN(parseFloat(newTimestamp)) && isFinite(newTimestamp);
  },
};

module.exports = Utils;
