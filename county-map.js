/// ------------------------------------------------------
// Digitol MIR Map Prototype
// Denver, Colorado
// ------------------------------------------------------

const map = L.map('map').setView(
    [39.7392, -104.9903],
    11
);

// ------------------------------------------------------
// Carto Positron Basemap
// ------------------------------------------------------

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
        attribution:
            '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 20
    }
).addTo(map);

// ------------------------------------------------------
// Retrieve MIR JSON
// ------------------------------------------------------

fetch('https://gis-dev.digitolservices.com/webhook/mir-map')
    .then(response => response.json())
    .then(data => {
        window.mapData = data;
        console.log(window.mapData);
    })
    .catch(error => {
        console.error('Map data error:', error);
    });
