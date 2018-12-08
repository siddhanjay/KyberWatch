$(document).ready(function() {

  const tokenList = $('#token-list');

  const hour24High = $('#24hourhigh'),
        hour24Low  = $('#24hourlow'),
        lastTraded = $('#lasttraded');

  const host = '/api/v1/kyber/currencies';

  const loadStats = (token) => {
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
  };

  $.get({
    url: host,
    success: (response) => {
      const tokens = response.results;
      let html = '';
      let flag = false;
      for (let i = 0; i < tokens.length; ++i) {
        if (tokens[i] != 'ETH' && tokens[i] != 'WETH') {
          if (!flag) {
            loadStats(tokens[i]);
            flag = true;
          }
          html += '<option value="' + tokens[i] + '">' + tokens[i] + '</option>'
        }
      }
      tokenList.html(html);
      tokenList.on('change', (e) => {
        tokenList.prop('disabled', true);
        loadStats(e.target.value);
        tokenList.prop('disabled', false);
      });
    },
  });


});
