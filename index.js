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

  // Convert the timestamp to block numbers.
  try {
    const ret = await db.getTokenTradeData(req.params.token, parseInt(req.query.start), parseInt(req.query.stop));
    res.status(200).send({status: "ok", results: ret});
  } catch (err) {
    res.status(500).send({status: "error", error: err.message});
  }
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

  try {
    const stats = await Kyber.getTokenStats(req.params.token);
    res.status(200).send({status: "ok", results: stats});
  } catch (err) {
    res.status(500).send({status: "error", error: err.message});
  }
});

app.get(config.app.path + '/test/:token', async (req, res) => {
  // Check if token is supported.
  try {
    Kyber.checkForTokenSupport(req.params.token);
  } catch (err) {
    res.status(400).send({status: "error", error: err.message});
    return;
  }

  // Check for missing parameters.
  if (typeof req.query.startBlock === 'undefined') {
    res.status(400).send({status: "error", error: "missing start block"});
    return;
  }
  if (typeof req.query.stopBlock === 'undefined') {
    res.status(400).send({status: "error", error: "missing stop block"});
    return;
  }

  const stats = await etherscan.getTokenTxnsByAddressAndToken({
    token: req.params.token,
    startBlock: req.query.startBlock,
    stopBlock: req.query.stopBlock
  });
  res.status(200).send({status: "ok", results: stats});
});

// Returns a list of the most recent orders in Kyber
app.get(config.app.path + '/currencies/orders', async (req, res) => {
  try {
    const orders = await Kyber.getLastOrders(parseInt(req.query.count));
    res.status(200).send({status: "ok", results: orders});
  } catch (err) {
    res.status(500).send({status: "error", error: err.message});
  }
});

app.listen(port, () => console.log(`app listening on ${port}`));
