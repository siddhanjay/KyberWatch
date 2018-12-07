const assert = require('assert');
const Utils = require('../src/utils.js');

describe('utils.js', () => {
  describe('isValidTimestamp()', () => {
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

  describe('getBlocksBetweenTimestamps()', async () => {
    it('get the correct blocks for their timestamps', (done) => {
      const startTimestamp = 1544211318;
      const stopTimestamp = 1544211193;
      Utils.getBlocksBetweenTimestamps(startTimestamp, stopTimestamp).then((blocks) => {
        assert.equal(blocks.startBlock, 6844380);
        assert.equal(blocks.endBlock, 6844387);
        done();
      }).catch(() => done());
    }).timeout(10000);

    it('get the correct blocks within timestamps', (done) => {
      const startTimestamp = 1544211319;
      const stopTimestamp = 1544211192;
      Utils.getBlocksBetweenTimestamps(startTimestamp, stopTimestamp).then((blocks) => {
        assert.equal(blocks.startBlock, 6844380);
        assert.equal(blocks.endBlock, 6844387);
        done();
      }).catch(() => done());
    }).timeout(10000);

    it('get the correct blocks when start timestamp exceeds', (done) => {
      const startTimestamp = 1544211317;
      const stopTimestamp = 1544211192;
      Utils.getBlocksBetweenTimestamps(startTimestamp, stopTimestamp).then((blocks) => {
        assert.equal(blocks.startBlock, 6844380 - 1);
        assert.equal(blocks.endBlock, 6844387);
        done();
      }).catch(() => done());
    }).timeout(10000);

    it('get the correct blocks when stop timestamp exceeds', (done) => {
      const startTimestamp = 1544211318;
      const stopTimestamp = 1544211191;
      Utils.getBlocksBetweenTimestamps(startTimestamp, stopTimestamp).then((blocks) => {
        assert.equal(blocks.startBlock, 6844380);
        assert.equal(blocks.endBlock, 6844387 - 1);
        done();
      }).catch(() => done());
    }).timeout(10000);
  });
});
