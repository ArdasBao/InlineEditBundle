(function (angular) {

    angular
        .module('BaoInlineEditor', ['ngSanitize'])
        .controller('BaoInlineEditorBaseController', BaoInlineEditorBaseController)
        .factory('baoInlineEditor', baoInlineEditorService)
        .directive('baoinlineeditorVariable', baoinlineeditorVariableDirective)
        .directive('baoinlineeditorEntityField', baoinlineeditorEntityFieldDirective);

    ////////////////

    function BaoInlineEditorBaseController($scope, $element, $attrs, $compile, $rootScope, $http, $q, baoInlineEditor, $sce) {
        $scope.data = '';
        $scope.enabled = baoInlineEditor.enabled;
        $scope.state = 'show';
        $scope.error = '';

        $scope._save = _save;
        $scope.cancel = cancel;
        $scope.init = init;
        $scope.getChildDirective = getChildDirective;

        $scope.typeTextHtml = '<span href="#" data-editable-text="data" data-buttons="no" blur="ignore" data-e-form="editorForm" data-ng-bind-html="data || \'empty\'" onbeforesave="save($data)"></span>' +
        '<span class="baoinlineeditor-buttons">' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-edit" title="Edit" data-ng-click="editorForm.$show(); " data-ng-hide="editorForm.$visible || !enabled || state == \'saving\'"></span>' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-save" title="Save" data-ng-click="editorForm.$submit();" data-ng-hide="!editorForm.$visible || state == \'saving\'"></span>' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-cancel" title="Cancel" data-ng-click="editorForm.$cancel(); cancel();" data-ng-hide="!editorForm.$visible || state == \'saving\'"></span>' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-throbber" title="Saving..." data-ng-show="state == \'saving\'"></span>' +
        '</span>' +
        '<div class="baoinlineeditor-error" data-ng-show="error" data-ng-bind="error"></div>';

        $scope.typeCkeditorHtml = '<div data-ck-inlineeditor="data" data-e-form="editorForm" data-ng-bind-html="trustAsHtml(data)|| \'empty\'" data-ck-inlineeditor-preset="' + ($attrs.ckInlineeditorPreset != undefined ? $attrs.ckInlineeditorPreset : '') + '" data-onbeforesave="save(api.data)"></div>' +
        '<span class="baoinlineeditor-buttons">' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-throbber" title="Saving..." data-ng-show="state == \'saving\' || editorForm.waiting"></span>' +
        '<span class="baoinlineeditor-button baoinlineeditor-error" data-ng-show="error" data-ng-bind="error"></span>' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-edit" title="Edit" data-ng-click="editorForm.edit();" data-ng-hide="editorForm.editable || !enabled || state == \'saving\'"></span>' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-save" title="Save" data-ng-click="editorForm.save();" data-ng-hide="!editorForm.editable || state == \'saving\'"></span>' +
        '<span class="baoinlineeditor-button baoinlineeditor-button-cancel" title="Cancel" data-ng-click="editorForm.cancel(); cancel();" data-ng-hide="!editorForm.editable || state == \'saving\'"></span>' +
        '</span>';

            $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };
	
        activate();

        ////////////////

        function activate() {
            $rootScope.$on('baoInlineEditor.enabled', function(event, data) {
                $scope.enabled = data;
            });
        }

        function _save(url, data) {
            $scope.state = 'saving';
            $scope.error = '';

            var deferred = $q.defer();

            $http
                .post(url, data)
                .success(function(data, status) {
                    if (data.status != undefined && data.status) {
                        $scope.state = 'show';
                        deferred.resolve();
                    }
                    else {
                        $scope.error = data.message != undefined ? data.message : 'Server error.';
                        $scope.state = 'editing';

                        deferred.reject();

                        // We have to use isolated promise to avoid showing by xeditable symfony error page
                        //return $q.reject();
                    }

                })
                .error(function(data, status) {
                    $scope.error = data.message != undefined ? data.message : 'Server error.';
                    $scope.state = 'editing';
                    deferred.resolve();
                });

            return deferred.promise;
        }

        function cancel() {
            $scope.error = '';
            $scope.state = 'show';
        }

        function init() {
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
        }

        function getChildDirective(type) {
            switch (type) {
                case 'text':
                    return $scope.typeTextHtml;
                case 'ckeditor':
                    return  $scope.typeCkeditorHtml;
            }
        }
    }

    function baoInlineEditorService($rootScope) {
        return {
            enabled: true,
            enable: function() {
                this.enabled = true;
                $rootScope.$emit('baoInlineEditor.enabled', this.enabled);
            },
            disable:function() {
                this.enabled = false;
                $rootScope.$emit('baoInlineEditor.enabled', this.enabled);
            }
        };
    }

    function baoinlineeditorVariableDirective() {
        return {
            restrict: 'A',
            scope: {
                baoinlineeditorVariable: '@',
                baoinlineeditorType: '@'
            },
            controller: BaoinlineeditorVariableController,
            link: link
        };
    }

    function BaoinlineeditorVariableController($scope, $element, $attrs, $controller) {
        angular.extend($scope, $controller('BaoInlineEditorBaseController', {
            $scope: $scope,
            $element: $element,
            $attrs: $attrs
        }));

        $scope.save = save;

        //////////////

        function save(value) {
            value = value || $scope.data;

            return $scope._save('/baoinlineedit/variable/', {
                name: $scope.baoinlineeditorVariable,
                value: value
            });
        }
    }

    function baoinlineeditorEntityFieldDirective() {
        return {
            restrict: 'A',
            scope: {
                baoinlineeditorEntityType: '@',
                baoinlineeditorEntityId : '@',
                baoinlineeditorFieldName: '@',
                baoinlineeditorType: '@',
                baoinlineeditorImageThumbnailUrl: '@',
                baoinlineeditorImagePreset: '@'
            },
            controller: baoinlineeditorEntityFieldController,
            link: link
        };
    }

    function baoinlineeditorEntityFieldController($scope, $element, $attrs, $compile, $controller) {
        angular.extend($scope, $controller('BaoInlineEditorBaseController', {
            $scope: $scope,
            $element: $element,
            $attrs: $attrs
        }));
        $scope.init = init;
        $scope.save = save;
        $scope.imageThumbnailUrl = $scope.baoinlineeditorImageThumbnailUrl;


        if ($scope.baoinlineeditorType == 'image') {
            var entityTypeArr = $scope.baoinlineeditorEntityType.split("\\");
            $scope.fileVar = entityTypeArr[entityTypeArr.length - 1] +  $scope.baoinlineeditorFieldName.charAt(0).toUpperCase() + $scope.baoinlineeditorFieldName.substr(1) + $scope.baoinlineeditorEntityId;
        }

        ////////////////

        function init() {
            $scope.data = $element.html();

            $element.addClass('baoinlineeditor');
            $element.addClass('baoinlineeditor-' + $scope.baoinlineeditorType);

            if ($scope.baoinlineeditorType == 'image') {
                var child = getChildDirective($scope.baoinlineeditorType,  $scope.baoinlineeditorEntityType, $scope.baoinlineeditorEntityId, $scope.baoinlineeditorFieldName, $scope.baoinlineeditorImageThumbnailUrl, $scope.fileVar);
            } else {
                var child = getChildDirective($scope.baoinlineeditorType,  $scope.baoinlineeditorEntityType, $scope.baoinlineeditorEntityId, $scope.baoinlineeditorFieldName);
            }

            if (typeof(child) == 'string') {
                child = angular.element(child);
            }
            $compile(child)($scope);
            $element.html('');
            $element.append(child);
        }

        function getChildDirective(type, entityType, entityId, fieldName, imageThumbnailUrl, fileVar) {
            switch (type) {
                case 'image':
                    return '<img data-ng-src="{{imageThumbnailUrl}}">' +
                        '<div class="file-uploader-wrapper">' +
                        '<a class="upload-button" href="javascript:">Upload New Photo</a>' +
                        '<ng-single-file-uploader data-allowed="jpg,jpeg,png" ng-model="' + fileVar + '"' +
                        'data-ng-file-uploader-options="fileUploaderOptions"></ng-single-file-uploader>' +
                        '</div>';
                case 'text':
                    return $scope.typeTextHtml;
                case 'ckeditor':
                    return  $scope.typeCkeditorHtml;
            }
        }

        if ($scope.baoinlineeditorType == 'image') {
            var uploaderKey = $scope.baoinlineeditorEntityId == undefined ? 'new' + Math.floor(Math.random() * 1000000) : $scope.baoinlineeditorEntityId;
            var entityType = $scope.baoinlineeditorEntityType.split("\\").join("-");
            var url = '/baoinlineedit/entity-field/upload-entity-image/' + entityType + '/' + $scope.baoinlineeditorFieldName +
                '/' + $scope.baoinlineeditorEntityId + '/' + uploaderKey;
            if ($scope.baoinlineeditorImagePreset) {
                url += '/' + $scope.baoinlineeditorImagePreset;
            }
            $scope.fileUploaderOptions = {
                url: url
            };

            $scope.$watch($scope.fileVar, function ($newValue) {
                if (($newValue) && ($newValue.filename)) {
                    $scope.imageThumbnailUrl = $newValue.thumbnailUrl;
                }
            }, true);
        }

        function save(value) {
            value = value || $scope.data;

            return $scope._save('/baoinlineedit/entity-field/', {
                entityType: $scope.baoinlineeditorEntityType,
                entityId: $scope.baoinlineeditorEntityId,
                fieldName: $scope.baoinlineeditorFieldName,
                value: value
            });
        }
    }

    function link($scope) {
        $scope.init();
    }

})(angular);

