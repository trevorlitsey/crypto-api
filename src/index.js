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
const BITCOIN = 'BTC';
const USD = 'USD';
const PRODUCT_ID = BITCOIN + '-' + USD;
const USD_TO_SPEND = 10;

const buyCyrpto = async () => {
  try {
    const order = {
      side: BUY,
      product_id: PRODUCT_ID,
      funds: USD_TO_SPEND,
      type: MARKET,
    };

    const orderRes = await authedClient.placeOrder(order);

    console.log(JSON.stringify(orderRes, null, '\t'));

    sendText(
      ['BITCOIN ORDER SUCCESSFUL', JSON.stringify(orderRes, null, '\t')].join(
        '\n'
      )
    );
  } catch (e) {
    console.error(e.message);
    sendText(
      [
        'BITCOIN ORDER FAILED',
        `USD Total: $${USD_TO_SPEND}`,
        `Error: ${e.message}`,
      ].join('\n')
    );
  }
};

var job = new CronJob(
  process.env.CRON,
  buyCyrpto,
  null,
  true,
  'America/Chicago'
);

job.start();
