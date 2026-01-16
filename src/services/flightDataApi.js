/**
 * OpenSky Network API Service
 * Fetches real-time aircraft state vectors from OpenSky Network API
 */

const OPENSKY_API_BASE_URL = 'https://opensky-network.org/api'
const EARTH_RADIUS_KM = 6371
const RADIUS_KM = 100

/**
 * Calculate bounding box coordinates from observer location and radius
 * @param {number} latitude - Observer latitude
 * @param {number} longitude - Observer longitude
 * @param {number} radiusKm - Radius in kilometers (default: 100km)
 * @returns {Object} Bounding box with lamin, lomin, lamax, lomax
 */
function calculateBoundingBox(latitude, longitude, radiusKm = RADIUS_KM) {
  // Convert radius from km to degrees (approximate)
  const latOffset = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI)
  const lonOffset = radiusKm / (EARTH_RADIUS_KM * Math.cos(latitude * Math.PI / 180)) * (180 / Math.PI)

  return {
    lamin: Math.max(-90, latitude - latOffset),
    lomin: Math.max(-180, longitude - lonOffset),
    lamax: Math.min(90, latitude + latOffset),
    lomax: Math.min(180, longitude + lonOffset)
  }
}

/**
 * Fetch aircraft state vectors within a 100km radius of observer location
 * @param {number} latitude - Observer latitude
 * @param {number} longitude - Observer longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 100km)
 * @returns {Promise<Array>} Array of aircraft state vectors
 * @throws {Error} If API call fails
 */
export async function fetchAircraftWithinRadius(latitude, longitude, radiusKm = RADIUS_KM) {
  try {
    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90')
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180')
    }

    // Calculate bounding box
    const bbox = calculateBoundingBox(latitude, longitude, radiusKm)

    // Build API URL with parameters
    const params = new URLSearchParams({
      lamin: bbox.lamin.toFixed(4),
      lomin: bbox.lomin.toFixed(4),
      lamax: bbox.lamax.toFixed(4),
      lomax: bbox.lomax.toFixed(4)
    })

    const url = `${OPENSKY_API_BASE_URL}/states/all?${params}`
    
    // Fetch from OpenSky API
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`OpenSky API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.states) {
      return []
    }

    // Filter and transform aircraft data
    const aircraft = data.states.map(state => ({
      icao24: state[0],
      callsign: state[1]?.trim() || '',
      origin_country: state[2],
      time_position: state[3],
      last_contact: state[4],
      longitude: state[5],
      latitude: state[6],
      baro_altitude: state[7],
      on_ground: state[8],
      velocity: state[9],
      true_track: state[10],
      vertical_rate: state[11],
      sensors: state[12],
      geo_altitude: state[13],
      squawk: state[14],
      spi: state[15],
      position_source: state[16],
      category: state[17]
    }))

    return aircraft
  } catch (error) {
    console.error('Failed to fetch aircraft data:', error)
    throw error
  }
}

/**
 * Fetch all aircraft state vectors globally
 * @returns {Promise<Array>} Array of all aircraft state vectors
 * @throws {Error} If API call fails
 */
export async function fetchAllAircraft() {
  try {
    const response = await fetch(`${OPENSKY_API_BASE_URL}/states/all`)
    
    if (!response.ok) {
      throw new Error(`OpenSky API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.states) {
      return []
    }

    const aircraft = data.states.map(state => ({
      icao24: state[0],
      callsign: state[1]?.trim() || '',
      origin_country: state[2],
      time_position: state[3],
      last_contact: state[4],
      longitude: state[5],
      latitude: state[6],
      baro_altitude: state[7],
      on_ground: state[8],
      velocity: state[9],
      true_track: state[10],
      vertical_rate: state[11],
      sensors: state[12],
      geo_altitude: state[13],
      squawk: state[14],
      spi: state[15],
      position_source: state[16],
      category: state[17]
    }))

    return aircraft
  } catch (error) {
    console.error('Failed to fetch all aircraft:', error)
    throw error
  }
}

/**
 * Fetch specific aircraft track by ICAO24 address
 * @param {string} icao24 - ICAO24 address of the aircraft
 * @param {number} time - Time in seconds since epoch (optional)
 * @returns {Promise<Object>} Aircraft track data
 * @throws {Error} If API call fails
 */
export async function fetchAircraftTrack(icao24, time = 0) {
  try {
    if (!icao24) {
      throw new Error('ICAO24 address is required')
    }

    const params = new URLSearchParams({ icao24 })
    if (time > 0) {
      params.append('time', time)
    }

    const url = `${OPENSKY_API_BASE_URL}/tracks/all?${params}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`OpenSky API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch aircraft track:', error)
    throw error
  }
}
