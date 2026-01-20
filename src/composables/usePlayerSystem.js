import { useGeolocation } from "./player/useGeolocation.js";
import { useFieldOfView } from "./player/useFieldOfView.js";
import { useCameraPhysics } from "./player/useCameraPhysics.js";

export function usePlayerSystem() {

    const initPlayer = (viewer, Cesium, startLocation) => {
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(startLocation.lng, startLocation.lat, startLocation.height),
            orientation: {
                heading: Cesium.Math.toRadians(startLocation.heading),
                pitch: Cesium.Math.toRadians(startLocation.pitch),
                roll: 0.0
            }
        });

        const { coords } = useGeolocation();
        const { fov } = useFieldOfView(viewer, Cesium);
        const { direction, angle } = useCameraPhysics(viewer, Cesium, coords);

        return {
            fov,
            direction,
            angle
        };
    };

    return {
        initPlayer
    };
}
