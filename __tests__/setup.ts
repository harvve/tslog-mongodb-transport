import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db, MongoClient } from 'mongodb';

export interface ITestState {
  db: Db;
  client: MongoClient;
  memongo?: MongoMemoryServer;
}
const state: ITestState = {} as ITestState;

export const getState = async (): Promise<ITestState> => {
  if (state?.db && state?.client) {
    console.log('Reuse state');
    return state;
  }

  let mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    state.memongo = await MongoMemoryServer.create();
    mongoUrl = state.memongo.getUri();
  }
  const mongoClient = await new MongoClient(mongoUrl).connect();
  state.client = mongoClient;
  state.db = mongoClient.db('test_db');

  return state;
};

export const closeMemDb = async (): Promise<void> => {
  if (process.env.MONGODB_URL) {
    await state.db.dropDatabase();
    await state.client.close(true);
  }
  await state.memongo?.stop({ doCleanup: true });
  console.log('DB closed');
};

export const wait = async (ms: number): Promise<void> =>
  new Promise((res) => {
    setTimeout(() => {
      res();
    }, ms);
  });
