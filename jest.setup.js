// Mocks compartidos para toda la suite de Jest.

// AsyncStorage no trae un mock nativo en jest-expo; usamos el oficial del paquete.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// expo-secure-store no debe tocar el keychain/keystore real durante los tests.
jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    getItemAsync: jest.fn((key) => Promise.resolve(store[key] ?? null)),
    setItemAsync: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
  };
});
