angular.module('BusinessCardCreator', [])

.factory('Colors', function() {
  return [
    '#00CDED',
    '#8CC63F',
    '#42D0B3',
    '#993092',
    '#FF5C5C',
    '#FFB600'
  ];
})

.factory('Icons', function() {
  return [
    'hi-wrench',
    'hi-bottle',
    'hi-brush',
    'hi-bulb',
    'hi-plunger',
    'fa fa-binoculars'
  ];
})

.factory('LocalStorageValues', function () {
  return {
    name:          localStorage.getItem('bCardCreator.name') || 'Your Name',
    title:         localStorage.getItem('bCardCreator.title') || 'YOUR TITLE',
    email:         localStorage.getItem('bCardCreator.email') || 'email@example.com',
    couponInfo:    localStorage.getItem('bCardCreator.couponInfo') || '3-hour home cleaning for $29',
    coupon:        localStorage.getItem('bCardCreator.coupon') || 'Use code: COUPONCODE',
    selectedColor: localStorage.getItem('bCardCreator.selectedColor') || '#00CDED',
    selectedIcon:  localStorage.getItem('bCardCreator.selectedIcon') || 'hi-wrench'
  };
})

.controller('BusinessCardController',
  ['$scope', '$window', 'Colors', 'Icons', 'LocalStorageValues',
    function($scope, $window, Colors, Icons, LocalStorageValues) {
      // Set the colors and select the default one
      $scope.colors        = Colors;

      // Set the icons and select the default one
      $scope.icons        = Icons;

      $scope.dynamicContent = LocalStorageValues;

      $scope.nonSelectedColors = function() {
        return _.reject($scope.colors, function(color) {
          return color == $scope.dynamicContent.selectedColor;
        });
      };

      $scope.setSelectedColor = function(color) {
        $scope.dynamicContent.selectedColor = color;
        localStorage.setItem('bCardCreator.selectedColor', color);
      };

      $scope.downloadCard = function(e) {
        html2canvas($(".business-card"), {
          letterRendering: true,
          onrendered: function(canvas) {
            // var imgData = canvas.toDataURL('image/png');
            // var link    = angular.element(e.target).parent();
            // link.download = imgData;
            $window.open(canvas.toDataURL('image/png'));
          }
        });
      };
}])

.directive('kernable', function() {
  return {
    link: function(scope, element) {
      element.addClass('kernable');
      element.after('<i class="fa fa-pencil"></i>');

      angular.element('.kernable', element.parent()).bind('click', function() {
        element.focus();
        element[0].contentEditable = true;
        document.execCommand('selectAll', false, null);
      });

      element.bind('blur', function() {
        element[0].contentEditable = false;
      });
    }
  };
})

.directive("contenteditable", function() {
  return {
    scope: {
      attribute: '=ngModel'
    },
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {
      scope.$watch('attribute', function(newVar, oldVar) {
        attrName = element.attr('ng-model').split('.')[1];
        localStorage.setItem('bCardCreator.' + attrName, newVar);
      });

      function read() {
        ngModel.$setViewValue(element.text());
      }

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || "");
      };

      element.bind("blur keyup change", function(e) {
        scope.$apply(read);
      });
    }
  };
});
