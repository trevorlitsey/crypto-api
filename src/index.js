require('dotenv').config();
const CronJob = require('cron').CronJob;

const kraken = require('./kraken');
const sendText = require('./sendText');

const BITCOIN = 'XBT';
const USD = 'USD';
const PAIR = BITCOIN + USD;
const USD_TO_SPEND = 10;

const buyCyrpto = async () => {
  let orderDetails = [];

  try {
    const tickerRes = await kraken.api('Ticker', {
      pair: PAIR,
    });

    if (tickerRes.error.length) {
      throw new Error(JSON.stringify(tickerRes.error, null, '\t'));
    }

    const currentTradingPrice = Object.values(tickerRes.result)[0].a[0];

    const order = {
      pair: PAIR,
      type: 'buy',
      ordertype: 'limit',
      price: currentTradingPrice,
      volume: (USD_TO_SPEND / currentTradingPrice).toFixed(5),
    };

    orderDetails = [
      `Volume: ${order.volume}`,
      `Price: ${order.price}`,
      `USD Total: $${(order.price * order.volume).toFixed(2)}`,
    ];

    const orderRes = await kraken.api('AddOrder', order);

    console.log(JSON.stringify(orderRes, null, '\t'));

    if (orderRes.error.length) {
      throw new Error(JSON.stringify(tickerRes.error, null, '\t'));
    }

    sendText(
      [
        'BITCOIN ORDER SUCCESSFUL',
        ...orderDetails,
        `Response: ${orderRes.result.descr.order}`,
      ].join('\n')
    );
  } catch (e) {
    sendText(
      ['BITCOIN ORDER FAILED', ...orderDetails, `Error: ${e.message}`].join(
        '\n'
      )
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
