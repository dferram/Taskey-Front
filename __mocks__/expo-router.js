const React = require('react');

// Mock liviano de expo-router para tests de componentes que no necesitan
// un sistema de archivos/routing real (eso se cubre en tests de servicios
// y viewmodels). Cada test puede sobreescribir el comportamiento con
// `require('expo-router').__setParams({...})` o inspeccionar las llamadas
// via los jest.fn() expuestos.

const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
};

let mockParams = {};

function useRouter() {
  return router;
}

function useLocalSearchParams() {
  return mockParams;
}

function useFocusEffect(callback) {
  React.useEffect(() => {
    const cleanup = callback();
    return typeof cleanup === 'function' ? cleanup : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function useSegments() {
  return [];
}

function useNavigation() {
  return router;
}

const Link = ({ children }) => children ?? null;
const Stack = { Screen: () => null };
const Tabs = { Screen: () => null };

module.exports = {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
  useSegments,
  useNavigation,
  Link,
  Stack,
  Tabs,
  router,
  __setParams: (params) => {
    mockParams = params;
  },
  __resetMocks: () => {
    mockParams = {};
    router.push.mockClear();
    router.replace.mockClear();
    router.back.mockClear();
    router.navigate.mockClear();
    router.setParams.mockClear();
  },
};
