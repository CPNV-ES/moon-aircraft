import { ref, computed } from 'vue'
import { fetchAircraftWithinRadius } from '../services/flightDataApi'
import { config } from '../config/constants'

/**
 * useFlightData - Flight data state management (Issue #11)
 */
export function useFlightData() {
  const flights = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  const flightCount = computed(() => flights.value.length)
  const hasError = computed(() => error.value !== null)

  /**
   * Fetch aircraft from default location
   */
  async function fetchFlights() {
    loading.value = true
    error.value = null

    try {
      const { lat, lng } = config.location
      const aircraft = await fetchAircraftWithinRadius(lat, lng)
      flights.value = aircraft
      lastUpdated.value = new Date()
      return flights.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch flight data'
      console.error('Fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  function clearFlights() {
    flights.value = []
    lastUpdated.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    flights,
    loading,
    error,
    lastUpdated,
    flightCount,
    hasError,
    fetchFlights,
    clearFlights,
    clearError
  }
}
