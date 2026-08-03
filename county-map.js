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

// ------------------------------------------------------
// Legend
// ------------------------------------------------------

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {

    const div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = `
        <div style="
            background:white;
            padding:12px;
            border-radius:8px;
            box-shadow:0 1px 6px rgba(0,0,0,.35);
            font-family:Arial,sans-serif;
            font-size:13px;
            line-height:1.5;
        ">

        <b>Map Legend</b><br><br>

        <div>
            <span style="
                display:inline-block;
                width:22px;
                border-top:3px solid #0066cc;
                margin-right:8px;
                vertical-align:middle;
            "></span>
            County Boundary
        </div>

        <div style="margin-top:6px;">
            <span style="
                display:inline-block;
                width:18px;
                height:18px;
                border:2px solid #ff8800;
                background:#ffcc66;
                opacity:.7;
                border-radius:50%;
                margin-right:8px;
                vertical-align:middle;
            "></span>
            Commercial Core
        </div>

        <br>

        <b>Structural Authority Band</b><br>

        <div><span style="color:#8b0000;">&#9679;</span> No Growth Foundation</div>
        <div><span style="color:#f44336;">&#9679;</span> Early Foundation</div>
        <div><span style="color:#ff9800;">&#9679;</span> Developing Platform</div>
        <div><span style="color:#2e8b57;">&#9679;</span> Existing Scalable Engine</div>
        <div><span style="color:#0b6623;">&#9679;</span> Mature Growth Asset</div>

        <br>

        <b>Marker Size</b><br>

        <div>
            <span style="font-size:8px;">&#9679;</span>
            <span style="font-size:12px;">&#9679;</span>
            <span style="font-size:16px;">&#9679;</span>

            &nbsp;Increasing SAS
        </div>

        </div>
    `;

    return div;

};

legend.addTo(map);

    
.catch(error => {
    console.error('Map data error:', error);
});
