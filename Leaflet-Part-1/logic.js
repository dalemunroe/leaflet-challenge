// Store our API endpoint as queryUrl.
let queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);

  function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place, location and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3> 
    Magnitude: ${feature.properties.mag} <br /> 
    Long,Lat,Depth: ${feature.geometry.coordinates} <br /> 
    Date Time: ${new Date(feature.properties.time)}</h4>`);
    }

    // Define function to create the circle radius based on the magnitude
    function radiusSize(magnitude) {
      return magnitude * 50000;
    }

    // Define function to set the circle color based on the depth of epicentre, earthquakes with greater depth from surface (elevation) should appear darker in colour
    function circleColor(depthFromSurface) {
      if (depthFromSurface > 90) {
        return "rgb(62,0,0)"; 
      } else if (depthFromSurface > 70) {
        return "rgb(100,19,16)"; 
      } else if (depthFromSurface > 50) {
        return "rgb(138,34,31)";
      } else if (depthFromSurface > 30) {
        return "rgb(176,49,46)";
      } else if (depthFromSurface > 10) {
        return "rgb(214,64,61)";
      } else {
        return "rgb(252,79,76)";
      }
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    let earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (earthquakeData, latlng) {
        return L.circle(latlng, {
          radius: radiusSize(earthquakeData.properties.mag),
          //color: circleColor(earthquakeData.properties.mag), //circleColor(earthquakeData.properties.mag),
          fillColor: circleColor(earthquakeData.geometry.coordinates[2]),
          fillOpacity: 0.65,
          stroke: false,
        });
      },
      onEachFeature: onEachFeature,
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }

  function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      // "Topographic Map": topo,
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes,
      // Tectonic_Plates: tectonicPlates, // This is only for Part 2
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [0, 20.0],
      zoom: 2.5,
      layers: [street, earthquakes],
    });

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend"),
        legendScale = ["-10", "10", "30", "50", "70", "90"],

        labels = ["rgb(252,79,76)", 
                  "rgb(214,64,61)", 
                  "rgb(176,49,46)", 
                  "rgb(138,34,31)",
                  "rgb(100,19,16)",
                  "rgb(62,0,0)",
                ];

      for (let i = 0; i < legendScale.length; i++) {
        div.innerHTML +=
        // "<h1> Depth from Surface </h1>"
          "<i style='background:" +

          labels[i] + "'></i> " + legendScale[i] +
          (legendScale[i + 1] ? "&ndash;" + legendScale[i + 1] + "<br>" : "+");
      }
      return div;

    };
    legend.addTo(myMap);
  }
});


