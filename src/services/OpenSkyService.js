import { OPENSKY_API } from '../config/constants';
import { Aircraft } from '../models/Aircraft';

const { BASE_URL, TOKEN_URL, CLIENT_ID, CLIENT_SECRET, EARTH_RADIUS_KM } = OPENSKY_API;

let accessToken = null;

// --- Helper: Authentication ---
async function getToken() {
    if (accessToken) return accessToken;
    
    try {
        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET
            })
        });

        if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    } catch (e) {
        console.error("Token fetch failed", e);
        throw e;
    }
}

// --- Helper: Bounding Box ---
function getBoundingBox(lat, lng, radiusKm) {
    const latOffset = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI);
    const lonOffset = radiusKm / (EARTH_RADIUS_KM * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI);
    return {
        lamin: lat - latOffset, lomin: lng - lonOffset,
        lamax: lat + latOffset, lomax: lng + lonOffset
    };
}

// --- Main Function: Get Flights ---
export async function fetchFlights(lat, lng, radiusKm = 100) {
    const token = await getToken();
    const bbox = getBoundingBox(lat, lng, radiusKm);
    
    const params = new URLSearchParams({
        lamin: bbox.lamin.toFixed(4), lomin: bbox.lomin.toFixed(4),
        lamax: bbox.lamax.toFixed(4), lomax: bbox.lomax.toFixed(4)
    });

    const response = await fetch(`${BASE_URL}/states/all?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
        accessToken = null; // Reset token if expired
        throw new Error("Token expired");
    }

    const data = await response.json();
    if (!data.states) return [];

    // Map directly to Aircraft model here
    return data.states.map(state => new Aircraft({
        icao24: state[0],
        callsign: state[1]?.trim(),
        originCountry: state[2],
        longitude: state[5],
        latitude: state[6],
        altitude: state[7] ?? state[13],
        onGround: state[8],
        velocity: state[9],
        heading: state[10]
    }));
}