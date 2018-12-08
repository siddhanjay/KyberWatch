$(document).ready(function() {

  const tokenList = $('#token-list');

  const hour24High = $('#24hourhigh'),
        hour24Low  = $('#24hourlow'),
        lastTraded = $('#lasttraded');

  const host = '/api/v1/kyber/currencies';

  const orderTableBody = $('#token-orders-table');

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
            Token.loadOrders(e.target.value);
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

    loadOrders: (token) => {
      console.log('loading orders of ' + token);
      $.get({
        url: host + '/' + token + '/orders',
        data: {
          "count": 5
        },
        success: (response) => {
          let html = '';
          if (response && response.results && response.results.length > 0) {
            for (let i = 0; i < response.results.length; ++i) {
              const val = response.results[i];
              html += '<tr><td>' + val.txHash + '</td><td>' + val.quantity + '</td><td>' + new Date(1000 * val.timestamp).toDateString();
              html += '</td><td>' + val.block + '</td><td>';
              html += '<a href="https://etherscan.io/tx/' + val.txHash + '" target="_blank">Link</a></td></tr>';
            }
          }
          orderTableBody.html(html);
        },
        error: (err) => {
          console.log(err);
        },
      });
    },
  };
  Token.load();

});
