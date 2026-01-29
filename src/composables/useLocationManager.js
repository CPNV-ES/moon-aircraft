import { ref } from "vue";

const STORAGE_KEY = "flight_sim_last_loc";

export function useLocationManager() {
    const currentLocation = ref(null);
    const hasStoredLocation = ref(false);

    // Check storage on initialization
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.lat && parsed.lng) {
                hasStoredLocation.value = true;
            }
        } catch (e) {
            console.warn("Invalid stored location, clearing.");
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    /**
     * Request GPS permission and position
     */
    const requestGps = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        heading: 0,
                        pitch: -10,
                        height: 2000
                    };
                    saveLocation(loc);
                    resolve(loc);
                },
                (err) => {
                    let msg = "Unknown error";
                    switch(err.code) {
                        case err.PERMISSION_DENIED: msg = "User denied Geolocation."; break;
                        case err.POSITION_UNAVAILABLE: msg = "Location unavailable."; break;
                        case err.TIMEOUT: msg = "Location request timed out."; break;
                    }
                    reject(new Error(msg));
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    /**
     * Load from LocalStorage
     */
    const loadFromStorage = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const loc = {
                lat: parsed.lat,
                lng: parsed.lng,
                heading: 0,
                pitch: -10,
                height: 2000
            };
            currentLocation.value = loc;
            return loc;
        }
        return null;
    };

    const saveLocation = (loc) => {
        currentLocation.value = loc;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat: loc.lat, lng: loc.lng }));
        hasStoredLocation.value = true;
    };

    const clearLocation = () => {
        currentLocation.value = null;
    };

    return {
        currentLocation,
        hasStoredLocation,
        requestGps,
        loadFromStorage,
        clearLocation
    };
}