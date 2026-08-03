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

    L.geoJSON(window.mapData.county.geometry, {
        style: {
            color: '#0066cc',
            weight: 2,
            fill: false
        }
    }).addTo(map);

L.geoJSON(window.mapData.commercialCore.geometry, {
    style: {
        color: '#ff8800',
        weight: 2,
        fillColor: '#ffcc66',
        fillOpacity: 0.25
    },

    onEachFeature: function(feature, layer) {

        layer.bindTooltip(`
            <b>${window.mapData.commercialCore.county} Commercial Core</b><br>
            Radius: ${window.mapData.commercialCore.commercial_core_radius_miles} miles<br>
            window.mapData.commercialCore.commercial_core_enterprises.toLocaleString()
            (${window.mapData.commercialCore.commercial_core_enterprise_pct}%)<br>
            Employees: ${window.mapData.commercialCore.commercial_core_employees.toLocaleString()}
            (${window.mapData.commercialCore.commercial_core_employee_pct}%)<br>
            MSP Competitors: ${window.mapData.commercialCore.competitor_count}
        `, {
            sticky: true,
            direction: 'top',
            opacity: 0.95
        });

    }

}).addTo(map);
console.log(window.mapData.msps[0]);    
window.mapData.msps.forEach(msp => {

    L.circleMarker(
        [
            msp.geometry.coordinates[1],
            msp.geometry.coordinates[0]
        ],
        {
            radius: Math.max(3, msp.sas / 10),
            color: msp.band_color,
            fillColor: msp.band_color,
            fillOpacity: 1
        }
    )
.bindTooltip(`
    <b>${msp.title}</b><br>
    SAS: ${msp.sas}<br>
    Band: ${msp.structuralauthorityband}<br>
    Segment: ${msp.segment}<br>
    Rating: ${msp.rating} (${msp.user_rating_count} reviews)<br>
    DA: ${msp.domain_authority}<br>
    Backlinks: ${msp.backlinks}<br>
    Pages: ${msp.pages_crawled}<br>
    Link Propensity: ${msp.link_propensity}
`, {
    sticky: true,
    direction: 'top',
    opacity: 0.95
})
.addTo(map);

});   // <-- closes the forEach()

})      // <-- closes the .then(data => { ... })

.catch(error => {
    console.error('Map data error:', error);
});
