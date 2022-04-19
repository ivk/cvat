// Copyright (C) 2021-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

//import {projectName} from "../../support/const_project";

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

    before(() => {
        // create users; admin is the 1st user
        cy.visit('/');

        cy.goToRegisterPage();
        cy.userRegistration(
            secondUser.firstName,
            secondUser.lastName,
            secondUserName,
            secondUser.emailAddr,
            secondUser.password,
        );
        cy.logout(secondUserName);

        cy.goToRegisterPage();
        cy.userRegistration(
            firstUser.firstName,
            firstUser.lastName,
            firstUserName,
            firstUser.emailAddr,
            firstUser.password,
            firstUser.role
        );

        // create an organization
        cy.createOrganization(organizationParams);
        cy.activateOrganization(organizationParams.shortName);

        // create admin projects
        for (let i = 0; i < adminPprojectNames.length; i++) {
            cy.goToProjectsList();
            cy.createProjects(adminPprojectNames[i], labelName, attrName, colorProperties[i], multiAttrParams, 'success');
        }
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('sessionid', 'csrftoken');
    });

    describe(`Testing "Case ${caseID}"`, () => {

        it('Invite a member to the organization', () => {
            const memberToInvite = [{
                email: secondUser.emailAddr,
                role: 'Supervisor',
            }]
            cy.openOrganization(organizationParams.shortName);
            cy.checkOrganizationParams(organizationParams);
            cy.checkOrganizationMembers(1, [firstUserName]);

            cy.inviteMembersToOrganization(memberToInvite);
            cy.checkOrganizationMembers(2, [firstUserName, secondUserName]);
        });

        it('Assign projects to defferent users', () => {
            cy.goToProjectsList();
            cy.openProject(adminPprojectNames[0]);
            cy.assignProjectToUser(secondUserName);

            cy.goToProjectsList();
            cy.openProject(adminPprojectNames[1]);
            cy.assignProjectToUser(firstUserName);

            cy.goToProjectsList();
            cy.openProject(adminPprojectNames[2]);
            cy.assignProjectToUser(firstUserName);
            cy.logout(firstUserName);
        });

        it('Supervisor secondUser creates his own project', () => {
            cy.visit('/');
            cy.login(secondUserName, secondUser['password']);

            cy.activateOrganization(organizationParams.shortName);

            for (let i = 0; i < userProjectNames.length; i++) {
                cy.goToProjectsList();
                cy.createProjects(userProjectNames[i], labelName, attrName, colorProperties[i+3], multiAttrParams, 'success');
            }

            cy.goToProjectsList();
            cy.openProject(userProjectNames[0]);
            cy.assignProjectToUser(firstUserName);

            cy.goToProjectsList();
            cy.openProject(userProjectNames[1]);
            cy.assignProjectToUser(secondUserName);

            cy.logout(secondUserName);
        });

        it('Searching by Project name', () => {
            cy.visit('/');
            cy.login(firstUserName, firstUser['password']);

            cy.goToProjectsList();
            cy.activateOrganization(organizationParams.shortName);

            // first, check projects quantity
            cy.get('.cvat-projects-list').find('.ant-card').should( (items) => {
                expect(items).to.have.length(adminPprojectNames.length + userProjectNames.length);
            });

            // try to search any project
            cy.projectSearchField(userProjectNames[0]);
            cy.get('.cvat-projects-list').find('.ant-card').should( (items) => {
                expect(items).to.have.length(1);
            });

            cy.get('.ant-card-meta-title').should('have.text', userProjectNames[0]);

            // cleanup
            cy.projectSearchFieldClear();
        });

        it('Organization owner sorts projects', () => {
            cy.visit('/');
            cy.login(firstUserName, firstUser['password']);

            cy.activateOrganization(organizationParams.shortName);
            cy.goToProjectsList();



        });

    });
});
