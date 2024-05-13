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
    cypressLib.burgerMenuToggle();
    cypressLib.accesMenu('Cluster Management');
  });

  it('Check addRepository function', () => {
    cy.login();
    cypressLib.addRepository('elemental-ui', 'https://github.com/rancher/elemental-ui.git', 'git', 'gh-pages');
  });

  it('Check clusterStatus function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.checkClusterStatus('local', 'Active');
  });

  it('Check checkNavIcon function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.checkNavIcon('fleet');
  });

  it('Check confirmDelete function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    // confirmDelete function is called in deleteRepository function
    cypressLib.deleteRepository('elemental-ui');
  });

  it('Check createUser/deleteUser function with role', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.createUser('mytestuserwithrole', 'mytestpassword', 'User-Base');
    cypressLib.burgerMenuToggle();
    cypressLib.deleteUser('mytestuserwithrole');
  });

  it('Check createUser/deleteUser function without role', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.createUser('mytestuserwithoutrole', 'mytestpassword');
    cypressLib.burgerMenuToggle();
    cypressLib.deleteUser('mytestuserwithoutrole');
  });

  it('Check createUser/deleteUser function with "User-Base" role and uncheck "Standard User"', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.createUser('mytestuserwithrole', 'mytestpassword', 'User-Base', true);
    // Log out with admin role and login with "User-Base" role to check
    // "User-base" does not have these options available
    cypressLib.logout();
    cy.login('mytestuserwithrole', 'mytestpassword');
    cypressLib.burgerMenuToggle();
    cy.contains('Continue Delivery').should('not.exist');
    cy.contains('Cluster Management').should('not.exist');
    // Log out as user and login back as admin to delete created user
    cypressLib.logout();
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.deleteUser('mytestuserwithrole');
  });

  it('Check enableExtensionSupport function with rancher repo activated', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.enableExtensionSupport(true);
  });

  it('Check disableExtensionSupport function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.disableExtensionSupport();
  });

  it('Check enableExtensionSupport function without rancher repo activated', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.enableExtensionSupport(false);
  });
});
