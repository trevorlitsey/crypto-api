require('dotenv').config();
const CronJob = require('cron').CronJob;

const getHistoricData = require('./getHistoricData');
const getWorstPerformingCoin = require('./getWorstPerformingCoin');
const buyCoin = require('./buyCoin');

const buyCyrpto = async () => {
  const data = await getHistoricData();
  const worstPerformingCoin = await getWorstPerformingCoin(data);
  buyCoin(worstPerformingCoin);
};
buyCyrpto();
// var job = new CronJob(
//   process.env.CRON,
//   buyCyrpto,
//   null,
//   true,
//   'America/Chicago'
// );

// job.start();
