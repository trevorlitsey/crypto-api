const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendText = (message) => {
  console.log({
    body: message,
    from: process.env.TEXT_FROM,
    to: process.env.TEXT_TO,
  });
  client.messages
    .create({
      body: message,
      from: process.env.TEXT_FROM,
      to: process.env.TEXT_TO,
    })
    .then((message) => console.log(message.sid))
    .catch((e) => console.error(e));
};

module.exports = sendText;
