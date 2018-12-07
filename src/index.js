const express = require('express');
const config = require('../common/config.json');
const Kyber = require('./kyber.js');

const app = express();
const port = process.env.PORT || 80;

// Return a list of currencies supported by Kyber.
app.get(config.app.path + '/kyber/currencies', async (req, res) => {
  let currencies = [];
  try {
    currencies = await Kyber.getSupportedCurrencies();
  } catch (err) {
  }

  res.status(200).send({status: "ok", results: currencies});
});

app.listen(port, () => console.log(`app listening on ${port}`));
