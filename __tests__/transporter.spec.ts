/* eslint-disable @typescript-eslint/ban-ts-comment */
import { after, before, it } from 'mocha';
import { expect, use, should, spy } from 'chai';
import chaiSpies from 'chai-spies';
import { closeMemDb, getTestDB } from './setup';

/**
 * TODO - transporter settings
 * Collection Name - name of collection that contain timeseries data
 * Connected DB - pass through db from connection
 * Batch write size
 * TTL in seconds
 *
 * Implement listener on closing event to write last logs to DB
 */
// import { ISettingsParam } from 'tslog';
// import { ITransporterOptions, Transporter } from '../src/transporter';

should();
use(chaiSpies);
before(async () => {
  // init db
  await getTestDB();
});

describe('transporter tests', () => {
  it('transporter exmaple tests', async () => {
    const testDb = await getTestDB();
    try {
      const col1 = await testDb.createCollection('logs', {
        timeseries: { timeField: 'ts', metaField: 'source', granularity: 'minutes' },
        expireAfterSeconds: 9000
      });
      const col2 = await testDb.createCollection('logs', {
        timeseries: { timeField: 'ts', metaField: 'source', granularity: 'minutes' },
        expireAfterSeconds: 9000
      });
    } catch (error) {
      console.log(error);
    }
  });
});

after(async () => {
  await closeMemDb();
});
