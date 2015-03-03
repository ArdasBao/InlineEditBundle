(function(angular) {

    angular
        .module('BaoInlineEditor', ['ngSanitize'])
        .directive('baoinlineeditorVariable', function($http, $q) {
            return {
                restrict: 'A',
                scope: {
                    baoinlineeditorVariable: '@',
                    baoinlineeditorType: '@'
                },
                controller: function($scope, $element, $attrs, $compile, $rootScope, VariableInlineEditor) {

                    var getChildDirective = function(type) {
                        switch (type) {
                            case 'text':
                                return '<span href="#" data-editable-text="data" data-buttons="no" blur="ignore" data-e-form="editorForm" data-ng-bind-html="data || \'empty\'" onbeforesave="save($data)"></span>' +
                                    '<span class="baoinlineeditor-buttons">' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-edit" title="Edit" data-ng-click="editorForm.$show(); " data-ng-hide="editorForm.$visible || !enabled || state == \'saving\'"></span>' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-save" title="Save" data-ng-click="editorForm.$submit();" data-ng-hide="!editorForm.$visible || state == \'saving\'"></span>' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-cancel" title="Cancel" data-ng-click="editorForm.$cancel(); cancel();" data-ng-hide="!editorForm.$visible || state == \'saving\'"></span>' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-throbber" title="Saving..." data-ng-show="state == \'saving\'"></span>' +
                                    '</span>' +
                                    '<div class="baoinlineeditor-error" data-ng-show="error" data-ng-bind="error"></div>';
                            case 'ckeditor':
                                return '<div data-ck-inlineeditor="data" data-e-form="editorForm" data-ng-bind-html="data || \'empty\'" data-ck-inlineeditor-preset="' + ($attrs.ckInlineeditorPreset != undefined ? $attrs.ckInlineeditorPreset : '') + '" data-onbeforesave="save(api.data)"></div>' +
                                    '<span class="baoinlineeditor-buttons">' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-throbber" title="Saving..." data-ng-show="state == \'saving\' || editorForm.waiting"></span>' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-error" data-ng-show="error" data-ng-bind="error"></span>' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-edit" title="Edit" data-ng-click="editorForm.edit();" data-ng-hide="editorForm.editable || !enabled || state == \'saving\'"></span>' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-save" title="Save" data-ng-click="editorForm.save();" data-ng-hide="!editorForm.editable || state == \'saving\'"></span>' +
                                    '<span class="baoinlineeditor-button baoinlineeditor-button-cancel" title="Cancel" data-ng-click="editorForm.cancel(); cancel();" data-ng-hide="!editorForm.editable || state == \'saving\'"></span>' +
                                    '</span>';
                        }
                    };

                    $scope.data = '';
                    $scope.enabled = VariableInlineEditor.enabled;
                    $scope.state = 'show';
                    $scope.error = '';


                    $scope.save = function(value, name) {
                        name = name || $scope.baoinlineeditorVariable;
                        value = value || $scope.data;

                        var deffered = $q.defer();

                        $scope.state = 'saving';
                        $scope.error = '';

                            $http
                            .post('/baoinlineedit/variable/', {
                                name: name,
                                value: value
                            })
                            .success(function(data, status) {
                                if (data.status != undefined && data.status) {
                                    $scope.state = 'show';
                                    deffered.resolve();
                                }
                                else {
                                    $scope.error = data.message != undefined ? data.message : 'Server error.';
                                    $scope.state = 'editing';
                                    deffered.reject();
                                }

                            })
                            .error(function(data, status) {
                                $scope.error = data.message != undefined ? data.message : 'Server error.';
                                $scope.state = 'editing';
                                deffered.reject();
                            });


                        return deffered.promise;
                    };

                    $scope.cancel = function() {
                        $scope.error = '';
                        $scope.state = 'show';
                    };

                    $scope.init = function() {
                        $scope.data = $element.html();

                        $element.addClass('baoinlineeditor');
                        $element.addClass('baoinlineeditor-' + $scope.baoinlineeditorType);

                        var child = getChildDirective($scope.baoinlineeditorType);

                        if (typeof(child) == 'string') {
                            child = angular.element(child);
                        }

                        $compile(child)($scope);
                        $element.html('');
                        $element.append(child);
                    };

                    $rootScope.$on('variablesInlineEditor.enabled', function(event, data) {
                        $scope.enabled = data;
                    })
                },
                link: function($scope, $attrs) {
                    $scope.init();
                }
            }
        })
        .factory('VariableInlineEditor', function($rootScope) {
            return {
                enabled: true,
                enable: function() {
                    this.enabled = true;
                    $rootScope.$emit('variablesInlineEditor.enabled', this.enabled);
                },
                disable:function() {
                    this.enabled = false;
                    $rootScope.$emit('variablesInlineEditor.enabled', this.enabled);
                }
            };
        });


})(angular);