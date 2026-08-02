// ------------------------------------------------------
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
