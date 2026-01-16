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