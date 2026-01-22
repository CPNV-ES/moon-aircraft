// src/composables/useFlightData.js

import { ref, computed } from 'vue'
import { fetchAndStoreAircraft } from '../services/flightDataService'
import { useAircraftStore } from './useAircraftStore'
import { config } from '../config/constants'

/**
 * useFlightData - Composable for managing flight data state and fetching.
 */
export function useFlightData() {
  const { getAllAircraft, clearAircraft, aircraftCount } = useAircraftStore();

  const loading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);

  const flights = computed(() => getAllAircraft());
  const hasError = computed(() => error.value !== null);

  /**
   * Fetch aircraft from the default location using the flight data service.
   */
  async function fetchFlights() {
    loading.value = true;
    error.value = null;

    try {
      const { lat, lng } = config.location;
      await fetchAndStoreAircraft({ lat, lng });
      lastUpdated.value = new Date();
    } catch (err) {
      error.value = err.message || 'Failed to fetch flight data';
      console.error('Fetch error:', err);
    } finally {
      loading.value = false;
    }
  }
  
  function clearError() {
    error.value = null;
  }

  return {
    // Reactive data from the store
    flights,
    aircraftCount,
    
    // State properties
    loading,
    error,
    lastUpdated,
    hasError,

    // Functions
    fetchFlights,
    clearAircraft,
    clearError
  };
}