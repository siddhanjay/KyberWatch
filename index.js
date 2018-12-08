const express = require('express');
const cors = require('cors');
const etherscan = require('./src/etherscan.js');
const config = require('./common/config.json');

const Kyber = require('./src/kyber.js');
const Utils = require('./src/utils.js');
const DB = require('./src/db.js');
const db = new DB();

const app = express();
const port = process.env.PORT || 80;

app.use(cors());
app.use(express.json());
app.options('*', cors());
app.use(express.static(__dirname + '/public'));

// Return a list of currencies supported by Kyber.
app.get(config.app.path + '/currencies', async (req, res) => {
  let currencies = [];
  try {
    currencies = await Kyber.getSupportedCurrencies();
  } catch (err) {
  }

  res.status(200).send({status: "ok", results: currencies});
});

// Returns a lost of trades in the given token
app.get(config.app.path + '/currencies/:token/trades', async (req, res) => {
  // Check if token is supported.
  try {
    Kyber.checkForTokenSupport(req.params.token);
  } catch (err) {
    res.status(400).send({status: "error", error: err.message});
    return;
  }

  // Check for missing parameters.
  if (typeof req.query.start === 'undefined') {
    res.status(400).send({status: "error", error: "missing start timestamp"});
    return;
  }
  if (typeof req.query.stop === 'undefined') {
    res.status(400).send({status: "error", error: "missing stop timestamp"});
    return;
  }

  // Validate the timestamps.
  // if (!Utils.isValidTimestamp(req.query.start)) {
  //   res.status(400).send({status: "error", error: "invalid start timestamp"});
  //   return;
  // }
  // if (!Utils.isValidTimestamp(req.query.stop)) {
  //   res.status(400).send({status: "error", error: "invalid stop timestamp"});
  //   return;
  // }

  // Convert the timestamp to block numbers.
  const ret = await db.getTokenTradeData(req.params.token, parseInt(req.query.start), parseInt(req.query.stop));
  res.status(200).send({status: "ok", results: ret});
});

// Returns the most recent market stats of the token
app.get(config.app.path + '/currencies/:token/stats', async (req, res) => {
  // Check if token is supported.
  try {
    Kyber.checkForTokenSupport(req.params.token);
  } catch (err) {
    res.status(400).send({status: "error", error: err.message});
    return;
  }

  const stats = await Kyber.getTokenStats(req.params.token);
  res.status(200).send({status: "ok", results: stats});
});

// Returns a list of the most recent orders in Kyber
app.get(config.app.path + '/currencies/orders', async (req, res) => {
  const orders = await Kyber.getLastOrders(req.query.count);
  res.status(200).send({status: "ok", results: orders});
});

app.listen(port, () => console.log(`app listening on ${port}`));
