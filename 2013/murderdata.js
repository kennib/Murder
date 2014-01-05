// Database initialisation
Parse.initialize("gKrTJTdWXJlQSTbjaxYLxhNc6aW7DAloSJGHGKJJ", "RblsWTyF9GRlPQkusJRSrb9Sv9PTyGW6EtWbz3Ue");
var UnverifiedMurder = Parse.Object.extend("UnverifiedMurder");
var Murder = Parse.Object.extend("Murder");
var Player = Parse.Object.extend("Player");
var UnverifiedMurders = Parse.Collection.extend({model: UnverifiedMurder});
var Murders = Parse.Collection.extend({model: Murder});
var Players = Parse.Collection.extend({model: Player});
var objList = function(obj, orderBy, reverse) {
  return function($rootScope) {
    var objs = [];
    var query = new Parse.Query(obj);
    query.ascending("name");
    query.limit(200);
    if (orderBy) {
      if (reverse)
        query.descending(orderBy);
      else
        query.ascending(orderBy);
    }
    query.find({
      success: function(objData) {
        // Convert data to JSON
        objData.forEach(function(obj, o) {
          objData[o] = obj.toJSON();
        });
        // A bit of a hack to automatically
        // load the data from the DB asynchronously
        angular.extend(objs, objData);
        $rootScope.$apply();
      }
    });
    return objs;
  }
};

// The data module
angular.module('murderdata', []).
  value('UnverifiedMurder', UnverifiedMurder).
  value('Murder', Murder).
  value('Player', Player).
  factory('unverifiedMurders', objList(UnverifiedMurder, "datetime", true)).
  factory('murders', objList(Murder, "datetime")).
  factory('players', objList(Player, "name")).
  // A filter that filters murders before a given datetime
  filter('murderBefore', function() {
    return function(murders, datetime) {
      var validMurders = [];
      if (datetime == undefined)
        datetime = new Date().valueOf(); // now

      // Filter out murders after the given time
      murders.forEach(function(murder) {
        if (murder.datetime <= datetime)
          validMurders.push(murder);
      });

      return validMurders;
    };
  }).
  // A filter that filters living players
  filter('alive', function(murders) {
    return function(players, datetime) {
      var alivePlayers = [];
      if (datetime == undefined)
        datetime = new Date().valueOf(); // now

      // Filter out the dead players
      players.forEach(function(player) {
        var alive = true;
        murders.forEach(function(murder) {
          if (player.name == murder.victim)
            alive = false;
        });
        if (alive)
          alivePlayers.push(player);
      });

      return alivePlayers;
    };
  });
