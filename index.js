const express = require('express');
const cors = require('cors');

const config = require('./common/config.json');

const Kyber = require('./src/kyber.js');
const Utils = require('./src/utils.js');
const DB = require('./src/db.js');
const db = new DB();

const app = express();
const port = process.env.PORT || 4000;

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

app.get(config.app.path + '/currencies/:token/trades', async (req, res) => {
  // Check if token is supported.
  let token = null;
  try {
    token = req.params.token;
    const supportedCurrencies = await Kyber.getSupportedCurrencies();
    if (supportedCurrencies.indexOf(token) === -1) {
      throw new Error('Token is not supported by Kyber');
    }
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
  if (!Utils.isValidTimestamp(req.query.start)) {
    res.status(400).send({status: "error", error: "invalid start timestamp"});
    return;
  }
  if (!Utils.isValidTimestamp(req.query.stop)) {
    res.status(400).send({status: "error", error: "invalid stop timestamp"});
    return;
  }

  // Convert the timestamp to block numbers.
  const ret = db.getTokenTradeData(token, req.query.start, req.query.stop);
  res.status(200).send({status: "ok", results: ret});
});

app.listen(port, () => console.log(`app listening on ${port}`));
