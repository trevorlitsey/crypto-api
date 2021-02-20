const { printJSON } = require('./utils');
const kraken = require('./kraken');
const sendText = require('./sendText');

const buyCoin = async (worstPerformingCoin) => {
  const order = {
    pair: worstPerformingCoin.assetPair,
    type: 'buy',
    ordertype: 'limit',
    price: worstPerformingCoin.currentTradingPrice,
    volume: (
      Number(process.env.USD_TO_SPEND_PER_ORDER) /
      worstPerformingCoin.currentTradingPrice
    ).toFixed(5),
  };

  try {
    printJSON('placing order');
    printJSON(worstPerformingCoin);
    printJSON(order);

    sendText(
      [
        `Coin: ${worstPerformingCoin.displayName} (${worstPerformingCoin.assetCode})`,
        `Volume: ${order.volume}`,
        `Price: ${order.price}`,
        `USD Spent: $${(order.price * order.volume).toFixed(2)}`,
        `Performance: ${worstPerformingCoin.performance.toFixed(2)}% since ${
          worstPerformingCoin.since
        } ($${worstPerformingCoin.pastTradingPrice})`,
      ].join('\n')
    );

    const orderRes = await kraken.api('AddOrder', order);
    printJSON(orderRes);
  } catch (e) {
    console.error('Unable to place order: ', e);
    sendText(
      [
        `Unable to buy ${worstPerformingCoin.displayName}`,
        `Error: ${e.message}`,
      ].join('\n')
    );
  }
};

module.exports = buyCoin;
