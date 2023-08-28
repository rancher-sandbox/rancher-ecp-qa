/*
Copyright © 2022 - 2023 SUSE LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/* 
We only test the functions and not the custom cypress commands
because there are called in the functions. No need to duplicate
the tests.
*/

import * as cypressLib from '@rancher-ecp-qa/cypress-library';

Cypress.config();
describe('Cypress Library e2e tests', () => {
  it('Check firstLogin function', () => {
    cypressLib.firstLogin();
  });

  it('Check burgerMenuOpenIfClosed function', () => {
    cy.login();
    // Open the menu
    cypressLib.burgerMenuOpenIfClosed();
    cy.getBySel('side-menu')
      .contains('Cluster Management');
    // Should do nothing as the menu is already open
    cypressLib.burgerMenuOpenIfClosed();
    cy.getBySel('side-menu')
      .contains('Cluster Management');
  });

  it('Check burgerMenuToogle function', () => {
    cy.login();
    // Open the menu
    cypressLib.burgerMenuToggle();
    cy.getBySel('side-menu')
      .contains('Cluster Management');
    // Close the menu
    cypressLib.burgerMenuToggle();
    cy.getBySel('side-menu')
      .should('not.be.visible');
  });

  it('Check accessMenu function', () => {
    cy.login();
    cypressLib.burgerMenuOpenIfClosed();
    cypressLib.accesMenu('Cluster Management');
  });

  it('Check addRepository function', () => {
    cy.login();
    cypressLib.addRepository('elemental-ui', 'https://github.com/rancher/elemental-ui.git', 'git', 'gh-pages');
  });

  it('Check clusterStatus function', () => {
    cy.login();
    cypressLib.checkClusterStatus('local', 'Active');
  });

  it('Check checkNavIcon function', () => {
    cy.login();
    cypressLib.burgerMenuOpenIfClosed();
    cypressLib.checkNavIcon('fleet');
  });

  it('Check confirmDelete function', () => {
    cy.login();
    // confirmDelete function is called in deleteRepository function
    cypressLib.deleteRepository('elemental-ui');
  });

  it('Check createUser/deleteUser function with role', () => {
    cy.login();
    cypressLib.createUser('mytestuserwithrole', 'mytestpassword', 'User-Base');
    cypressLib.deleteUser('mytestuserwithrole');
  });

  it('Check createUser/deleteUser function without role', () => {
    cy.login();
    cypressLib.createUser('mytestuserwithoutrole', 'mytestpassword');
    cypressLib.deleteUser('mytestuserwithoutrole');
  });

  it('Check enableExtensionSupport function with rancher repo activated', () => {
    cy.login();
    cypressLib.burgerMenuOpenIfClosed();
    cypressLib.enableExtensionSupport(true);
  });

  it('Check disableExtensionSupport function', () => {
    cy.login();
    cypressLib.burgerMenuOpenIfClosed();
    cypressLib.disableExtensionSupport();
  });

  it('Check enableExtensionSupport function without rancher repo activated', () => {
    cy.login();
    cypressLib.burgerMenuOpenIfClosed();
    cypressLib.enableExtensionSupport();
  });
});
