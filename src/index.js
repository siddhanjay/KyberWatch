const express = require('express');
const config = require('../common/config.json');
const Kyber = require('./kyber.js');

const app = express();
const port = process.env.PORT || 80;

// Return a list of currencies supported by Kyber.
app.get(config.app.path + '/currencies', async (req, res) => {
  let currencies = [];
  try {
    currencies = await Kyber.getSupportedCurrencies();
  } catch (err) {
  }

  res.status(200).send({status: "ok", results: currencies});
});

app.get(config.app.path + '/currencies/:token', async (req, res) => {
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

  // Convert the timestamp to block numbers.
  const blocks = Utils.getBlocksBetweenTimestamps(req.query.start, req.query.stop);

  res.status(200).send({status: "ok", message: "Token is supported by Kyber"});
});

app.listen(port, () => console.log(`app listening on ${port}`));
