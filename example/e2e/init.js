import detox from 'detox';
import adapter from 'detox/runners/jest/adapter';
import pack from '../../package.json';

jest.setTimeout(120000);

// eslint-disable-next-line no-undef
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
  await detox.init(pack.detox);
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});
