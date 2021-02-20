const { printJSON } = require('./utils');
const kraken = require('./kraken');
const sendText = require('./sendText');

const MAX_USD_PER_ORDER = Number(process.env.MAX_USD_PER_ORDER);

const buyCoin = async (
  worstPerformingCoin,
  usdToSpend = Number(process.env.USD_TO_SPEND_PER_ORDER)
) => {
  const order = {
    pair: worstPerformingCoin.assetPair,
    type: 'buy',
    ordertype: 'limit',
    price: worstPerformingCoin.currentTradingPrice,
    volume: (usdToSpend / worstPerformingCoin.currentTradingPrice).toFixed(5),
  };

  const textInfo = [
    `Coin: ${worstPerformingCoin.displayName} (${worstPerformingCoin.assetCode})`,
    `Volume: ${order.volume}`,
    `Price: ${order.price}`,
    `USD Total: $${(order.price * order.volume).toFixed(2)}`,
    `Performance: ${worstPerformingCoin.performance.toFixed(2)}% since ${
      worstPerformingCoin.since
    } ($${worstPerformingCoin.pastTradingPrice})`,
  ];

  try {
    console.log('****Attempting to Place Order****');
    console.log(textInfo.join('\n'));
    console.log('ORDER');
    printJSON(order);

    const orderRes = await kraken.api('AddOrder', order);
    sendText([`ORDER SUCCESSFUL`, ...textInfo].join('\n'));
    printJSON(orderRes);
  } catch (e) {
    console.error('Unable to place order: ', e);

    if (
      usdToSpend < MAX_USD_PER_ORDER &&
      e.message.includes('Invalid arguments:volume')
    ) {
      buyCoin(worstPerformingCoin, usdToSpend + 1);
    } else {
      sendText([`ORDER FAILED`, ...textInfo, `Error: ${e.message}`].join('\n'));
    }
  }
};

module.exports = buyCoin;
