'use strict';


// Declare app level module which depends on filters, and services
angular
    .module('admin', ['ui.router', 'ng-admin'])
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
        var admin = nga.application('FOOD admin panel').baseApiUrl('/admin/'); // main API endpoint


        // Configuration of main utils
        configMember(nga, admin);
        configRestaurant(nga, admin);

        admin.menu(menu(nga, admin));

        nga.configure(admin);
    }]);

