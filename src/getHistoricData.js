const fs = require('fs');
const { format } = require('date-fns');
const kraken = require('./kraken');
const assetInfo = require('../assetInfo.json');

const USD = 'USD';
const INTERVAL = 1440; // 1 day

const fetchHistoricPriceDataForAssetCodeInUsd = async (assetCode) => {
  const PAIR = assetCode + USD;

  try {
    const historicPrices = await kraken.api('OHLC', {
      pair: PAIR,
      interval: INTERVAL,
    });
    const formattedData = historicPrices.result[
      Object.keys(historicPrices.result)[0]
    ]
      .slice(-30)
      .map((entry) => {
        const [time, open, high, low, close, vwap, volume, count] = entry;
        const date = format(new Date(time * 1000), 'yyyy-MM-dd');

        return {
          date,
          open,
          high,
          low,
          close,
          vwap,
          volume,
          count,
        };
      });

    return { assetCode, data: formattedData.slice(0, -1) };
  } catch (e) {
    console.error('Could not fetch prices for ', PAIR, e);
    return Promise.resolve();
  }
};

const getHistoricData = async () => {
  const historicDataForPairs = await Promise.all(
    assetInfo.map((assetInfo) =>
      fetchHistoricPriceDataForAssetCodeInUsd(assetInfo.assetCode)
    )
  );

  const formatted = historicDataForPairs
    .map((data, index) => ({
      ...data,
      displayName: assetInfo[index].assetName,
    }))
    .filter(Boolean)
    .reduce((acc, { assetCode, data, displayName }) => {
      acc[assetCode] = {
        displayName,
        data: data.map((data) => ({
          date: data.date,
          averagePrice: data.vwap,
        })),
      };
      return acc;
    }, {});

  return formatted;
};

module.exports = getHistoricData;
