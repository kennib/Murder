// The diagram module
var diagrams = angular.module('diagrams', []);

diagrams
	.directive('diagram', function() {
		return function(scope, element, attrs) {
			// Get the type of diagram
			var diagramType = scope.$eval(attrs.diagram);
			
			// SVG display for the diagram
			var svg = d3.select(element[0]).append("svg");
			// Group together elements of the diagram
			var dataSvg = svg.append("g")
				.attr("class", "data");
			var chartSvg = svg.append("g")
				.attr("class", "chart");
			
			// Colour map function for the graph
			var colourMap = d3.scale.category20();
			
			// A function which updates the diagram based on data changes
			updateDiagram = function(data) {
				// Get the dimensions of the diagram
				var height = element[0].offsetHeight,
					width = element[0].offsetWidth;

				// The list of attributes of each data point
				var attributes = data.map(function(d) { return d[attrs.attribute]; });
				
				// The elements of data
				var dataElements = dataSvg.selectAll(".datum").data(data);
				dataElements.enter()
					.append("g")
						.attr("class", "datum");
				dataElements.exit().remove();
			
				switch(diagramType) {
					case "bar":
						// Generalise dimensions
						var xMax = width,
							yMax = height;
						
						// Size of elements in x dimension
						var xSize = xMax/data.length;
						// Function which maps data to x position
						var xPos = d3.scale.linear()
							.domain([0, data.length])
							.range([0, xMax]);
						// Function which maps data to its size in the y dimension
						ySize = d3.scale.linear()
							.domain([0, d3.max(attributes)])
							.range([0, yMax]);
						
						// Define element layout
						dataElements
							.append("rect")
								.attr("x", function(d,i) { return xPos(i); })
								.attr("y", function(d) { return yMax - ySize(d[attrs.attribute]); })
								.attr("width", xSize)
								.attr("height", function(d) { return ySize(d[attrs.attribute]); })
								.attr("title", function(d) { return d.name; })
					break;
				}
				
				// Colour each element
				dataElements
					.attr("fill", function(d,i) { return colourMap(i); });
				// Add a title to each element
				dataElements
					.append("title")
						.text(function(d) { return d.name; });
			}
			
			// Update the diagram on changes in the data
			scope.$watch(attrs.data, updateDiagram, true);
		};
	})
