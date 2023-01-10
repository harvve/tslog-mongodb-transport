import { Collection, CollectionInfo } from 'mongodb';
import { IChecks, ILogObject, ITimeseriesRow, ITransportOptions, TTransportOptions } from './types';

/**
 * The Transporter class
 *
 * @description It allows logs to be saved in the mongodb timeseries collection.
 *
 * @example
 * // short example
 * import { Db, MongoClient } from 'mongodb';
 * import { Transporter } from '@harvve/tslog-mongodb-transport';
 * import { Logger } from 'tslog';
 *
 * async function main() {
 *  const client = await new MongoClient('mongodb://localhost:27017').connect();
 *  const mongodbTransporter = new Transporter({ db: client.db('logs_db') });
 *  const logger = new Logger({
      argumentsArrayName: 'argumentsArray', // default key name used by Transporter
      metaProperty: 'metadata', // default key name used by Transporter
      attachedTransports: [mongodbTransporter.transport.bind(mongodbTransporter)]
    });
 *  logger.info('Hello');
 * }
 */
export class Transporter {
  private readonly baseConfig: Omit<ITransportOptions, 'db'> = {
    argumentsArrayName: 'argumentsArray',
    collectionName: 'logs',
    granuality: 'minutes',
    bucketSize: 5000,
    updateInterval: 1,
    logTTL: 2592000,
    onErrorCallback: () => {},
    onBeforeWriteCallback: () => {},
    onAfterWriteCallback: () => {},
    onFinallyWriteCallback: () => {}
  };
  private config: ITransportOptions;
  private collection: Collection | undefined;
  private bucket: Array<ITimeseriesRow> = [];
  private checks: IChecks = { isReady: false, isChecking: false, isWriting: false };
  private timer: NodeJS.Timeout | undefined;

  constructor(config: TTransportOptions) {
    this.config = Object.assign(this.baseConfig, config);
    // if process exit - try to write all data from bucket
    process.once('exit', () => {
      this.writeData(this.bucket.splice(0));
    });
  }

  /**
   * Transport method
   *
   * @description transports logs to mongodb
   */
  public async transport(data: ILogObject): Promise<void> {
    if (!this.checks.isReady && !this.checks.isChecking) {
      this.checks.isChecking = true;
      const collectionMeta = await this.getCollectionMetadata();
      if (!collectionMeta) {
        this.collection = await this.crateCollection();
      } else {
        this.collection = this.config.db.collection(this.config.collectionName);
      }
      this.checks.isReady = true;
      this.checks.isChecking = false;
    }

    if (this.bucket.length > this.config.bucketSize && this.checks.isReady && !this.checks.isWriting) {
      this.writeData(this.bucket.splice(0, this.config.bucketSize));
    }

    this.bucket.push(this.prepareData(data));
    this.rollingUpdate(this);
  }

  private rollingUpdate(context: Transporter): void {
    const self = context;
    if (self.timer) {
      clearTimeout(self.timer);
    }

    self.timer = setTimeout(() => {
      if (self.checks.isReady && !self.checks.isWriting) {
        self.writeData(self.bucket.splice(0));
      } else {
        self.rollingUpdate(self);
      }
    }, self.config.updateInterval * 1000);
  }

  private prepareData(data: ILogObject): ITimeseriesRow {
    // Important: Use Consistent Field Order in Documents
    // Check: https://www.mongodb.com/docs/manual/core/timeseries/timeseries-best-practices/#use-consistent-field-order-in-documents
    return {
      ts: data.metadata.date,
      logLevelId: data.metadata.logLevelId,
      metadata: {
        runtime: data.metadata.runtime,
        runtimeVersion: data.metadata.runtimeVersion,
        hostname: data.metadata.hostname,
        logLevelName: data.metadata.logLevelName,
        argumentsArray: data.argumentsArray,
        name: data.metadata.name,
        parentNames: data.metadata.parentNames,
        path: data.metadata.path
      }
    };
  }

  private writeData(data: ITimeseriesRow[]): void {
    if (!data.length) {
      return;
    }
    this.checks.isWriting = true;
    this.config.onBeforeWriteCallback(this.bucket.length);
    this.collection
      ?.insertMany(data)
      .then((insertStats) => this.config.onAfterWriteCallback(insertStats, this.bucket.length))
      .catch(this.config.onErrorCallback)
      .finally(() => {
        this.config.onFinallyWriteCallback(this.bucket.length);
        this.checks.isWriting = false;
      });
  }

  private async crateCollection(): Promise<Collection> {
    try {
      const collection = await this.config.db.createCollection(this.config.collectionName, {
        timeseries: { timeField: 'ts', metaField: 'metadata', granularity: this.config.granuality },
        expireAfterSeconds: this.config.logTTL
      });
      await collection.createIndexes([
        { key: { ts: -1 } },
        { key: { ts: -1, 'metadata.logLevelName': 1, 'metadata.hostname': 1 } }
      ]);
      return collection;
    } catch (err) {
      this.config.onErrorCallback(err);
      throw Error(`Cannot create timeseries collection, reason: ${err}`);
    }
  }

  private async getCollectionMetadata(): Promise<CollectionInfo | Pick<CollectionInfo, 'name' | 'type'> | null> {
    try {
      const collectionMeta = await this.config.db.listCollections({ name: this.config.collectionName }).next();
      return collectionMeta;
    } catch (err) {
      this.config.onErrorCallback(err);
      throw Error(`Cannot check if collection exists, reason: ${err}`);
    }
  }
}
