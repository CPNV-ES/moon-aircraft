// src/services/flightDataService.js

import * as openSkyProvider from './flightDataApi/providers/OpenSkyProvider';
import { useAircraftStore } from '../composables/useAircraftStore';

// In a more advanced setup, you could import multiple providers
// and choose one based on configuration.
const activeProvider = openSkyProvider;

const { updateAircraft, getAircraft } = useAircraftStore();

/**
 * Fetches aircraft data using the active provider and updates the central store.
 * @param {object} location - The location object with lat, lng.
 */
export async function fetchAndStoreAircraft(location) {
  try {
    const aircraftArray = await activeProvider.getAircraftData(location);
    updateAircraft(aircraftArray);
    return aircraftArray;
  } catch (error) {
    console.error("Flight Data Service Error:", error);
    throw error; // Re-throw to be caught by the UI layer
  }
}

/**
 * Fetches a specific aircraft's track and updates its entry in the store.
 * @param {string} icao24 
 */
export async function fetchAndStoreAircraftTrack(icao24) {
    try {
        const aircraft = getAircraft(icao24);
        if (!aircraft) return;

        const trackData = await activeProvider.getAircraftTrackData(icao24);
        aircraft.track = trackData;

        // The store is reactive, so we just need to update the object
        updateAircraft([aircraft]); // Re-add it to the store to trigger updates
    } catch (error) {
        console.error(`Failed to fetch track for ${icao24}:`, error);
    }
}