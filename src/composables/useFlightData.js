import { ref, computed } from 'vue';
import { fetchFlights as apiFetchFlights } from '../services/OpenSkyService';
import { useAircraftStore } from './useAircraftStore';

export function useFlightData() {
  const { getAllAircraft, updateAircraft, aircraftCount } = useAircraftStore();
  
  const loading = ref(false);
  const error = ref(null);
  const flights = computed(() => getAllAircraft());

  /**
   * Fetch flights for a specific location
   * @param {number} lat 
   * @param {number} lng 
   */
  async function fetchFlights(lat, lng) {
    if (!lat || !lng) return;

    loading.value = true;
    error.value = null;

    try {
      const aircraftList = await apiFetchFlights(lat, lng);
      updateAircraft(aircraftList);
    } catch (err) {
      error.value = err.message || 'Fetch failed';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  return { 
    flights, 
    aircraftCount, 
    loading, 
    error, 
    fetchFlights 
  };
}