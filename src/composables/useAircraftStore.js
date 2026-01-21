import { ref, computed, readonly } from 'vue'

const aircraftMap = ref(new Map())

export function useAircraftStore() {
  /**
   * Add or update aircraft in the store
   * @param {Array} aircraftArray - Array of aircraft objects
   */
  function updateAircraft(aircraftArray) {
    if (!Array.isArray(aircraftArray)) return

    aircraftArray.forEach(aircraft => {
      if (aircraft.icao24) {
        aircraftMap.value.set(aircraft.icao24, aircraft)
      }
    })
  }

  /**
   * Get aircraft by ICAO24 identifier
   * @param {string} icao24 - Aircraft ICAO24 identifier
   * @returns {Object|undefined} Aircraft data or undefined
   */
  function getAircraft(icao24) {
    return aircraftMap.value.get(icao24)
  }

  /**
   * Get all aircraft as array
   * @returns {Array} Array of all aircraft objects
   */
  function getAllAircraft() {
    return Array.from(aircraftMap.value.values())
  }

  /**
   * Remove aircraft by ICAO24 identifier
   * @param {string} icao24 - Aircraft ICAO24 identifier
   */
  function removeAircraft(icao24) {
    aircraftMap.value.delete(icao24)
  }

  /**
   * Clear all aircraft from store
   */
  function clearAircraft() {
    aircraftMap.value.clear()
  }

  /**
   * Get count of aircraft in store
   */
  const aircraftCount = computed(() => aircraftMap.value.size)

  return {
    updateAircraft,
    getAircraft,
    getAllAircraft,
    removeAircraft,
    clearAircraft,
    aircraftCount: readonly(aircraftCount)
  }
}
