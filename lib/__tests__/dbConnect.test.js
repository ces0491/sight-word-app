/** @jest-environment node */

jest.mock('mongoose', () => ({ __esModule: true, default: { connect: jest.fn() } }));

const ORIGINAL_URI = process.env.MONGODB_URI;

/** Load dbConnect with a fresh module registry and an empty connection cache. */
const loadDbConnect = () => {
  jest.resetModules();
  global.mongoose = undefined;
  return {
    dbConnect: require('../dbConnect').default,
    mongoose: require('mongoose').default,
    ConfigError: require('../errors').ConfigError,
  };
};

afterEach(() => {
  process.env.MONGODB_URI = ORIGINAL_URI;
  global.mongoose = undefined;
});

describe('dbConnect', () => {
  it('can be imported when MONGODB_URI is missing', () => {
    delete process.env.MONGODB_URI;
    expect(() => loadDbConnect()).not.toThrow();
  });

  it('rejects with a ConfigError when MONGODB_URI is missing', async () => {
    delete process.env.MONGODB_URI;
    const { dbConnect, mongoose, ConfigError } = loadDbConnect();

    await expect(dbConnect()).rejects.toBeInstanceOf(ConfigError);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it('connects once and reuses the connection', async () => {
    process.env.MONGODB_URI = 'mongodb://example.test/db';
    const { dbConnect, mongoose } = loadDbConnect();
    mongoose.connect.mockResolvedValue('connection');

    await expect(dbConnect()).resolves.toBe('connection');
    await expect(dbConnect()).resolves.toBe('connection');
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://example.test/db', { bufferCommands: false });
  });

  it('retries after a failed connection instead of caching the failure', async () => {
    process.env.MONGODB_URI = 'mongodb://example.test/db';
    const { dbConnect, mongoose } = loadDbConnect();
    mongoose.connect.mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce('connection');

    await expect(dbConnect()).rejects.toThrow('network down');
    await expect(dbConnect()).resolves.toBe('connection');
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });
});
