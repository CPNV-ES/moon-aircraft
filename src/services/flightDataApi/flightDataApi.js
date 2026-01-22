import { OPENSKY_API } from '../../config/constants';

const { 
    BASE_URL: OPENSKY_API_BASE_URL,
    TOKEN_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    EARTH_RADIUS_KM,
    DEFAULT_RADIUS_KM
} = OPENSKY_API;

// In-memory cache for the access token. This prevents us from
// requesting a new token for every single API call.
let accessToken = null;

/**
 * Fetches and returns an OAuth2 access token from the OpenSky Network.
 * It uses the in-memory cache to avoid unnecessary requests.
 * @returns {Promise<string>} The access token.
 * @throws {Error} If token fetching fails.
 */
async function getAccessToken() {
    // If we already have a token, return it from the cache.
    if (accessToken) {
        return accessToken;
    }

    console.log("Fetching new OpenSky access token...");

    try {
        const tokenPayload = new URLSearchParams({
            'grant_type': 'client_credentials',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        });

        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: tokenPayload
        });

        if (!response.ok) {
            // Read the response body for more details if the request failed
            const errorBody = await response.text();
            console.error("OpenSky token API error response:", errorBody);
            throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        accessToken = data.access_token; // Store the token in our cache
        console.log("Successfully fetched new access token.");
        return accessToken;

    } catch (error) {
        console.error("Failed to fetch OpenSky access token:", error);
        // Clear the failed token so we try again next time.
        accessToken = null;
        throw error;
    }
}

/**
 * Fetch aircraft state vectors using an authenticated request.
 * @param {number} latitude - Observer latitude
 * @param {number} longitude - Observer longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 100km)
 * @returns {Promise<Array>} Array of aircraft state vectors
 * @throws {Error} If API call fails
 */
export async function fetchAircraftWithinRadius(latitude, longitude, radiusKm = DEFAULT_RADIUS_KM) {
    try {
        // --- AUTHENTICATION STEP ---
        const token = await getAccessToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        if (latitude < -90 || latitude > 90) throw new Error('Invalid latitude');
        if (longitude < -180 || longitude > 180) throw new Error('Invalid longitude');

        const bbox = calculateBoundingBox(latitude, longitude, radiusKm);
        const params = new URLSearchParams({
            lamin: bbox.lamin.toFixed(4),
            lomin: bbox.lomin.toFixed(4),
            lamax: bbox.lamax.toFixed(4),
            lomax: bbox.lomax.toFixed(4)
        });

        const url = `${OPENSKY_API_BASE_URL}/states/all?${params}`;
        
        // --- API CALL WITH TOKEN ---
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.warn("Access token expired or invalid. Clearing cache.");
                accessToken = null;
            }
            throw new Error(`OpenSky API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.states || [];

    } catch (error) {
        console.error('Failed to fetch aircraft data:', error);
        throw error;
    }
}

/**
 * Fetch a specific aircraft's track using an authenticated request.
 * @param {string} icao24 - ICAO24 address of the aircraft
 * @param {number} time - Time in seconds since epoch (optional)
 * @returns {Promise<Object>} Aircraft track data
 * @throws {Error} If API call fails
 */
export async function fetchAircraftTrack(icao24, time = 0) {
    try {
        // --- AUTHENTICATION STEP ---
        const token = await getAccessToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        if (!icao24) throw new Error('ICAO24 address is required');

        const params = new URLSearchParams({ icao24 });
        if (time > 0) params.append('time', time);

        const url = `${OPENSKY_API_BASE_URL}/tracks/all?${params}`;
        
        // --- API CALL WITH TOKEN ---
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.warn("Access token expired or invalid. Clearing cache.");
                accessToken = null;
            }
            throw new Error(`OpenSky API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch aircraft track:', error);
        throw error;
    }
}


/**
 * Helper function to calculate bounding box. (No changes needed here)
 */
function calculateBoundingBox(latitude, longitude, radiusKm = DEFAULT_RADIUS_KM) {
  const latOffset = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI);
  const lonOffset = radiusKm / (EARTH_RADIUS_KM * Math.cos(latitude * Math.PI / 180)) * (180 / Math.PI);

  return {
    lamin: Math.max(-90, latitude - latOffset),
    lomin: Math.max(-180, longitude - lonOffset),
    lamax: Math.min(90, latitude + latOffset),
    lomax: Math.min(180, longitude + lonOffset)
  };
}