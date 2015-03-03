(function(angular) {

    angular
        .module('ck.inlineeditor', [])
        .directive('ckInlineeditor', function() {
            return {
                restrict: 'A',
                scope: true,
                controller: function($scope, $rootScope, $element, $attrs, $compile, $parse, $q, $injector) {
                    $scope.editorId = null;
                    $scope.autoInit = true;

                    $scope.api = {};
                    $scope.api.editable = false;
                    $scope.api.waiting = false;
                    $scope.api.data = null;


                    $scope.api.edit = function() {
                        $element.attr('contenteditable', true);

                        if ($scope.api.editable) {
                            CKEDITOR.instances[$scope.editorId].focus();
                            return;
                        }

                        $scope.api.editable = true;
                        $scope.api.waiting = true;
                        if (!$scope.$parent.$$phase && !$rootScope.$$phase) $scope.$parent.$apply();

                        CKEDITOR.config.startupFocus = true;

                        var eventHandlers = {
                            instanceReady: function() {
                                $scope.api.waiting = false;
                                if (!$scope.$parent.$$phase && !$rootScope.$$phase) $scope.$parent.$apply();

                                getDataFromEditor();
                            }
                        };

//                        if ($scope.autoInit) {
//                            eventHandlers['blur'] = function() {
//                                $scope.api.save();
//                            };
//                        }

                        var options = {
                            on: eventHandlers
                        };

                        // If service BaoCkeditorConfigurator is available use it for receiving ckeditor options like
                        // toolbar bottons etc.
                        if ($injector.has('BaoCkeditorConfigurator')) {
                            var preset = $attrs.ckInlineeditorPreset;

                            var BaoCkeditorConfigurator = $injector.get('BaoCkeditorConfigurator');
                            options = angular.extend(options, BaoCkeditorConfigurator.getPresetOptions(preset));
                        }

                        CKEDITOR.inline($scope.editorId, options);
                    };

                    var cancelEditor = function() {
                        $scope.api.editable = false;
                        if (!$scope.$parent.$$phase && !$rootScope.$$phase) $scope.$parent.$apply();

                        CKEDITOR.instances[$scope.editorId].destroy();
                        $element.html($scope.api.data);
                        $element.removeAttr('contenteditable');
                    };

                    $scope.api.save = function() {

                        if ($attrs.onbeforesave) {
                            getDataFromEditor();
                            var promise = $parse($attrs.onbeforesave)($scope);

                            CKEDITOR.instances[$scope.editorId].setReadOnly(true);
                            $q
                                .when(promise)
                                .then(function(data) {
                                    $scope.applyData();
                                    cancelEditor();
                                }, function() {
                                    CKEDITOR.instances[$scope.editorId].setReadOnly(false);
                                });
                        }
                        else {
                            $scope.applyData();
                            cancelEditor();
                        }
                    };

                    $scope.api.cancel = function() {
                        cancelEditor();
                    };


                    $scope.prepareEditorId = function() {
                        if (!$element.attr('id')) {
                            $element.attr('id', $scope.getRandomId());
                        }

                        $scope.editorId = $element.attr('id');
                    };

                    $scope.getRandomId = function() {
                        return 'ckeditor' + Math.floor(Math.random() * (1000000));
                    };

                    var getDataFromEditor = function() {
                        $scope.api.data = CKEDITOR.instances[$scope.editorId].getData();
                    };

                    $scope.applyData = function() {
                        getDataFromEditor();

                        if ($attrs.ckInlineeditor) {
                            $scope.$parent[$attrs.ckInlineeditor] = angular.copy($scope.api.data);
                            if (!$scope.$parent.$$phase && !$rootScope.$$phase) $scope.$parent.$apply();
                        }
                    };

                },
                link: function($scope, $element, $attrs) {
                    $scope.prepareEditorId();

                    if ($attrs.eForm != undefined && $attrs.eForm) {
                        $scope.autoInit = false;
                        $scope.$parent[$attrs.eForm] = $scope.api;
                    }
                    else {
                        $element
                            .bind('click', function() {
                                $scope.api.edit();
                            });
                    }
                }
            }
        });


})(angular);