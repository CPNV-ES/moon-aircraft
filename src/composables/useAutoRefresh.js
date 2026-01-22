import { ref, onUnmounted } from 'vue'

const DEFAULT_INTERVAL = 30000 // 30 seconds

/**
 * useAutoRefresh - Automatic data refresh timer (Issue #11)
 * @param {Function} callback - Function to call periodically
 * @param {Number} initialInterval - Interval in milliseconds (default: 30000)
 */
export function useAutoRefresh(callback, initialInterval = DEFAULT_INTERVAL) {
  const isRunning = ref(false)
  let intervalId = null

  function start() {
    if (isRunning.value) return

    isRunning.value = true

    if (callback && typeof callback === 'function') {
      try {
        callback()
      } catch (error) {
        console.error('Initial auto-refresh call failed:', error)
      }
    }

    intervalId = setInterval(() => {
      if (isRunning.value && callback && typeof callback === 'function') {
        try {
          callback()
        } catch (error) {
          console.error('Auto refresh error:', error)
        }
      }
    }, initialInterval)
  }

  function stop() {
    if (!isRunning.value) return

    isRunning.value = false

    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    isRunning,
    start,
    stop
  }
}