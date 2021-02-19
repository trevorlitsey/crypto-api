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

const job = new CronJob(
  '* * * 22 * *',
  buyCyrpto,
  null,
  true,
  'America/Chicago'
);

job.start();
