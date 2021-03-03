const CoinbasePro = require('coinbase-pro');
require('dotenv').config();
const CronJob = require('cron').CronJob;

const sendText = require('./sendText');

const authedClient = new CoinbasePro.AuthenticatedClient(
  process.env.COINBASE_API_KEY,
  process.env.COINBASE_API_SECRET,
  process.env.COINBASE_PASSPHRASE,
  process.env.COINBASE_API_ENDPOINT
);

const BUY = 'buy';
const MARKET = 'market';
const USD = 'USD';
const USD_TO_SPEND = Number(process.env.USD_TO_SPEND_PER_ORDER);

const placeOrder = async ({ assetCode, usdToOrder }) => {
  try {
    const order = {
      side: BUY,
      product_id: assetCode + '-' + USD,
      funds: usdToOrder,
      type: MARKET,
    };

    const orderRes = await authedClient.placeOrder(order);

    console.log(JSON.stringify(orderRes, null, '\t'));

    sendText(
      [
        `${assetCode} ORDER SUCCESSFUL`,
        Object.entries(orderRes).reduce((acc, [key, value]) => {
          acc.push(`${key}: ${value}`);
          return acc;
        }, []),
      ].join('\n')
    );
  } catch (e) {
    console.error(e.message);
    sendText(
      [
        `${assetCode} ORDER FAILED`,
        `USD Total: $${USD_TO_SPEND}`,
        `Error: ${e.message}`,
      ].join('\n')
    );
  }
};

const buyCyrpto = async () => {
  const assets = require('../assets');

  assets.forEach(placeOrder);
};

var job = new CronJob(
  process.env.CRON,
  buyCyrpto,
  null,
  true,
  'America/Chicago'
);

job.start();
