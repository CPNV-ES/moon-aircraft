import { ref, computed } from 'vue';
import { fetchFlights as apiFetchFlights } from '../services/OpenSkyService';
import { useAircraftStore } from './useAircraftStore';
import { config } from '../config/constants';

export function useFlightData() {
  const { getAllAircraft, updateAircraft, aircraftCount } = useAircraftStore();
  
  const loading = ref(false);
  const error = ref(null);
  const flights = computed(() => getAllAircraft());

  async function fetchFlights() {
    loading.value = true;
    error.value = null;

    try {
      const { lat, lng } = config.location;
      // Call the service directly
      const aircraftList = await apiFetchFlights(lat, lng);
      // Update the store
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