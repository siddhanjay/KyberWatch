$(document).ready(function() {

  const tokenList = $('#token-list');

  const hour24High = $('#24hourhigh'),
        hour24Low  = $('#24hourlow'),
        lastTraded = $('#lasttraded');

  const host = '/api/v1/kyber/currencies';

  const orderTableBody = $('#token-orders-table');

  const tokenPricesTable = $('#token-prices-table');

  const Token = {
    load: () => {
      $.get({
        url: host,
        success: (response) => {
          const tokens = response.results;
          let html = '';
          let flag = false;
          for (let i = 0; i < tokens.length; ++i) {
            if (tokens[i] != 'ETH' && tokens[i] != 'WETH') {
              if (!flag) {
                Token.loadStats(tokens[i]);
                Token.loadOrders(tokens[i]);
                flag = true;
              }
              html += '<option value="' + tokens[i] + '">' + tokens[i] + '</option>'
            }
          }
          tokenList.html(html);
          tokenList.on('change', (e) => {
            tokenList.prop('disabled', true);
            Token.loadStats(e.target.value);
            tokenList.prop('disabled', false);
          });
        },
      });
    },

    loadStats: (token) => {
      $.get({
        url: host + '/' + token + '/stats',
        success: (response) => {
          const high24Val = response.results.past_24h_high.toFixed(5);
          const low24Val = response.results.past_24h_low.toFixed(5);
          const lastVal = response.results.last_traded.toFixed(5);

          hour24High.find('div').first().find('b').html(high24Val);
          hour24High.find('div').first().next().find('div').css("width", 5000 * parseFloat(high24Val) + '%');

          hour24Low.find('div').first().find('b').html(low24Val);
          hour24Low.find('div').first().next().find('div').css("width", 5000 * parseFloat(low24Val) + '%');

          lastTraded.find('div').first().find('b').html(lastVal);
          lastTraded.find('div').first().next().find('div').css("width", 5000 * parseFloat(lastVal) + '%');
        },
      });
    },

    loadOrders: () => {
      $.get({
        url: host + '/orders',
        data: {
          "count": 10
        },
        success: (response) => {
          if (response && response.results && response.results.length > 0) {
            let map = {};
            for (let i = 0; i < response.results.length; ++i) {
              const val = response.results[i];
              const key = val.token + val.timestamp;
              if (key in map) {
                continue;
              }
              map[key] = 1;
              html = '<tr><td>' + val.token + '</td><td>' + val.quantity + '</td><td>' + new Date(1000 * val.timestamp).toISOString();
              html += '</td><td>' + val.block + '</td><td>';
              html += '<a href="https://etherscan.io/tx/' + val.txHash + '" target="_blank">Link</a></td></tr>';
              orderTableBody.append(html);
            }
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    },

    loadGraph: (token) => {
      $.get({
        url: host + '/' + token + '/trades',
        data: {
          "start": "1544233022",
          "stop": "1544253022",
        },
        success: (response) => {
          console.log(response);
          
          let prices_ETH = [];
          let prices_USD = [];
          let volume = [];
          for (let i = 0; i < response.length; ++i) {
            if (response[i].priceETH && response[i].priceETH > 0) {
              prices_ETH.push({
                timestamp: response[i].timeStamp,
                priceETH: response[i].priceETH
              });
            }

            if (response[i].priceUSD && response[i].priceUSD > 0) {
              prices_USD.push({
                timestamp: response[i].timeStamp,
                priceUSD: response[i].priceUSD
              });
            }

            if (response[i].quantity && response[i].quantity > 0) {
              volume.push({
                timestamp: response[i].timeStamp,
                volume: response[i].quantity
              });
            }
          }

          Highcharts.stockChart('token-prices-table', {
            rangeSelector: {
              selected: 1
            },
            title: {
              text: ''
            },
            series: [
              {
                name: 'volume',
                data: volume,
                tooltip: {
                  valueDecimals: 2
                }
              },
              {
                name: 'Price in ETH',
                data: prices_ETH,
                tooltip: {
                  valueDecimals: 2
                }
              },
              {
                name: 'Price in USD',
                data: prices_USD,
                tooltip: {
                  valueDecimals: 2
                }
              },
            ]
          });
        },
      });
    },

    reset: () => {

    },
  };
  Token.load();
  Token.loadGraph('DAI');

});
