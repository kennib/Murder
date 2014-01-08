angular.module('murderplot', [])
  .directive('murderPlot', function() {
    return function(scope, elements, attrs) {
      var formatDatetime = d3.time.format("%I %p"),
          formatHours = function(d) { return formatDatetime(new Date(0,0,0, d)); },
          getHours = function(d) { return new Date(d).getHours(); };

      var width = 960,
          height = 500,
          outerRadius = height / 2 - 10,
          innerRadius = 120;
      
      // Map 24 hours to the plot's angles
      angle = d3.scale.linear()
          .range([0, 2 * Math.PI])
          .domain([0, 24]);
      
      // Map values to the plot's radius
      var radius = d3.scale.linear()
          .range([innerRadius, outerRadius]);
      
      // A map of kill totals to colours
      var colour = d3.scale.linear().domain([0,10,20,30,40,50]).range(["#F7E9A6", "#BEFF9D","#2391BD","#684785","#FF363D"])
      
      // A function to divide the data into 24 bins of an hour each
      var hist = d3.layout.histogram()
          .bins(angle.ticks(24));
      
      // A function to generate radial lines
      var line = d3.svg.line.radial()
          .interpolate("cardinal-closed")
          .angle(function(d) { return angle(d.datetime); })
          .radius(function(d) { return radius(d.y0 + d.y); });
      
      // A function to generate radial areas
      var area = d3.svg.arc()
          .startAngle(function(d) { return angle(d.x); })
          .endAngle(function(d) { return angle(d.x+1) })
          .innerRadius(function(d) { return radius(0); })
          .outerRadius(function(d) { return radius(d.y); });
      
      // Create the diagram
      var svg = d3.select(elements[0]).append("svg")
          .attr("width", width)
          .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      
      // Add night and day sections
      svg.append("path")
        .attr("class", "night")
        .attr("d", function(d) {
              return d3.svg.arc()
                .startAngle(angle(20)) // 8pm
                .endAngle(angle(6)+angle(24)) // 6am
                .innerRadius(function(d) { return 0; })
                .outerRadius(function(d) { return innerRadius - 30; })();
            })
            .attr("fill", "#101630")
      svg.append("path")
        .attr("class", "day")
        .attr("d", function(d) {
              return d3.svg.arc()
                .startAngle(angle(6)) // 6am
                .endAngle(angle(20)) // 8pm
                .innerRadius(function(d) { return 0; })
                .outerRadius(function(d) { return innerRadius - 30; })();
            })
            .attr("fill", "#F7F1E1")
      
      // Seperate axes and data
      var dataGroup = svg.append("g")
          .attr("class", "data");
      var axesGroup = svg.append("g")
          .attr("class", "axes");
      
      // Create the axes
      var axes = axesGroup.selectAll(".axis")
          .data(d3.range(angle.domain()[0], angle.domain()[1], 3)); // An axis for every two hours
      
      axes.enter().append("g")
          .attr("class", "axis")
          .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
        .call(d3.svg.axis()
          .scale(radius.copy().range([-innerRadius, -outerRadius]))
          .orient("left"))
        .append("text") // Axis time label
          .attr("y", -innerRadius + 6)
          .attr("dy", ".71em")
          .attr("text-anchor", "middle")
          .text(function(d) { return formatHours(d); })
        
      axes.append("text") // Axis y label
          .attr("x", "-.71em")
          .attr("y", (outerRadius+innerRadius)/2)
          .attr("dy", ".71em")
          .attr("text-anchor", "middle")
          .attr("writing-mode", "tb")
          .text("murders")
        ;
      
      // Function to update murders when murders have changed
      scope.$watch(attrs.murders, updateMurders, true);
      
      function updateMurders(murders) {
        // Divide the murders in to 24 hour based groups
        var murderHours = murders.map(function (d) { return getHours(d.datetime)});
        data = hist(murderHours);
        
        // Extend the domain of the murder tally
        radius.domain([0, d3.max(data, function(d) { return d.y; })]);
        
        // Update axes displays
        axes.call(d3.svg.axis()
          .scale(radius.copy().range([-innerRadius, -outerRadius]))
          .orient("left"))
        
        // Remove old plots
        dataGroup.selectAll(".hour").remove();
        
        // Plot the kills for each hour on the graph
        var hours = dataGroup.selectAll(".hour")
          .data(data);
        
        hours.enter().append("path")
             .attr("class", "hour")
             .attr("d", function(d) { return area(d); })
             .attr("fill", function(d) { return colour(d.y); });
      };
      
      // Function update the indicator for the current time
      scope.$watch(attrs.time, function(time) {
        var hour = getHours(time);

        // Remove the old indicator
        svg.selectAll(".time").remove();
        
        if (time != undefined) {
          // Add the new indicator
          svg.append("path")
            .attr("class", "time")
            .attr("d", function(d) {
              return d3.svg.arc()
                .startAngle(angle(hour))
                .endAngle(angle(hour+1))
                .innerRadius(function(d) { return innerRadius - 40; })
                .outerRadius(function(d) { return innerRadius - 20; })();
            })
            .attr("fill", "#F76D20")
        }
      });
      
      // Function to update axes visibility
      scope.$watch("showAxes", function(show) {
        console.log("hello");
        axesGroup.attr("visibility", show ? "visible" : "hidden");
      });
    };
  });