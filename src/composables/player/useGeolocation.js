import { ref, onUnmounted } from "vue";

export function useGeolocation() {
    const coords = ref(null);

    let watchId = null;

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                coords.value = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
            },
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );
    }

    onUnmounted(() => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    });

    return {
        coords
    };
}
