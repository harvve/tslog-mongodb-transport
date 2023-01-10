import { Db, Document, InsertManyResult } from 'mongodb';

export interface ILogObjectPath {
  fullFilePath: string;
  fileName: string;
  fileNameWithLine: string;
  fileColumn: string;
  fileLine: string;
  filePath: string;
  filePathWithLine: string;
  method: string;
}
export interface ILogObjectMetadata {
  runtime: string;
  runtimeVersion: string;
  hostname: string;
  name: string | undefined;
  parentNames: string | undefined;
  date: Date;
  logLevelId: number;
  logLevelName: string;
  path: ILogObjectPath | undefined;
}
export interface ILogObject {
  argumentsArray: Array<unknown>;
  metadata: ILogObjectMetadata;
}

export type TTimeseriesRowMetadata = Omit<ILogObjectMetadata, 'date' | 'logLevelId'> &
  Pick<ILogObject, 'argumentsArray'>;
export interface ITimeseriesRow {
  ts: Date;
  logLevelId: number;
  metadata: TTimeseriesRowMetadata;
}

export type TTimeseriesGranularity = 'seconds' | 'minutes' | 'hours';
export interface ITransportOptions {
  /** The connected Db class */
  db: Db;
  /** The name of collection in mongodb - default: logs */
  collectionName: string;
  /** The timeseries data granularity - default seconds */
  granuality: TTimeseriesGranularity;
  /** The logger arguments property key name - default argumentsArray */
  argumentsArrayName: string;
  /** The size of the bucket with logs suitable for writing - default 5000 */
  bucketSize: number;
  /** The number of seconds between logs that must elapse to record an incomplete bucket - default 1sec */
  updateInterval: number;
  /** The number of seconds after which a document in a timeseries or clustered collection expires - default 30 days */
  logTTL: number;
  /**
   * The event callback is called when an error occurs
   * @param {unknown} err  - error properties
   */
  onErrorCallback: (err: unknown) => void;
  /**
   * The event callback is called before writing
   * @param {number} bucketLength - current length of bucket
   */
  onBeforeWriteCallback: (bucketLength: number) => void;
  /**
   * The event callback is called when write has executed successfully
   * @param {Object} insertResult - current length of bucket
   * @param {number} bucketLength - current length of bucket
   */
  onAfterWriteCallback: (insertResult: InsertManyResult<Document>, bucketLength: number) => void;
  /**
   * The event callback is called when recording has been completed
   * @param {number} bucketLength - current length of bucket
   */
  onFinallyWriteCallback: (bucketLength: number) => void;
}
export type TTransportOptions = Pick<ITransportOptions, 'db'> & Omit<Partial<ITransportOptions>, 'db'>;
export interface IChecks {
  isReady: boolean;
  isChecking: boolean;
  isWriting: boolean;
}
