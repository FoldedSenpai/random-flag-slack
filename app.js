const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

async function getRandomCountry() {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    const countries = response.data;
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
  } catch (error) {
    console.error('Error fetching country:', error);
    return null;
  }
}

module.exports = { app, getRandomCountry };
