/* eslint-disable @typescript-eslint/ban-ts-comment */
import { after, before, it } from 'mocha';
import { expect, use, should } from 'chai';
import chaiSpies from 'chai-spies';
import { Logger } from 'tslog';

import { closeMemDb, getState, ITestState, wait } from './setup';
import { Transporter } from '../src';
import { Collection } from 'mongodb';

should();
use(chaiSpies);
before(async () => {
  await getState();
});

describe('Transporter tests', () => {
  let testState: ITestState;
  let mongodbTransporter: Transporter;
  // @ts-ignore
  let logger: Logger;
  let testCollection: Collection;
  before(async () => {
    testState = await getState();
    mongodbTransporter = new Transporter({
      db: testState.db,
      bucketSize: 10,
      logTTL: 60
    });

    logger = new Logger({
      type: 'hidden',
      hideLogPositionForProduction: false,
      argumentsArrayName: 'argumentsArray',
      metaProperty: 'metadata',
      attachedTransports: [mongodbTransporter.transport.bind(mongodbTransporter)]
    });

    // load 70 logs to db
    for (const _ of new Array(10)) {
      logger.silly('Silly log');
      logger.trace('Trace log');
      logger.debug('Debug log');
      logger.info('Info log');
      logger.warn('Warn log');
      try {
        throw new Error('This is error msg!!');
      } catch (error) {
        logger.error(error);
      }
      try {
        throw new Error('This is fatal msg!!');
      } catch (error) {
        logger.fatal(error);
      }
      await wait(20);
    }
    // Important waitfor transport
    await wait(2000);
    testCollection = testState.db.collection('logs');
  });

  it('database should be created', async () => {
    const dbStats = await testState.db.stats();
    expect(dbStats.db).to.be.eq('test_db');
  });

  it('timeseries collection should be created', async () => {
    const collInfo = await testState.db.listCollections({ name: 'logs' }).next();
    expect(collInfo?.name).to.be.eq('logs');
    expect(collInfo?.type).to.be.eq('timeseries');
    // @ts-ignore
    expect(collInfo?.options?.expireAfterSeconds).to.be.eq(60);
    // @ts-ignore
    expect(collInfo?.options?.timeseries?.timeField).to.be.eq('ts');
    // @ts-ignore
    expect(collInfo?.options?.timeseries?.metaField).to.be.eq('metadata');
    // @ts-ignore
    expect(collInfo?.options?.timeseries?.granularity).to.be.eq('minutes');
  });

  it('logs should be inserted', async () => {
    const count = await testCollection.estimatedDocumentCount();
    expect(count).to.be.eq(70);
  });

  it('should insert logs after 1 second if no more are added', async () => {
    const uniqMsg = 'UniqMsgToFind';
    logger.trace(uniqMsg);
    await wait(2000);
    const savedLog = await testCollection.findOne({
      'metadata.logLevelName': 'TRACE',
      'metadata.argumentsArray': { $in: [uniqMsg] }
    });
    expect(savedLog).not.to.be.undefined;
    expect(savedLog?.logLevelId).to.be.eq(1);
    expect(savedLog?.metadata.argumentsArray[0]).to.be.eq(uniqMsg);
  });
});

after(async () => {
  await closeMemDb();
});
