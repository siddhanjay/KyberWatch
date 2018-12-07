const config = require('../common/config.json');
const Utils = require('./utils.js');

const mysql = require('mysql');

class DB {
  constructor() {
    this.connection = mysql.createConnection({
      host: config.aws.mysql.host,
      user: config.aws.mysql.username,
      database: config.aws.mysql.db,
      password: config.aws.mysql.password
    });

    this.connection.connect();
  }

  getTokenTradeData(token, start, stop) {
    // Find the data that is present in the DB within this timestamp.
    const getQuery = () => {
      return new Promise((resolve, reject) => {
        this.connection.query({
          sql: 'SELECT * FROM `token_trades` WHERE `timestamp` BETWEEN ? AND ? ORDER BY `timestamp` DESC',
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

    const insertQuery = (args) => {
      this.connection.query({
        sql: 'INSERT INTO token_trades(token, timestamp, quantity, price, block) VALUES(?,?,?,?,?)',
        timeout: 4000, // 4s
        values: [args.token, args.timestamp, args.quantity, args.price, args.block],
      }, (error, results, field) => {
        return (error) ? false : true;
      });
    };

    getQuery()
    .then((results) => {
      if (results && results.length > 0) {
        const lastBlockTimestamp = results[0].timestamp;
        if (stop > lastBlockTimestamp) {
          // get blocks from (lastBlockTimestamp + 1, stop)
          const blocks = Utils.getBlocksBetweenTimestamps(lastBlockTimestamp + 1, stop);

          // insert them into DB.
        }

        const firstBlockTimestamp = results[results.length - 1].timestamp;
        if (start < firstBlockTimestamp) {
          // get blocks from (start, firstBlockTimestamp - 1)
          const blocks = Utils.getBlocksBetweenTimestamps(start, firstBlockTimestamp - 1);

          // insert them into db.
        }
      } else {
        // get blocks from (start, stop) from blockchain
        const blocks = Utils.getBlocksBetweenTimestamps(start, stop);

        // insert them into db.
      }
    }).catch((err) => {return null});

  }
};

module.exports = DB;
