const CoinbasePro = require('coinbase-pro');
require('dotenv').config();
const CronJob = require('cron').CronJob;

const sendText = require('./sendText');

const coinbase = new CoinbasePro.AuthenticatedClient(
  process.env.COINBASE_API_KEY,
  process.env.COINBASE_API_SECRET,
  process.env.COINBASE_PASSPHRASE,
  process.env.COINBASE_API_ENDPOINT
);

const BUY = 'buy';
const MARKET = 'market';
const USD = 'USD';

const placeOrder = async ({ assetCode, usdToOrder }) => {
  try {
    const order = {
      side: BUY,
      product_id: assetCode + '-' + USD,
      funds: usdToOrder,
      type: MARKET,
    };

    const orderRes = await coinbase.placeOrder(order);

    console.log(JSON.stringify(orderRes, null, '\t'));
  } catch (e) {
    console.error(e.message);
    sendText(
      [
        `${assetCode} ORDER FAILED`,
        `USD Total: $${usdToOrder}`,
        `Error: ${e.message}`,
      ].join('\n')
    );
  }
};

const buyCrypto = async () => {
  delete require.cache[require.resolve('./assets')];
  const assets = require('../assets');
  assets.forEach(placeOrder);
};

var job = new CronJob(
  process.env.CRON,
  buyCrypto,
  null,
  true,
  'America/Chicago'
);

job.start();
