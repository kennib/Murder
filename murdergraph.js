angular.module('murdergraph', [])
  .directive('murderGraph', function() {
    return function(scope, elements, attrs) {
      var color = d3.scale.category20();

      // The force graph model
      var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)

      // The SVG elements
      var svg = d3.select("#murderGraph").append("svg")

      var linkGroup = svg.append("g");
      var nodeGroup = svg.append("g");
      
      // The arrow for each murder
      var arrowhead = svg
        .append("svg:marker")
          .attr("id", "triangle")
          .attr("viewBox","0 0 20 20")
          .attr("refX","10")
          .attr("refY","5")
          .attr("markerUnits","strokeWidth")
          .attr("markerWidth","10")
          .attr("markerHeight","10")
          .attr("orient","auto")
          .append("svg:path")
            .attr("d","M 0 0 L 10 5 L 0 10 z")
            .attr("triangle");

      // The murder graph
      var graph = {
        players: [],
        murders: []
      };

      var nodes = [];
      var links = [];
      var names = [];

      // Function to update players
      scope.$watch(attrs.players, function(players) {
        if (players != undefined)
          graph.players = players;

        updateLinks();
        updateGraph();
      }, true);

      // Function to update murders
      scope.$watch(attrs.murders, function(murders) {
        if (murders != undefined)
          graph.murders = murders;

        updateLinks();
        if (graph.players.length > 0)
          updateGraph();
      }, true);

      // Add source and target values
      var updateLinks = function() {
        for (var m in graph.murders) {
          var murder = graph.murders[m];
          var source = undefined,
              target = undefined;
          for (var p in graph.players) {
            var player = graph.players[p];
            if (player.name == murder.murderer)
              source = parseInt(p);
            if (player.name == murder.victim)
              target = parseInt(p);
            if (source!=undefined && target!=undefined)
              break;
          }
          murder.source = source;
          murder.target = target;
        }
      }


      // Update function
      updateGraph = function() {
        // Update values
        force
          .size([elements[0].offsetWidth, elements[0].offsetHeight])
          .charge(function(d) { return -40 - 10*d.kills })
          .linkDistance(function(d) { return d.source.radius + d.target.radius + 12; })
          .nodes(graph.players)
          .links(graph.murders)
          .start();

        // Update links
        links = linkGroup.selectAll("line.link")
            .data(graph.murders);
        
        links.enter()
          .append("line")
            .attr("class", "link");
        links.exit().remove();
        
        // Add stats
        graph.players.forEach(function(player) {
          player.dead = false;
          player.kills = 0;
        });
        graph.murders.forEach(function(murder) {
          // He's dead Jim
          murder.target.dead = true;
          // Count the kills
          murder.source.kills++;
        });


        // Update nodes
        nodes = nodeGroup.selectAll("circle.node")
            .data(graph.players);

        // Add circles for nodes
        nodes.enter()
          .append("circle")
            .attr("class", "node");
        // Add player names
        nodes.append("title")
               .text(function(d) { return d.name; });

        nodes
          .classed("dead", function(d) { return d.dead; })
          .classed("alive", function(d) { return !d.dead; })
          .attr("r", function(d) { d.radius = Math.pow(d.kills+1, 2)/4 + 5; return d.radius; })
          .style("fill", function(d) { return color(d.type); })
          .call(force.drag);
        nodes.exit().remove();

        // Update player names
        names = svg.selectAll("text.playerName")
            .data(graph.players);

        names.enter()
          .append("text")
            .text(function(d) { return d.name; })
            .attr("class", "playerName");
        names
          .classed("dead", function(d) { return d.dead; })
          .classed("alive", function(d) { return !d.dead; })
      }
      
      // Update the positions of the SVG elements
      // according to the force graph model
      force.on("tick", function() {
        force
          .size([elements[0].offsetWidth, elements[0].offsetHeight]);

        links.attr("x1", function(d) {
               var angle = Math.atan2(d.source.y-d.target.y, d.source.x-d.target.x);
               return d.source.x + Math.cos(angle)*d.source.radius;
             })
             .attr("y1", function(d) {
               var angle = Math.atan2(d.source.y-d.target.y, d.source.x-d.target.x);
               return d.source.y + Math.sin(angle)*d.source.radius;
             })
             .attr("x2", function(d) {
               var angle = Math.atan2(d.source.y-d.target.y, d.source.x-d.target.x);
               return d.target.x + Math.cos(angle)*d.target.radius;
             })
             .attr("y2", function(d) {
               var angle = Math.atan2(d.source.y-d.target.y, d.source.x-d.target.x);
               return d.target.y + Math.sin(angle)*d.target.radius;
             });

        nodes.attr("cx", function(d) { return d.x; })
             .attr("cy", function(d) { return d.y; })
        
        svg.selectAll('text.playerName')
             .attr("x", function(d) { return Math.floor(d.x - this.getBBox().width/2); })
             .attr("y", function(d) { return Math.floor(d.y + d.radius); })
             .attr("visibility", function(d) {
               if ((scope.showAlive && d.alive) || (scope.showDead && !d.alive))
                 return 'visible';
               else
                 return 'hidden';
             });
      });
    }
  });
