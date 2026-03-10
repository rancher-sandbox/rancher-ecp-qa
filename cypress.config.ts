import { defineConfig } from 'cypress'

const baseUrl  = (process.env.TEST_BASE_URL || 'http://127.0.0.1/dashboard');
const password = (process.env.TEST_PASSWORD || 'password');
const username = (process.env.TEST_USERNAME || 'admin');

export default defineConfig({
  defaultCommandTimeout: 10000,
  video: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    experimentalSessionAndOrigin: true,
    supportFile: false,
    // Do not allow using Cypress.env() on Cypress versions with deprecated Cypress.env() function
    allowCypressEnv: false,
    specPattern:
      'cypress/e2e/*.spec.ts',
    baseUrl,
  },
  // Needed for Cypress.env() to work in the library functions
  env: {
    password: password,
    username: username
  },
  // Needed for Cypress.expose() to work in the library functions
  expose: {
    password: password,
    username: username
  }
})
