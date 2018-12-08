const config = require('../common/config.json');
const Utils = require('./utils.js');
const EtherScan = require('./etherscan.js');

const mysql = require('mysql');

class DB {
  constructor() {
    this.connection = mysql.createConnection({
      host: config.aws.mysql.host,
      user: config.aws.mysql.username,
      database: config.aws.mysql.database,
      password: config.aws.mysql.password
    });

    this.connection.connect();
  }

  async retrieveAndInsert(token, blocks) {
    const total = blocks.stopBlock - blocks.startBlock + 1;
    console.log('Need to find ' + total + ' blocks from blockchain');

    const insertQuery = (args) => {
      return new Promise((resolve, reject) => {
        this.connection.query({
          sql: 'INSERT INTO token_trades(token, timestamp, quantity, price, block) VALUES(?,FROM_UNIXTIME(?),?,?,?)',
          timeout: 4000, // 4s
          values: [args.token, args.timestamp, args.quantity, args.price, args.block],
        }, (error, results, field) => {
          if (error) {
            console.log('failed to insert into DB');
            reject(error);
            return;
          }
          resolve(null);
        });
      });
    };

    // Batch the api calls if there is too many blocks.
    for (let start = blocks.startBlock; start <= blocks.stopBlock; start += 10) {
      const stop = (start + 9) > blocks.stopBlock ? blocks.stopBlock : start + 9;
      let txns = null;
      try {
        txns = await EtherScan.getTokenTxnsByAddressAndToken({
          token: token,
          startBlock: start,
          stopBlock: stop,
        });
      } catch (err) {
        console.log(err.message);
        continue;
      }
      if (txns === null || txns.results === null || txns.results.length === 0) {
        console.log('unable to find any transactions!');
        continue;
      }

      console.log('inserting ' + txns.results.length + ' into the DB');
      for (let i = 0; i < txns.results.length; ++i) {
        const args = {
          token: txns.token,
          timestamp: txns.results[i].timestamp,
          quantity: txns.results[i].quantity,
          price: 1,
          block: txns.results[i].block
        };
        await insertQuery(args);
      }
    }
    console.log('finished writing everything to DB');
  }

  async getTokenTradeData(token, start, stop) {
    // Find the data that is present in the DB within this timestamp.
    const getQuery = () => {
      return new Promise((resolve, reject) => {
        this.connection.query({
          sql: 'SELECT *, UNIX_TIMESTAMP(timestamp) as timestamp  FROM `token_trades` WHERE `timestamp` BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?) ORDER BY `timestamp` DESC',
          timeout: 4000, // 4s
          values: [start, stop],
        }, (error, results, fields) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(results);
        });
      });
    };

    console.log(`trying to retrieve the trade data between ${start} and ${stop}`);
    const results = await getQuery();
    if (results && results.length > 0) {
      console.log('Found in DB');

      const lastBlockTimestamp = results[0].timestamp;
      if (stop > lastBlockTimestamp) {
        // get blocks from (lastBlockTimestamp + 1, stop)
        const blocks = await Utils.getBlocksBetweenTimestamps(lastBlockTimestamp + 1, stop);
        await this.retrieveAndInsert(token, blocks);
      }

      if (results.length > 1) {
        const firstBlockTimestamp = results[results.length - 1].timestamp;
        if (start < firstBlockTimestamp) {
          // get blocks from (start, firstBlockTimestamp - 1)
          const blocks = await Utils.getBlocksBetweenTimestamps(start, firstBlockTimestamp - 1);
          await this.retrieveAndInsert(token, blocks);
        }
      }
    } else {
      // get blocks from (start, stop) from blockchain
      console.log('Not in DB. Dig into Blockchain');
      const blocks = await Utils.getBlocksBetweenTimestamps(start, stop);

      console.log(`Blocks between ${blocks.startBlock} and ${blocks.stopBlock} to be retrieved`);
      await this.retrieveAndInsert(token, blocks);
    }

    const newResults = await getQuery();
    return newResults;
  }
};

module.exports = DB;
