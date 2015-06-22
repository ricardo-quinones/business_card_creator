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
    {iconClass: 'hi-bottle',        content: '\e606'},
    {iconClass: 'hi-brush',         content: '\e607'},
    {iconClass: 'hi-bulb',          content: '\e608'},
    {iconClass: 'hi-plunger',       content: '\e609'},
    {iconClass: 'hi-wrench',        content: '\e60a'},
    {iconClass: 'fa fa-binoculars', content: '\f1e5'}
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
    selectedIcon:  JSON.parse(localStorage.getItem('bCardCreator.selectedIcon')) || {iconClass: 'hi-wrench', content: '\e60a'}
  };
})

.controller('BusinessCardController',
  ['$scope', '$window', '$timeout', 'Colors', 'Icons', 'LocalStorageValues',
    function($scope, $window, $timeout, Colors, Icons, LocalStorageValues) {
      // Set the colors and select the default one
      $scope.colors = Colors;

      // Set the icons and select the default one
      $scope.icons = Icons;

      // Get the browser's local storage values
      $scope.dynamicContent = LocalStorageValues;

      $scope.switchSides = function() {
        $scope.back = !$scope.back;

        if ($scope.back) {
          $('.download').attr('download', 'business_card_back.jpeg');
        } else {
          $('.download').attr('download', 'business_card_front.jpeg');
        }
      };

      $scope.nonSelectedColors = function() {
        return _.reject($scope.colors, function(color) {
          return color == $scope.dynamicContent.selectedColor;
        });
      };

      $scope.setSelectedColor = function(color) {
        $scope.dynamicContent.selectedColor = color;
        localStorage.setItem('bCardCreator.selectedColor', color);
      };

      $scope.setSelectedIcon = function(icon) {
        $scope.dynamicContent.selectedIcon = icon;
        localStorage.setItem('bCardCreator.selectedIcon', JSON.stringify(icon));
      };

      $scope.downloadCard = function(e) {
        var $printableBusinessCard, $link, fileName;

        $link = $('.download');

        if ($link.attr('href')) {
          $timeout(function() { $link.attr('href', null); });
          return true;
        }

        $printableBusinessCard = $('.printable-business-card');
        $printableBusinessCard.show();
        $printableBusinessCard.empty().html($(".business-card").clone());

        if ($('.business-card').hasClass('show-back')) {
          $('.front', $printableBusinessCard).hide();
          $('.back', $printableBusinessCard).show();
        } else {
          $('.front', $printableBusinessCard).show();
          $('.back', $printableBusinessCard).hide();
        }

        html2canvas($printableBusinessCard, {
          onrendered: function(canvas) {
            ctx = canvas.getContext('2d');

            if ($('.business-card').hasClass('show-back')) {
              // Set the Handy logo onto the canvas
              $scope.setHandyIconOnCanvas(ctx, $printableBusinessCard);
            } else {
              // Set the selected icon onto the canvas
              $scope.setIconOnCanvas(ctx, $printableBusinessCard);

              // Set the star onto the canvas
              $scope.setStarOnCanvas(ctx, $printableBusinessCard);
            }

            var image = canvas.toDataURL('image/jpeg');
            $printableBusinessCard.hide();
            $link.attr('href', image.replace(/^data:image\/[^;]/, 'data:application/octet-stream'));
            $link[0].click();
          }
        });
      };

      $scope.setIconOnCanvas = function(ctx, $printableBusinessCard) {
        var font, $icon, ctxXCoord, ctxYCoord, iconContent;
        $icon            = $('.front-icon', $printableBusinessCard);
        font             = $('i', $icon).css('font').match(/handy|FontAwesome/)[0];
        ctxXCoord        = $printableBusinessCard.outerWidth() / 2;
        ctxYCoord        = parseFloat(window.getComputedStyle($icon[0])['margin-top']) + ($icon.outerHeight() / 2);
        ctx.fillStyle    = $scope.dynamicContent.selectedColor;
        ctx.font         = $('i', $icon).outerHeight() + 'px ' + font;
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'center';
        ctx.fillText(String.fromCharCode("0x" + $scope.dynamicContent.selectedIcon.content), ctxXCoord, ctxYCoord);
      };

      $scope.setStarOnCanvas = function(ctx, $printableBusinessCard) {
        var font, $icon, ctxXCoord, ctxYCoord;
        $star            = $('.hi-star', $printableBusinessCard);
        ctxXCoord        = $printableBusinessCard.outerWidth() / 2;
        ctxYCoord        = $star.offset().top - $printableBusinessCard.offset().top;
        ctx.fillStyle    = 'white';
        ctx.font         = $star.outerHeight() + 'px handy';
        ctx.textBaseline = 'top';
        ctx.textAlign    = 'center';
        ctx.fillText('\ue62d', ctxXCoord, ctxYCoord);
      };

      $scope.setHandyIconOnCanvas = function(ctx, $printableBusinessCard) {
        var font, $icon, ctxXCoord, ctxYCoord;
        $logo            = $('.hi-logo', $printableBusinessCard);
        ctxXCoord        = $printableBusinessCard.outerWidth() / 2;
        ctxYCoord        = $printableBusinessCard.outerHeight() / 2;
        ctx.fillStyle    = 'white';
        ctx.font         = $logo.outerHeight() + 'px handy';
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'center';
        ctx.fillText('\ue60c', ctxXCoord, ctxYCoord);
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
