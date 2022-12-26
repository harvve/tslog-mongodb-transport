import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db, MongoClient } from 'mongodb';

const testState: { db?: Db; client?: MongoClient; memmongo?: MongoMemoryServer } = {};

export const getTestDB = async (): Promise<Db> => {
  if (testState?.db && testState?.client) {
    console.log('Reuse state');
    return testState.db;
  }

  testState.memmongo = await MongoMemoryServer.create();
  const mongoClient = await new MongoClient(testState.memmongo.getUri()).connect();
  testState.db = mongoClient.db('', { ignoreUndefined: true });
  testState.client = mongoClient;
  return testState.db;
};

export const closeMemDb = async (): Promise<void> => {
  await testState.memmongo?.stop();
  console.log('DB in memory closed');
};
