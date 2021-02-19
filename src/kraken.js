const KrakenClient = require('kraken-api');

module.exports = new KrakenClient(
  process.env.KRAKEN_API_KEY,
  process.env.KRAKEN_SECRET,
);
