// Copyright (C) 2021-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

context('Filters and quick filters in a ProjectPage', () => {
    const caseID = 118;

    const firstUserName = 'Firstuser';
    const secondUserName = 'Seconduser';

    const firstUser = {
        firstName: `${firstUserName} firstname`,
        lastName: `${firstUserName} lastname`,
        emailAddr: `${firstUserName.toLowerCase()}@local.local`,
        password: 'UfdU21!dds',
        role: 'owner'
    };
    const secondUser = {
        firstName: `${secondUserName} firstname`,
        lastName: `${secondUserName} lastname`,
        emailAddr: `${secondUserName.toLowerCase()}@local.local`,
        password: 'UfdU21!dds',
    };

    const organizationParams = {
        shortName: 'TestOrganization',
        fullName: 'Organization full name. Only for test.',
        description: 'This organization was created to test the functionality.',
        email: 'testorganization@local.local',
        phoneNumber: '+70000000000',
        location: 'Country, State, Address, 000000',
    };

    const adminPprojectNames = [
        'admin AAA project',
        'admin BBB project',
        'admin CCC project',
    ];
    const userProjectNames = [
        'user DDD project',
        'user EEE project'
    ]


    const labelName = 'car';
    const attrName = 'color';
    const multiAttrParams = false;

    const colorProperties = [
        'red', 'green', 'yellow', 'white', 'black', 'gray', 'orange', 'purple', 'navy'
    ];

    function getProjectID(projectName) {
        cy.contains('.cvat-project-name', projectName)
            .parents('.cvat-project-details')
            .should('have.attr', 'cvat-project-id')
            .then(($projectID) => {
                return $projectID;
            });

    }


    describe(`Testing "Case ${caseID}"`, () => {

        it('Sorting projects', () => {
            cy.visit('/');
            cy.login(firstUserName, firstUser['password']);

            cy.goToProjectsList();
            cy.activateOrganization(organizationParams.shortName);

            cy.get('.cvat-projects-page-filters-wrapper .ant-dropdown-trigger').contains('Sort by').click();
            cy.get('.cvat-resource-page-sorting-list').should('exist');

            cy.get('.cvat-resource-page-sorting-list').within(() => {
                cy.get('.cvat-sorting-field').should( (items) => {
                    expect(items[0]).has.text('ID');
                });
                expect(items[0].children('input [type="radio"]').not('[disabled]'));


            });
        });

    });
});
