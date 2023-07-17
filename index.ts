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

// RANCHER FUNCTIONS
// /////////////////

/**
 * Click on the menu given as parameter
 * @remarks : Mostly use in the burger menu
 * @param menu : The menu to click on 
 */
export function accesMenu(menu) {
  cy.contains(menu)
    .click();
}

/**
 * Add a Helm repository
 * @remarks : The repository is added to the local cluster
 * @param repositoryName : Name of the repository
 * @param repositoryURL : URL of the repository
 * @param repositoryType : Type of the repository
 */
export function addRepository(repositoryName, repositoryURL, repositoryType) {
  this.burgerMenuOpenIfClosed();
  cy.contains('local')
    .click();
    cy.clickNavMenu(['Apps', 'Repositories'])
  // Make sure we are in the 'Repositories' screen (test failed here before)
  cy.contains('header', 'Repositories')
    .should('be.visible');
  cy.contains('Create')
    .should('be.visible');

  cy.clickButton('Create');
  cy.contains('Repository: Create')
    .should('be.visible');
  cy.typeValue('Name', repositoryName);
  if (repositoryType === 'git') {
    cy.contains('Git repository')
      .click();
    cy.typeValue('Git Repo URL', repositoryURL);
    cy.typeValue('Git Branch', 'main');
  } else {
    cy.typeValue('Index URL', repositoryURL);
  }
  cy.clickButton('Create');
};

/**
 * Check if the burger menu is open and open it if it's closed
 */
export function burgerMenuOpenIfClosed() {
  cy.get('body').then((body) => {
    if (body.find('.menu.raised').length === 0) {
      this.burgerMenuToggle();
    };
  });
};

/**
 * Click on the burger menu on the top left of the screen
 * @remarks : Used in burgerMenuOpenIfClosed()
 */
export function burgerMenuToggle() {
  cy.getBySel('top-level-menu', {timeout: 12000})
    .click();
};

/**
 * Check if the cluster is in the expected state
 * @remarks : Checked in the Home page
 * @param clusterName : Name of the cluster
 * @param clusterStatus : Expected status of the cluster
 * @param timeout : Timeout for the check
 */
export function checkClusterStatus(clusterName, clusterStatus, timeout) {
  this.burgerMenuOpenIfClosed();
    cy.contains('Home')
      .click();
    // The new cluster must be in active state
    cy.get('[data-node-id="fleet-default/'+clusterName+'"]')
      .contains(clusterStatus,  {timeout: timeout});
};

/**
 * Check if the expected icon appears
 * @remarks : Mainly used in the burger menu
 * @param iconName : Name of the icon
 * @returns : The icon
 */
export function checkNavIcon(iconName) {
  return cy.get('.option .icon.group-icon.icon-'+iconName);
} 

/**
 * Confirm the deletion of an object
 */
export function confirmDelete() {
  cy.getBySel('prompt-remove-confirm-button')
  .click();
}

/**
 * Create an user for the Rancher UI
 * @remarks : Only one role can be given for now
 * @param username : Name of the user
 * @param password : Password of the user
 * @param role : Role of the user
 */
// TODO: Add the possibility to add multiple roles
export function createUser(username, password, role) {
  this.burgerMenuOpenIfClosed();
  cy.contains('Users & Authentication')
    .click();
  cy.contains('.title', 'Users')
    .should('exist');
  cy.clickButton('Create');
  cy.typeValue('Username', username);
  cy.typeValue('New Password', password);
  cy.typeValue('Confirm Password', password);
  if (role) {
    cy.contains(role)
      .click();
  }
  cy.getBySel('form-save')
    .contains('Create')
    .click();
}

/**
 * Enable the extension support
 * @remarks : Disable the Rancher Repo if you provide your own repo
 * @param withRancherRepo : Add the Rancher Extension Repository - boolean
 */
export function enableExtensionSupport(withRancherRepo) {
  cy.contains('Extensions')
    .click();
  // Make sure we are on the Extensions page
  cy.contains('.message-icon', 'Extension support is not enabled');
  cy.clickButton('Enable');
  cy.contains('Enable Extension Support?')
  if (!withRancherRepo) {
    cy.contains('Add the Rancher Extension Repository')
      .click();
  }
cy.clickButton('OK');
cy.get('.tabs', {timeout: 40000})
  .contains('Installed Available Updates All');
};

/**
 * Do the first login to Rancher UI, accept the terms and conditions etc
 */
export function firstLogin() {
  cy.visit('/auth/login');
  cy.get("span").then($text => {
    if ($text.text().includes('your first time visiting Rancher')) {
      cy.get('input')
        .type(Cypress.env('password'), {log: false});
      cy.clickButton('Log in with Local User');
      cy.contains('By checking')
        .click('left');
      cy.clickButton('Continue');
      cy.getBySel('banner-title')
        .contains('Welcome to Rancher');
    } else {
      cy.log('Rancher already initialized, no need to handle first login.');
    };
  });
};

// RANCHER CUSTOM CYPRESS COMMANDS
// ///////////////////////////////

Cypress.Commands.add('login', (
  username = Cypress.env('username'),
  password = Cypress.env('password'),
  cacheSession = Cypress.env('cache_session')) => {
    const login = () => {
      let loginPath ="/v3-public/localProviders/local*";
      cy.intercept('POST', loginPath).as('loginReq');
      
      cy.visit('/auth/login');

      cy.getBySel('local-login-username')
        .type(username, {log: false});

      cy.getBySel('local-login-password')
        .type(password, {log: false});

      cy.getBySel('login-submit')
        .click();
      cy.wait('@loginReq');
      cy.getBySel('banner-title').contains('Welcome to Rancher');
      } 

    if (cacheSession) {
      cy.session([username, password], login);
    } else {
      login();
    }
});

Cypress.Commands.add('clickNavMenu', (listLabel) => {
  listLabel.forEach(label => cy.get('nav').contains(label).click());
});

Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args);
});

Cypress.Commands.add('byLabel', (label) => {
  cy.get('.labeled-input')
    .contains(label)
    .siblings('input');
});

Cypress.Commands.add('clickButton', (label) => {
  cy.get('.btn')
    .contains(label)
    .click();
});

Cypress.Commands.add('confirmDelete', () => {
  cy.getBySel('prompt-remove-confirm-button')
    .click()
});

Cypress.Commands.add('typeValue', (label, value, noLabel, log=true) => {
  if (noLabel === true) {
    cy.get(label)
      .focus()
      .clear()
      .type(value, {log: log});
  } else {
    cy.byLabel(label)
      .focus()
      .clear()
      .type(value, {log: log});
  }
});

Cypress.Commands.add('deleteAllResources', () => {  
  cy.get('[width="30"] > .checkbox-outer-container')
    .click();
  cy.getBySel('sortable-table-promptRemove')
    .contains('Delete')
    .click()
  cy.confirmDelete();
  // Sometimes, UI is crashing when a resource is deleted
  // A reload should workaround the failure
  cy.get('body').then(($body) => {
    if (!$body.text().includes('There are no rows to show.')) {
        cy.reload();
        cy.log('RELOAD TRIGGERED');
        cy.screenshot('reload-triggered');
      };
    });
  cy.contains('There are no rows to show', {timeout: 15000});
});