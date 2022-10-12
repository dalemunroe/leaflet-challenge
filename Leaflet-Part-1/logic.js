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

    // -------------------------------------------------------------------
    // Define function to create the circle radius based on the magnitude
    function radiusSize(magnitude) {
      return magnitude * 50000;
    }

    // Define function to set the circle color based on the depth of epicentre, earthquakes with greater depth from surface (elevation) should appear darker in colour
    function circleColor(depthFromSurface) {
      if (depthFromSurface < -500) {
        return "#00ffcc"; // cyan
      } else if (depthFromSurface < -400) {
        return "#04fc10"; // Green
      } else if (depthFromSurface < -300) {
        return "#F9FD69"; // Yellow
      } else if (depthFromSurface < -200) {
        return "#fdbc03"; // Orange
      } else if (depthFromSurface < -100) {
        return "#fd2d03"; // Red
      } else {
        return "brown"; // Black
      }
    }

    // -------------------------------------------------------------------

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    // let earthquakes = L.geoJSON(earthquakeData, {
    //   onEachFeature: onEachFeature
    // });

    let earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (earthquakeData, latlng) {
        return L.circle(latlng, {
          radius: radiusSize(earthquakeData.properties.mag),
          //color: circleColor(earthquakeData.properties.mag), //circleColor(earthquakeData.properties.mag),
          color: circleColor(earthquakeData.geometry.coordinates[2]),
          fillOpacity: 0.5,
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

    let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

    // -------------------------------------------------------------------
    // This is only for Part 2
    let tectonicPlates = new L.LayerGroup();

    d3.json(
      "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
    ).then(function (tectonicPlateData) {
      L.geoJson(tectonicPlateData).addTo(tectonicPlates);
      tectonicPlates.addTo(myMap);
      console.log(tectonicPlates);
    });
    // -------------------------------------------------------------------

    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo,
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes,
      Tectonic_Plates: tectonicPlates, // This is only for Part 2
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [0, 20.0],
      zoom: 2.5,
      layers: [topo, earthquakes],
    });

    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control
      .layers(baseMaps, overlayMaps, {
        collapsed: false,
      })
      .addTo(myMap);
  }
});

// -------------------------------------------------------------------
// Set up the legend.
// color function to be used when creating the legend
function getColor(d) {
  return d > 5
    ? "#140300"
    : d > 4
    ? "#fd2d03"
    : d > 3
    ? "#fdbc03"
    : d > 2
    ? "#F9FD69"
    : d > 1
    ? "#04fc10"
    : "#00ffcc";
}

// Add legend to the map
let legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend"),
    mags = ["0", "1", "2", "3", "4", "5"],
    labels = [];

  for (let i = 0; i < mags.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(mags[i] + 1) +'"></i> ' +
      mags[i] +(mags[i + 1] ? "&ndash;" + mags[i + 1] + "<br>" : "+");
  }
  return div;
legend.addTo(myMap);
};



// //-------------------------------------------------------------------
