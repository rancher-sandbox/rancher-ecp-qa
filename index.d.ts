declare namespace Cypress {
    interface Chainable {
    /**
     * Search for an element by its label
     * @param label : Label of the element
     */
    byLabel(label: string,): Chainable;

    /**
     * Click on a button by its label
     * @param label : Label of the button
     */
    clickButton(label: string,): Chainable;

    /**
     * Go into the given menu
     * @remarks : You can access submenu by giving submenu name in the array (ex: cy.clickNavMenu(['Menu', 'Submenu']))
     * @param listLabel : List of the menu names
     */
    clickNavMenu(listLabel: string[],): Chainable;

    /**
     * Confirm the deletion of a resource
     */
    confirmDelete(): Chainable;

    /**
     * Delete all resources from the current page
     */
    deleteAllResources():Chainable;

    /**
     * Login to Rancher UI
     * @remarks : Not sure cacheSession is still used/needed
     * @param username : Username of the user
     * @param password : Password of the user
     * @param cacheSession : Cache the session
     */
    login(username?: string, password?: string, cacheSession?: boolean,): Chainable;

    /**
     * Yields elements with a data-test attribute that match a specified selector.
     * @remarks : data-testid attribute is used in the Rancher codebase to identify elements 
     * @param dataTestAttribute : Attribute of the element 
     * @param args : Other arguments to pass
     * @returns : The element
     */
    // 'args?: any' is really needed here!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getBySel(dataTestAttribute: string, args?: any): Chainable;

    /**
     * Insert a value in a field
     * @param label : Label of the field
     * @param value : Value to insert
     * @param noLabel : If true, the label is not used
     * @param log : If true, the value is logged
     */
    typeValue(label: string, value: string, noLabel?: boolean, log?: boolean): Chainable;
    }
}
