// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});



function createFeatures(earthquakeData) {

  // Define a function to run once for each feature in the features array.
  // Add a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  // Create a GeoJSON layer that contains the features array from the earthquakeData object.
  // Run the onEachFeature function for each piece of data.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: getSize(feature.properties.mag),
        fillColor: getColor(feature.geometry.coordinates[2]),
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}



function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);



  // Create a legend for depth colors
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'legend');
    var grades = [-10, 10, 30, 50, 70, 90];
    var labels = [];

    // Loop through the depth ranges and generate labels with direct hex color values
  for (var i = 0; i < grades.length; i++) {
    var color;
    if (grades[i] > 90) {
      color = '#800026'; // Depth > 90 km
    } else if (grades[i] > 70) {
      color = '#BD0026'; // Depth > 70 km
    } else if (grades[i] > 50) {
      color = '#E31A1C'; // Depth > 50 km
    } else if (grades[i] > 30) {
      color = '#FC4E2A'; // Depth > 30 km
    } else if (grades[i] > 10) {
      color = '#FD8D3C'; // Depth > 10 km
    } else if (grades[i] > 0) {
      color = '#FEB24C'; // Depth > 0 km
    } else {
      color = '#FFEDA0'; // Depth <= 0 km (shallowest)
    }

    div.innerHTML +=
      '<i style="background:' + color + '"></i> ' +
      (grades[i] + (i < grades.length - 1 ? '&ndash;' + grades[i + 1] : '+')) + ' km<br>';
  }

  return div;
};

  legend.addTo(myMap);
}

// Function to get color based on depth
function getColor(depth) {
  return depth > 90 ? '#800026' :
         depth > 70  ? '#BD0026' :
         depth > 50  ? '#E31A1C' :
         depth > 30  ? '#FC4E2A' :
         depth > 10   ? '#FD8D3C' :
         depth > -10   ? '#FEB24C' :
                        '#FFEDA0';
}

// Function to get size based on magnitude
function getSize(magnitude) {
  return magnitude * 5; 
}
