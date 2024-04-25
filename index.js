const { app, getRandomCountry } = require('./app');
const axios = require('axios');

(async () => {
  app.message('random flag', async ({ message, say }) => {
    const country = await getRandomCountry();
    if (!country) {
      await say('Sorry, I couldn\'t fetch a flag at the moment.');
      return;
    }

    const messageBlocks = [
      {
        "type": "divider"
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${country.name.common} :flag-${country.cca2.toLowerCase()}:`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:information_source: ${country.flags.alt}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'More Info'
            },
            action_id: 'more_info_button',
            value: country.name.common
          }
        ]
      },
      {
        "type": "image",
        "image_url": country.flags.png,
        "alt_text": country.flags.alt
      },
      {
        "type": "divider"
      }
    ];

    await say({
      "blocks": messageBlocks
    });
  });

  // Listen for button clicks
  app.action('more_info_button', async ({ ack, body, client }) => {
    await ack();

    const countryName = body.actions[0].value;

    try {
      const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
      const countryInfo = response.data[0];

      const currencyInfo = Object.keys(countryInfo.currencies).map(currencyCode => `${currencyCode} - ${countryInfo.currencies[currencyCode].name}`);

      const moreinfoBlocks = [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": `Here's some more information about ${countryInfo.name.common}:`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `
:round_pushpin: Official Name: ${countryInfo.name.official}
:bust_in_silhouette: Population: ${countryInfo.population.toLocaleString()}
:coin: Currency/ies: ${currencyInfo.join(', ')}
:classical_building: Capital/s: ${countryInfo.capital.join(', ')}
:earth_africa: Continent: ${countryInfo.continents.join(', ')}
:speaking_head_in_silhouette: Language/s: ${Object.values(countryInfo.languages).join(', ')}
:clock8: Timezone/s: ${countryInfo.timezones.join(', ')}

*Other information:*
:diamond_shape_with_a_dot_inside: Independent: ${countryInfo.independent ? 'Yes' : 'No'}
:mountain: Landlocked: ${countryInfo.landlocked ? 'Yes' : 'No'}
      `
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Google Maps'
              },
              url: countryInfo.maps.googleMaps,
              action_id: 'google_maps_button'
            }
          ]
        }
      ];

      await client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.channel.id,
        blocks: moreinfoBlocks
      });
    } catch (error) {
      console.error('Error fetching country information:', error);
      await client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.channel.id,
        text: 'Sorry, I couldn\'t fetch additional information about the country.'
      });
    }
  });

  await app.start(process.env.PORT);
  console.log('Country Flag app is running!');
})();
