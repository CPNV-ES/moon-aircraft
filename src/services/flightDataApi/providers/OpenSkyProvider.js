// src/providers/OpenSkyProvider.js

import { fetchAircraftWithinRadius, fetchAircraftTrack } from '../flightDataApi';
import { Aircraft } from '../model/Aircraft';

/**
 * Fetches aircraft data from the OpenSky Network and maps it to the standardized Aircraft model.
 * @param {object} location - The location object with lat, lng.
 * @param {number} radiusKm - The search radius.
 * @returns {Promise<Aircraft[]>} A promise that resolves to an array of Aircraft objects.
 */
export async function getAircraftData({ lat, lng }, radiusKm = 100) {
  const rawAircraftStates = await fetchAircraftWithinRadius(lat, lng, radiusKm);
  
  if (!rawAircraftStates || rawAircraftStates.length === 0) {
    return [];
  }
  
  // Map the raw state vectors to our standardized Aircraft class
  const aircraftArray = rawAircraftStates.map(state => new Aircraft(state));
  
  return aircraftArray;
}

/**
 * Fetches an aircraft's track and maps it to a simple array of coordinates.
 * @param {string} icao24 - The ICAO24 identifier of the aircraft.
 * @returns {Promise<object[]>} A promise that resolves to an array of position objects.
 */
export async function getAircraftTrackData(icao24) {
    const rawTrackData = await fetchAircraftTrack(icao24);

    if (!rawTrackData || !rawTrackData.path) {
        return [];
    }

    // Transform the track data into a format we can use
    return rawTrackData.path.map(point => ({
        longitude: point[1],
        latitude: point[2],
        altitude: point[3]
    }));
}