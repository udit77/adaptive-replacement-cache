var cacheApp = angular.module('cacheApp', ['ui.router']);

cacheApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/search");

    $stateProvider
    .state('search', {
        url: "/search",
        templateUrl: "partials/search.html",
        controller:"search",
        data: {
        },
        params:{
        }
    })
  
});

cacheApp.run(function ($rootScope, $state) {
});