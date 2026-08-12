// ======================================================
// DIGITOL MIR MAP LOADER
// ======================================================

(async function () {

    const mapDiv = document.getElementById("market-map");

    // Normal pages do not contain a map placeholder.
    if (!mapDiv) {
        return;
    }

    const reportId = mapDiv.dataset.reportId;

    if (!reportId) {
        console.error("MIR map error: data-report-id is missing.");
        return;
    }

    console.log("MIR Map Report ID:", reportId);

    // --------------------------------------------------
    // Dependency loaders
    // --------------------------------------------------

    function loadCSS(id, href) {
        return new Promise((resolve, reject) => {

            if (document.getElementById(id)) {
                resolve();
                return;
            }

            const link = document.createElement("link");

            link.id = id;
            link.rel = "stylesheet";
            link.href = href;
            link.onload = resolve;
            link.onerror = () =>
                reject(new Error(`Unable to load stylesheet: ${href}`));

            document.head.appendChild(link);
        });
    }

    function loadScript(id, src) {
        return new Promise((resolve, reject) => {

            if (document.getElementById(id)) {
                resolve();
                return;
            }

            const script = document.createElement("script");

            script.id = id;
            script.src = src;
            script.onload = resolve;
            script.onerror = () =>
                reject(new Error(`Unable to load script: ${src}`));

            document.head.appendChild(script);
        });
    }

    async function initializeCountyMap() {

        const map = L.map(mapDiv);

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

fetch(`https://automation.digitolservices.com/webhook/mir-map?report_id=${encodeURIComponent(reportId)}`)
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
})
.then(data => {
    window.mapData = data;
    console.log(window.mapData);

const countyLayer = L.geoJSON(window.mapData.county.geometry, {
    style: {
        color: '#0066cc',
        weight: 3,
        fill: false
    }
}).addTo(map);

map.fitBounds(countyLayer.getBounds());
    
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
            Businesses: ${window.mapData.commercialCore.commercial_core_enterprises.toLocaleString()}
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
const clusters = L.markerClusterGroup();
    
window.mapData.msps.forEach(msp => {

    L.circleMarker(
        [
            msp.geometry.coordinates[1],
            msp.geometry.coordinates[0]
        ],
        {
            radius: Math.max(6, msp.sas / 8),
            color: msp.band_color,
            fillColor: msp.band_color,
            fillOpacity: 1
        }
    )
.bindTooltip(`
    <b>${msp.title}</b><br>
    SAS: ${msp.sas}<br>
    Band: ${msp.structuralauthorityband}<br>
    Rating: ${msp.rating} (${msp.user_rating_count} reviews)<br>
    DA: ${msp.domain_authority}<br>
    Backlinks: ${Number(msp.backlinks).toLocaleString()}<br>
    Pages: ${Number(msp.pages_crawled).toLocaleString()}<br>
    Link Propensity: ${(Number(msp.link_propensity) * 100).toFixed(4)}%
`, {
    sticky: true,
    direction: 'top',
    opacity: 0.95
})
.addTo(clusters);

});   // <-- closes the forEach()

map.addLayer(clusters);
    
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

        <br>

        <b>MSP Clusters</b><br>

        <div style="margin-top:6px;">
            <span style="
                display:inline-block;
                width:22px;
                height:22px;
                line-height:22px;
                border-radius:50%;
                background:#f4c542;
                color:#000;
                font-weight:bold;
                text-align:center;
                margin-right:8px;
                font-size:11px;
        ">5</span>

        Clustered MSPs - Click to Expand
</div>

<br>

        <b>Search Authority Band (SAB)</b><br>

        <div><span style="color:#8b0000;">&#9679;</span> No Growth Foundation</div>
        <div><span style="color:#f44336;">&#9679;</span> Early Foundation</div>
        <div><span style="color:#ff9800;">&#9679;</span> Developing Platform</div>
        <div><span style="color:#2e8b57;">&#9679;</span> Existing Scalable Engine</div>
        <div><span style="color:#0b6623;">&#9679;</span> Mature Growth Asset</div>

        <br>

        <b>Search Authority Score (SAS)</b><br>

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


})      // <-- closes the .then(data => { ... })    
    
.catch(error => {
    console.error('Map data error:', error);
    }); 
    
    }// closes initializeCountyMap()

    try {

        // Leaflet and MarkerCluster styles
        await Promise.all([
            loadCSS(
                "digitol-leaflet-css",
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            ),
            loadCSS(
                "digitol-markercluster-css",
                "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
            ),
            loadCSS(
                "digitol-markercluster-default-css",
                "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
            )
        ]);

        // Leaflet must load before MarkerCluster
        if (!window.L) {
            await loadScript(
                "digitol-leaflet-js",
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            );
        }

        if (!window.L.markerClusterGroup) {
            await loadScript(
                "digitol-markercluster-js",
                "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
            );
        }

        await initializeCountyMap();

    } catch (error) {
        console.error("MIR map initialization error:", error);
    }

})(); // closes MIR map loader
