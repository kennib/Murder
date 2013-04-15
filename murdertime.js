angular.module('murderstats', ['murderdata']).
  directive('murderTime',
  function($filter, $timeout, murders, players) {
    return {
      restrict: 'A',
      templateUrl: 'murdertime.html',
      link: function(scope, elements, attrs) {
        // Add data to the scope
        scope.players = players;
        scope.murders = murders;

        // Boolean for play state
        scope.playing = false;

        // Datetime selector
        scope.datetime = new Date();
        scope.date = $filter('date')(scope.datetime, 'yyyy-MM-dd');
        scope.time = $filter('date')(scope.datetime, 'HH:mm');
        
        // Function to update datetime
        scope.updateTime = function() {
          scope.datetime = new Date(scope.date+' '+scope.time);
          // Call the update callback with murders before the given time
          var m = $filter('murderBefore')(scope.murders, scope.datetime);
          var cb = scope[attrs.update];
          if (cb) cb(m);
        };
     
        // The amount of time in seconds the display progresses per second
        scope.speed = 3600; // 1hr/sec
        // Real time between updates in milliseconds
        scope.step = 500;

        // Function to play the graph over time
        scope.play = function(from, to) {
          // Convert to epoch time
          from = from.valueOf();
          to = Math.min(to.valueOf(), scope.murders[scope.murders.length-1].datetime);

          // Play per step
          scope.date = $filter('date')(from, 'yyyy-MM-dd');
          scope.time = $filter('date')(from, 'HH:mm');
          scope.updateTime();
          
          // Next Step
          from += scope.speed*scope.step;
          if (scope.playing && from <= to+(scope.speed*scope.step)) {
            $timeout(function(){scope.play(from, to)}, scope.step);
          } else {
            scope.playing = false;
          }
        }
      }
    };
  });
