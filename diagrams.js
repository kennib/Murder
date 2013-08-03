// The diagram module
var diagrams = angular.module('diagrams', []);

diagrams
	.directive('diagram', function() {
		return function(scope, element, attrs) {
			// Get the type of diagram
			var diagramType = attrs.diagram;
			
			// SVG display for the diagram
			var svg = d3.select(element[0]).append("svg");
		};
	})
