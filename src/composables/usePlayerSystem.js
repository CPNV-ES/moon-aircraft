import { ref, onUnmounted, watch } from "vue";
import { useFieldOfView } from "./player/useFieldOfView.js";
import { useCameraPhysics } from "./player/useCameraPhysics.js";

export function usePlayerSystem() {
    const coords = ref(null);
    const direction = ref("N");
    const angle = ref(0);
    const fov = ref(60);
    
    let watchId = null;
    let physicsCleanup = null;

    const initPlayer = (viewer, Cesium, startLocation) => {
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(startLocation.lng, startLocation.lat, startLocation.height),
            orientation: { heading: Cesium.Math.toRadians(0), pitch: Cesium.Math.toRadians(-10), roll: 0.0 }
        });

        const fovSystem = useFieldOfView(viewer, Cesium);
        const physicsSystem = useCameraPhysics(viewer, Cesium, coords);
        
        physicsCleanup = physicsSystem.cleanup;

        watch(fovSystem.fov, (val) => fov.value = val, { immediate: true });
        watch(physicsSystem.direction, (val) => direction.value = val, { immediate: true });
        watch(physicsSystem.angle, (val) => angle.value = val, { immediate: true });

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => { coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
                (err) => console.warn(err),
                { enableHighAccuracy: true }
            );
        }

        return { fov, direction, angle };
    };

    const stopPlayer = () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (physicsCleanup) physicsCleanup();
        watchId = null;
        physicsCleanup = null;
        coords.value = null;
    };

    onUnmounted(stopPlayer);

    return { initPlayer, stopPlayer, coords, direction, angle, fov };
}