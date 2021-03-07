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
const LIMIT = 'limit';
const USD = 'USD';
const USD_TO_SPEND = Number(process.env.USD_TO_SPEND_PER_ORDER);

const placeOrder = async ({ assetCode, usdToOrder }) => {
  const productId = assetCode + '-' + USD;

  const product = await authedClient.getProduct24HrStats(productId);

  console.log(JSON.stringify(product, null, '\t'));

  try {
    const marketOrderRes = await authedClient.placeOrder({
      side: BUY,
      product_id: productId,
      funds: usdToOrder,
      type: MARKET,
    });

    console.log(JSON.stringify(marketOrderRes, null, '\t'));
    console.log(Number(product.last * 0.9).toFixed(8));

    const priceMinusTenPercent = (product.last * 0.9).toFixed(2);
    console.log((usdToOrder / priceMinusTenPercent).toFixed(8));
    const limitOrderRes = await authedClient.placeOrder({
      side: BUY,
      product_id: productId,
      price: priceMinusTenPercent,
      size: 0.001,
      type: LIMIT,
      cancel_after: 'day',
    });

    console.log(JSON.stringify(marketOrderRes, null, '\t'));

    sendText(
      [
        `${assetCode} ORDER SUCCESSFUL`,
        ...Object.entries(marketOrderRes).reduce((acc, [key, value]) => {
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
buyCyrpto();

var job = new CronJob(
  process.env.CRON,
  buyCyrpto,
  null,
  true,
  'America/Chicago'
);

// job.start();
