const express = require('express');
const config = require('../common/config.json');

const app = express();
const port = process.env.PORT || 80;

// Return a list of currencies supported by Kyber.
app.get(config.app.path + '/kyber/currencies', (req, res) => {
  res.status(200).send({status: "ok", results: []});
});

app.listen(port, () => console.log(`app listening on ${port}`));
