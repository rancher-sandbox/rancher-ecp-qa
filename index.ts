import * as cypressLib from '@rancher-ecp-qa/cypress-library';
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
 * @param repositoryBranch : Branch of the repository
 */
export function addRepository(repositoryName, repositoryURL, repositoryType, repositoryBranch) {
  cy.getBySel('side-menu')
    .contains('local')
    .click();
    cy.clickNavMenu(['Apps', 'Repositories'])
  // Make sure we are in the 'Repositories' screen (test failed here before)
  // Test fails sporadically here, screen stays in pending state forever
  // Ensuring "Loading..." overlay screen is not present.
  cy.contains('Loading...', {timeout: 35000}).should('not.exist');
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
    cy.typeValue('Git Branch', repositoryBranch);
  } else {
    cy.typeValue('Index URL', repositoryURL);
  }
  cy.clickButton('Create');
  // Make sure the repo is active before leaving
  cy.contains(new RegExp('Active.*'+repositoryName))
};

/**
 * Remove a Helm repository
 * @param repositoryName : Name of the repository to delete
 */
export function deleteRepository(repositoryName) {
  cy.getBySel('side-menu')
    .contains('local')
    .click();
  cy.clickNavMenu(['Apps', 'Repositories'])
  // Make sure we are in the 'Repositories' screen (test failed here before)
  cy.contains('header', 'Repositories')
    .should('be.visible');
  cy.contains('Create')
    .should('be.visible');
  cy.contains(new RegExp('Active.*'+repositoryName))
    .click();
  cy.clickButton('Delete');
  cypressLib.confirmDelete();
  // Make sure the repo is removed before leaving
  cy.contains(new RegExp('Active.*'+repositoryName))
    .should('not.exist');
};

/**
 * Click on the burger menu on the top left of the screen
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
 * @param rancherVersion : Rancher version
 * @param timeout : Timeout for the check
 */
export function checkClusterStatus(clusterName, clusterStatus, rancherVersion, timeout = 10000) {
  cy.contains('Home')
    .click();
    (rancherVersion != 'v2.9-head') ?
    cy.contains(clusterStatus+clusterName,  {timeout: timeout}) :
    cy.contains(clusterStatus+' '+clusterName,  {timeout: timeout});
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
 * Create an user in the Rancher UI
 * @remarks : Only one role can be given for now
 * @param username : Name of the user
 * @param password : Password of the user
 * @param role : Role of the user
 * @param uncheckStandardUser : Uncheck "Standard User" marked by default
 */
// TODO: Add the possibility to add multiple roles
export function createUser(username, password, role, uncheckStandardUser=false) {
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
  if (uncheckStandardUser === true) {
    cy.get('body').then((body) => {
      if (body.find('span[aria-label="Standard User"]').length) {
        cy.get('span[aria-label="Standard User"]').scrollIntoView();
        cy.get('span[aria-label="Standard User"]')
          .should('be.visible')        
          .click();
      }
      else if (body.find('div[data-testid="grb-checkbox-user"] > .checkbox-container').length) {
        cy.get('div[data-testid="grb-checkbox-user"] > .checkbox-container').scrollIntoView();
        cy.get('div[data-testid="grb-checkbox-user"] > .checkbox-container')
          .contains('Standard User')
          .should('be.visible')
          .click();
      }
    })    
  }
  cy.getBySel('form-save')
    .contains('Create')
    .click();
  cy.contains(username).should('exist');
}

/**
 * Delete an user in the Rancher UI
 * @param username : Name of the user
 */
export function deleteUser(username) {
  // Screen has to be big enough to display the 'Delete' button
  cy.viewport(1920, 1080);
  cy.contains('Users & Authentication')
    .click();
  cy.contains('.title', 'Users')
    .should('exist');
  cy.contains(username)
    .click();
  cy.clickButton('Delete');
  cy.getBySel('prompt-remove-input')
    .type(username);
  cy.confirmDelete();
  cy.contains(username).should('not.exist');
}

/**
 * Logout with the current user
 * @remarks : Useful when testing role changes
 */
export function logout() {
  cy.get('.user.user-menu, [data-testid="nav_header_showUserMenu"]').click({ force: true });
  cy.contains('Log Out').should('be.visible').click({ force: true });
  cy.contains('You have been logged out.').should('be.visible');
} 

/**
 * DEPRECATED ! not needed anymore since Rancher 2.9
 * 
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
    cy.contains('Add Partners Extensions Repository')
      .click();
  }
  cy.clickButton('OK');
  cy.get('.tabs', {timeout: 40000})
    .contains('Installed Available Updates All');
};

/**
 * Disable the extension support
 * DEPRECATED ! not needed anymore since Rancher 2.9
 */
export function disableExtensionSupport() {
  cy.contains('Extensions')
    .click();
  cy.getBySel('extensions-page-menu')
    .click();
  cy.contains('Disable Extension Support')
    .click();
  cy.clickButton('Disable');
  cy.contains('Extension support is not enabled', {timeout: 60000});
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
      const loginPath ="/v3-public/localProviders/local*";
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
    .contains(new RegExp(`^${label}`))
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
    cy.get(label).as('label')
  } else {
    cy.byLabel(label).as('label')
  }
  cy.get('@label').focus()
  cy.get('@label').clear()
  cy.get('@label').type(value, {log: log})
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
