const assert = require('assert');
const Utils = require('../src/utils.js');

describe('utils.js', () => {
  describe('timestamp validation', () => {
    it('if input is valid timestamp, return true', () => {
      const validTimestamp = 1544215420;
      const ret = Utils.isValidTimestamp(validTimestamp);
      assert.equal(ret, true);
    });

    it('if input is invalid timestamp, return false', () => {
      const invalidTimestamp = '12345678xx12';
      const ret = Utils.isValidTimestamp(invalidTimestamp);
      assert.equal(ret, false);
    });
  });
});
