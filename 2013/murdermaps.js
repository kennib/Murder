angular.module('murdermaps', [])
  .directive('murderLocation', function() {
    return {
      scope: {
        map: '=',
        marker: '=',
      },
      controller: function($scope, $element, $attrs) {
        var killPos = new google.maps.LatLng(-33.890679,151.186134); // Women's college by default

        var mapOptions = {
          center: killPos,
          zoom: 18,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
         
        $scope.map = new google.maps.Map($element[0], mapOptions);

        $scope.marker = new google.maps.Marker({
            map: $scope.map, 
            position: killPos,
            draggable: true
        });
      },
    };
  })
  .directive('murderMap', function() {
    return function(scope, elements, attrs) {
      scope.mapOptions = {
        center: new google.maps.LatLng(-33.889352,151.190391), // Between SIT and Women's College
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      // The google map object
      var murderMap = scope.$parent.murderMap = new google.maps.Map(elements[0], scope.mapOptions);
      // A list of markers (representing murders)
      murderMap.markers = [];
      murderMap.locations = [];
      // The heatmap of murders
      murderMap.heatmap = new google.maps.visualization.HeatmapLayer({
        data: murderMap.locations,
        radius: 25,
        maxIntensity: 4,
        map: murderMap
      });

      // Hide/show markers
      scope.$watch('showMarkers', function(showMarkers) {
        for (var m in murderMap.markers) {
          var marker = murderMap.markers[m];
          if (showMarkers)
            marker.setVisible(true);
          else
            marker.setVisible(false);
        }
      });

      // Hide/show heat map
      scope.$watch('showHeatmap', function(showHeatmap) {
        if (showHeatmap)
          murderMap.heatmap.setMap(murderMap);
        else
          murderMap.heatmap.setMap(null);
      });
      
      // Hide/show custom icons
      scope.$watch('showIcons', function(showIcons) {
        for (var m in murderMap.markers) {
          var marker = murderMap.markers[m];
          if (showIcons)
            marker.setIcon(marker.killIcon);
          else
            marker.setIcon();
        }
      });

      // Update the murders on the map
      scope.$watch(attrs.murders, function(murders) {
        // Set all the markers to invisible
        for (var m in murderMap.markers) {
          var marker = murderMap.markers[m];
          marker.setVisible(false);
        }
        // Reset visible locations
        murderMap.locations = [];

        // Go through the list of murders to be displayed
        for (var m in murders) {
          var murder = murders[m];
          var murderid = murder.murderer+'-'+murder.victim;

          // If the murder is new add a new marker
          if (murderMap.markers[murderid] == undefined) {
            // The map marker for the murder
            var marker = new google.maps.Marker({
              map: murderMap,
              position: new google.maps.LatLng(murder.latlng.latitude, murder.latlng.longitude),
              title: murder.murderer + ' killed ' + murder.victim,
            });
            // The pop up info window for the murder
            marker.infoWindow = new google.maps.InfoWindow({
              content: murder.murderer + ' Killed ' + murder.victim + ' on ' + new Date(murder.datetime)
            });
            // Pop up the info window on marker click
            google.maps.event.addListener(marker, 'click', function () {
                this.infoWindow.open(murderMap, this);
            });

            murderMap.markers[murderid] = marker;
            if (murder.killIcon)
              marker.killIcon = 'images/icons/'+murder.killIcon;
          } else {
            // Make the murder visible
            var marker = murderMap.markers[murderid];
            if (scope.showMarkers)
              marker.setVisible(true);
          }
          // Add the location of the murder
          murderMap.locations.push(marker.position);
        }
        
        // Update heat map
        murderMap.heatmap.setData(murderMap.locations);
      }, true);
    }
  });
