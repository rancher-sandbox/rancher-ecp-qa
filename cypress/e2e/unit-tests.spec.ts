/*
Copyright © 2022 - 2025 SUSE LLC

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

import * as cypressLib from '../../index';

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
    cy.get('.menu-close')
      .should('exist');
  });

  it('Check accessMenu function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.accesMenu('Cluster Management');
  });

  it('Check addRepository function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.addRepository('elemental-ui', 'https://github.com/rancher/elemental-ui.git', 'git', 'gh-pages');
  });

  it('Check clusterStatus function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.checkClusterStatus('local', 'Active', Cypress.env('RANCHER_VERSION'), 10000);
  });

  it('Check checkNavIcon function', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.checkNavIcon('fleet');
  });

  it('Check confirmDelete function', () => {
    cy.login();
    cy.viewport(1920, 1080);
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

  it('Check createUser/deleteUser function with "Standard User" role', () => {
    cy.login();
    cypressLib.burgerMenuToggle();
    // Given that Standard User is checked by default, no need to add role
    cypressLib.createUser('mytestuserwithrole', 'mytestpassword');
    // Log out with admin role and login with "Standard User" role to check
    // "Standard User" does not have some options available and has some others
    cypressLib.logout();
    cy.login('mytestuserwithrole', 'mytestpassword');
    cypressLib.burgerMenuToggle();
    cy.contains('Continue Delivery').should('not.exist');
    cy.contains('Extensions').should('not.exist');
    cy.contains('Cluster Management').should('exist');
    // Log out as user and login back as admin to delete created user
    cypressLib.logout();
    cy.login();
    cypressLib.burgerMenuToggle();
    cypressLib.deleteUser('mytestuserwithrole');
  });
});
