angular.module('selectSearch', [])
.directive('selectSearch', function($window, $filter, $timeout) {
    return {
        restrict: 'A'
        , templateUrl: './angular-select-search.html'
        , scope: {
            itemsAll: '=selectSearch'
            , selected: '=ngModel'

            , ssHeight: '@'
            , ssClass: '@'
        }
        , controller: function($scope) {
            $scope.items = $scope.itemsAll;
            $scope.height = $scope.mheight || 200;

            $scope.elemHasClass = function(elem, elemClass) {
                return ((' ' + elem.className + ' ').indexOf(' ' + elemClass + ' ') > -1);
            };

            $scope.index = -1;
            $scope.select = function(index, condition) {
                condition = (angular.isDefined(condition)) ? condition : true;
                if (!condition) {
                    return;
                }
                $scope.index = index;

                if (!angular.isDefined($scope.items[index])) {
                    return;
                }
                $scope.selected = angular.copy($scope.items[index]);
            };

            $scope.dropup = false;
            $scope.reposition = function() {
                var pos = $scope.dropdownMenu.getBoundingClientRect()
                    , spaceTop = pos.top
                    , spaceBot = $window.innerHeight - pos.bottom;
                if (!$scope.dropup && spaceBot < 16) {
                    $scope.dropup = true;
                }
                else if ($scope.dropup && spaceTop < 6) {
                    $scope.dropup = false;
                }
                if (pos.bottom - pos.top > $window.innerHeight / 2) {
                    $scope.dropup = false;
                }
                $scope.$apply();
            };

            $scope.opened = false;
            $scope.toggle = function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                $scope.opened = !$scope.opened;
                $scope.fix();
            };
            $scope.close = function() {
                $scope.opened = false;
                $scope.$apply();
                $scope.fix();
            };

            $scope.fix = function() {
                $scope.filter = '';
                $timeout(function() {
                    if ($scope.opened) {
                        $scope.searchInput[0].focus();
                        angular.element($window).bind('keydown', $scope.keydown);
                    }
                    else {
                        angular.element($window).unbind('keydown', $scope.keydown);
                    }
                    $scope.reposition();
                    $scope.moveScroll();
                }, 10);
            };

            $scope.keydown = function(ev) {
                if (event.keyCode === 27) {
                    $scope.close();
                }
                if (event.keyCode === 40) {
                    $scope.down();
                }
                if (event.keyCode === 38) {
                    $scope.up();
                }
                if (event.keyCode === 13) {
                    $scope.select($scope.index);
                    $scope.close();
                }
            };

            $scope.down = function() {
                if ($scope.index + 1 < $scope.items.length) {
                    $scope.index++;
                    $scope.$apply();
                    $scope.moveScroll();
                }
            };

            $scope.up = function() {
                var newIndex = $scope.index - 1;
                if ($scope.index - 1 >= 0) {
                    $scope.index -= 1;
                    $scope.$apply();
                    $scope.moveScroll();
                }
            };

            $scope.moveScroll = function() {
                var ul = angular.element($scope.dropdownMenu).find('ul')
                    , liElems = ul.find('li');
                Array.prototype.forEach.call(liElems, function(li, i) {
                    if (!$scope.elemHasClass(li, 'active')) {
                        return;
                    }
                    var posLi = li.getBoundingClientRect()
                        , posMenu = $scope.dropdownMenu.getBoundingClientRect();

                    if (posLi.bottom > posMenu.bottom || posLi.top > posMenu.top) {
                        ul[0].scrollTop = (posLi.bottom - posLi.top) * i;
                    }
                });
            };

            $scope.removeWatcher = $scope.$watch('filter', function() {
                $scope.items = $filter('filter')($scope.itemsAll, $scope.filter);
                $scope.index = -1;
                $scope.moveScroll();
            });

            $scope.noop = function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
            };
        }
        , link: function(scope, element, attrs) {
            Array.prototype.forEach.call(element.find('div'), function(elem) {
                if (scope.elemHasClass(elem, 'dropdown-menu')) {
                    scope.dropdownMenu = elem;
                }
                else if (scope.elemHasClass(elem, 'bs-searchbox')) {
                    scope.searchInput = angular.element(elem).find('input');
                }
            });

            angular.element($window)
                .bind('resize', scope.reposition)
                .bind('scroll', scope.reposition)
                .bind('click', scope.close);

            scope.$on('$destroy', function() {
                scope.removeWatcher();
                angular.element($window)
                    .unbind('resize', scope.reposition)
                    .unbind('scroll', scope.reposition)
                    .unbind('click', scope.close);
            });
        }
    };
});