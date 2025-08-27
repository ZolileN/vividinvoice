// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.error to avoid cluttering test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (message: string) => {
    // Suppress specific warnings that are not relevant to tests
    if (
      message.includes('React does not recognize the `%s` prop on a DOM element.') ||
      message.includes('Invalid value for prop') ||
      message.includes('Warning: An update to %s inside a test was not wrapped in act')
    ) {
      return;
    }
    originalError(message);
  };

  console.warn = (message: string) => {
    // Suppress specific warnings that are not relevant to tests
    if (
      message.includes('componentWillReceiveProps has been renamed') ||
      message.includes('componentWillUpdate has been renamed')
    ) {
      return;
    }
    originalWarn(message);
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock timers
jest.useFakeTimers();

// Mock the HTMLCanvasElement.getContext method
HTMLCanvasElement.prototype.getContext = jest.fn();
