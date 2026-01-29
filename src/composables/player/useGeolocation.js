import { ref, onUnmounted } from "vue";

const STORAGE_KEY = "moon_aircraft_coords";

export function useGeolocation() {
    let storedCoords = null;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) storedCoords = JSON.parse(stored);
    } catch (e) {
        console.error("Erreur lecture localStorage", e);
    }
    const coords = ref(storedCoords);
    const error = ref(null);

    let watchId = null;

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newCoords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };

                coords.value = newCoords;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newCoords));
                error.value = null;
            },
            (err) => {
                console.error(err);
                error.value = err.message;
            },
            { enableHighAccuracy: true }
        );
    } else {
        error.value = "La géolocalisation n'est pas supportée.";
    }

    onUnmounted(() => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    });

    return {
        coords,
        error
    };
}
