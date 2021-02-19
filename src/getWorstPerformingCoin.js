const kraken = require('./kraken');
const { printJSON } = require('./utils');
const assetInfo = require('../assetInfo.json');

const getWorstPerformingCoin = async (historicData) => {
  const tickerInfo = await kraken.api('Ticker', {
    pair: assetInfo.map((asset) => asset.assetCode + 'USD').join(','),
  });

  const currentPrices = Object.entries(tickerInfo.result).map(
    ([assetPair, tickerInfo]) => {
      return {
        assetPair: assetPair,
        assetCode: assetPair.replace('USD', ''),
        currentTradingPrice: tickerInfo.a[0],
      };
    }
  );

  const worstPerformingCoin = currentPrices.reduce((acc, currentCoinData) => {
    if (historicData[currentCoinData.assetCode]) {
      const { data, displayName } = historicData[currentCoinData.assetCode];

      data.forEach((historicCoinData) => {
        const performance =
          (currentCoinData.currentTradingPrice /
            historicCoinData.averagePrice) *
            100 -
          100;

        if (acc === null || performance < acc.performance) {
          acc = {
            ...currentCoinData,
            displayName,
            performance,
            since: historicCoinData.date,
            pastTradingPrice: historicCoinData.averagePrice,
          };
        }
      });
    } else {
      console.log(
        'could not find historical data for assetCode',
        currentCoinData.assetCode
      );
    }

    return acc;
  }, null);

  return worstPerformingCoin;
};

module.exports = getWorstPerformingCoin;
