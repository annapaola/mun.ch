var animateApp = angular.module('visualizationApp', ['ngRoute']);


animateApp.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'main.html'
        })
        .when('/explore', {
            templateUrl: 'explore.html'
        })
        .when('/detail/:place_id', {
            templateUrl: 'detail.html',
            controller: 'detailController'
        });
});


animateApp.controller('detailController', function($scope, $routeParams, $location) {
    $scope.show_header = true;
    $scope.place_id = $routeParams.place_id;
    munch_lib.initDetail($scope.place_id);
});