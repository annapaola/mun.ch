var animateApp = angular.module('visualizationApp', ['ngRoute']);

angular.module('visualizationApp').factory('detail', function() {
    return {
        init_detail : function(place_id) {
           initDetail(place_id)
        }
    };
});

angular.module('visualizationApp').factory('search', function() {
    return {
        perform_search: function(search_term) {
            performSearch(search_term)
        }
    };
});

animateApp.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'explore.html',
        })
        .when('/explore', {
            templateUrl: 'explore.html'
        })
        .when('/detail/:place_id', {
            templateUrl: 'detail.html',
            controller: 'detailController'
        });

});



animateApp.controller('detailController', function($scope, $routeParams, $window, detail) {
    $scope.show_header = true;
    $scope.place_id = $routeParams.place_id;
    initDetail($scope.place_id);
});