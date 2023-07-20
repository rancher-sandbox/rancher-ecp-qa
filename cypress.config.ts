import { defineConfig } from 'cypress'

const baseUrl  = (process.env.TEST_BASE_URL || 'http://127.0.0.1/dashboard');
const password = (process.env.TEST_PASSWORD || 'password');
const username = (process.env.TEST_USERNAME || 'admin');

export default defineConfig({
  defaultCommandTimeout: 10000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    experimentalSessionAndOrigin: true,
    supportFile: false,
    specPattern:
      'cypress/e2e/*.spec.ts', 
    baseUrl,
  },
  env: {
    password: password,
    username: username
  }
})
