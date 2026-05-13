process.env.RNTL_SKIP_DEPS_CHECK = 'true';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
