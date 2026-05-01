// ─────────────────────────────────────────────────────────────────────────────
// GEOFENCING MODULE
// Paste this entire block inside the <script> tag in tourist/index.html
// just before the closing </script> tag
// ─────────────────────────────────────────────────────────────────────────────

// ── Danger zones (must match backend DANGER_ZONES) ───────────────────────────
const GEOFENCE_ZONES = [
    {
        id: 'dz_001',
        name: 'Restricted Forest Zone — Corbett Buffer',
        type: 'restricted',
        color: '#ef4444',
        polygon: [
            [29.5300, 78.7400],
            [29.5300, 78.8200],
            [29.4700, 78.8200],
            [29.4700, 78.7400]
        ]
    },
    {
        id: 'dz_002',
        name: 'High Crime Zone — Example Area',
        type: 'high_risk',
        color: '#f97316',
        polygon: [
            [28.6500, 77.2200],
            [28.6500, 77.2400],
            [28.6350, 77.2400],
            [28.6350, 77.2200]
        ]
    },
    {
        id: 'dz_003',
        name: 'Flood Prone Zone — Brahmaputra Bank',
        type: 'natural_hazard',
        color: '#3b82f6',
        polygon: [
            [26.1800, 91.7300],
            [26.1800, 91.7700],
            [26.1500, 91.7700],
            [26.1500, 91.7300]
        ]
    }
];

// ── State ─────────────────────────────────────────────────────────────────────
let geofenceWatchId = null;
let activeBreaches = new Set();       // zone IDs already alerted
let geofenceLayers = [];              // Leaflet polygon layers

// ── Point-in-polygon (ray casting) ───────────────────────────────────────────
function pointInPolygon(lat, lng, polygon) {
    let inside = false;
    const n = polygon.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const [yi, xi] = polygon[i];
        const [yj, xj] = polygon[j];
        const intersect = ((yi > lat) !== (yj > lat)) &&
            (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// ── Draw zones on map ─────────────────────────────────────────────────────────
function drawGeofenceZones(leafletMap) {
    geofenceLayers.forEach(l => leafletMap.removeLayer(l));
    geofenceLayers = [];

    GEOFENCE_ZONES.forEach(zone => {
        const layer = L.polygon(zone.polygon, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '6 4'
        }).addTo(leafletMap);

        layer.bindPopup(`
            <div style="padding:8px">
                <b style="color:${zone.color}">${zone.name}</b><br>
                <span style="font-size:12px;color:#666">Type: ${zone.type.replace('_', ' ')}</span>
            </div>
        `);

        geofenceLayers.push(layer);
    });
}

// ── Check position against all zones ─────────────────────────────────────────
function checkGeofences(lat, lng) {
    GEOFENCE_ZONES.forEach(zone => {
        const inside = pointInPolygon(lat, lng, zone.polygon);

        if (inside && !activeBreaches.has(zone.id)) {
            activeBreaches.add(zone.id);
            handleGeofenceBreach(zone, lat, lng);
        } else if (!inside && activeBreaches.has(zone.id)) {
            activeBreaches.delete(zone.id);
            console.log(`Left zone: ${zone.name}`);
        }
    });
}

// ── Handle a breach ───────────────────────────────────────────────────────────
async function handleGeofenceBreach(zone, lat, lng) {
    // 1. Show alert in tourist app
    showGeofenceAlert(zone);

    // 2. Notify backend (which alerts police + logs blockchain)
    try {
        await apiRequest('/api/geofence/breach', 'POST', {
            zoneName: zone.name,
            zoneType: zone.type,
            latitude: lat,
            longitude: lng,
            timestamp: new Date().toISOString()
        });
        console.log(`Geofence breach reported to backend: ${zone.name}`);
    } catch (err) {
        console.error('Failed to report geofence breach:', err);
    }
}

// ── Alert UI ──────────────────────────────────────────────────────────────────
function showGeofenceAlert(zone) {
    const typeLabels = {
        restricted: '🚫 Restricted Zone',
        high_risk: '⚠️ High Risk Area',
        natural_hazard: '🌊 Natural Hazard Zone'
    };

    const alertEl = document.createElement('div');
    alertEl.id = 'geofence-alert-' + zone.id;
    alertEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        background: ${zone.color};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        max-width: 340px;
        width: 90%;
        font-family: Inter, sans-serif;
        animation: slideDown 0.3s ease;
    `;

    alertEl.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="font-size:28px">🚨</div>
            <div>
                <div style="font-weight:700;font-size:15px;margin-bottom:4px">
                    ${typeLabels[zone.type] || 'Danger Zone Detected'}
                </div>
                <div style="font-size:13px;opacity:0.9">${zone.name}</div>
                <div style="font-size:12px;opacity:0.75;margin-top:4px">
                    Police and emergency contacts have been notified.
                </div>
            </div>
        </div>
        <button onclick="document.getElementById('geofence-alert-${zone.id}').remove()"
            style="position:absolute;top:8px;right:12px;background:none;border:none;color:white;font-size:18px;cursor:pointer">×</button>
    `;

    document.body.appendChild(alertEl);

    // Auto-dismiss after 8 seconds
    setTimeout(() => alertEl.remove(), 8000);
}

// ── Start watching position ───────────────────────────────────────────────────
function startGeofencing() {
    if (!navigator.geolocation) {
        console.warn('Geolocation not supported — geofencing disabled');
        return;
    }
    if (geofenceWatchId !== null) return; // already watching

    geofenceWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            checkGeofences(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
            console.warn('Geofence watch error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    console.log('Geofencing active — watching position');
}

function stopGeofencing() {
    if (geofenceWatchId !== null) {
        navigator.geolocation.clearWatch(geofenceWatchId);
        geofenceWatchId = null;
        activeBreaches.clear();
        console.log('Geofencing stopped');
    }
}

// ── CSS animation ─────────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(style);
