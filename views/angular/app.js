'use strict';


// Declare app level module which depends on filters, and services
angular.module('admin', ['ui.router', 'ng-admin'])
    .config(['$stateProvider', 'NgAdminConfigurationProvider', '$locationProvider', function($stateProvider, nga, $locationProvider) {
        $stateProvider
            .state('index', {
                url: "/admin",
                templateUrl: "partial/ad-index.html"
            })
            .state('applicants', {
                url: "/admin/ldldl",
                templateUrl: "partial/ad-applicants.html",
                //controller: ApplicantsCtrl
            })
            .state('otherwise', {
                url: "/admin"
            });
        //$locationProvider.html5Mode(true);


        // create an admin application
        var admin = nga.application('My First Admin').baseApiUrl('/admin/'); // main API endpoint


        var user = nga.entity('memberList');
        // set the fields of the user entity list view
        user.listView().fields([
            nga.field('id'),
            nga.field('user'),
            nga.field('username'),
            nga.field('level'),
            nga.field('facebookId')
        ]);
        // add the user entity to the admin application
        admin.addEntity(user);
        // attach the admin application to the DOM and execute it
        nga.configure(admin);
        
    }]);

