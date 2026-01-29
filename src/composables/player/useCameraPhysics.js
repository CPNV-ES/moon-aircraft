import { ref, watch, onUnmounted } from "vue";

export function useCameraPhysics(viewer, Cesium, coords) {
    const direction = ref("---");
    const angle = ref(0);

    const controller = viewer.scene.screenSpaceCameraController;
    controller.enableZoom = false;
    controller.enableTranslate = false;
    controller.enableTilt = false;
    controller.enableLook = true;
    controller.lookEventTypes = [Cesium.CameraEventType.LEFT_DRAG, Cesium.CameraEventType.PINCH];
    controller.rotateEventTypes = undefined;
    controller.zoomEventTypes = undefined;
    
    viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

    const updatePhysics = () => {
        const camera = viewer.camera;

        let headingDeg = Cesium.Math.toDegrees(camera.heading);
        headingDeg = (headingDeg + 360) % 360;
        angle.value = Math.round(headingDeg);

        const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
        direction.value = dirs[Math.round(headingDeg / 45) % 8];

        if (Math.abs(camera.roll) > 0.0001) {
            camera.setView({ orientation: { heading: camera.heading, pitch: camera.pitch, roll: 0.0 } });
        }

        const pitchDeg = Cesium.Math.toDegrees(camera.pitch);
        if (pitchDeg < -30) camera.setView({ orientation: { heading: camera.heading, pitch: Cesium.Math.toRadians(-30), roll: 0.0 } });
        if (pitchDeg > 85) camera.setView({ orientation: { heading: camera.heading, pitch: Cesium.Math.toRadians(85), roll: 0.0 } });

        const pos = camera.positionCartographic;
        if (pos.height < 50000) {
            const tHeight = viewer.scene.globe.getHeight(pos);
            if (tHeight !== undefined && Math.abs(pos.height - (tHeight + 2.2)) > 0.5) {
                const newPos = Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, tHeight + 2.2);
                camera.setView({
                    destination: newPos,
                    orientation: { heading: camera.heading, pitch: camera.pitch, roll: 0.0 }
                });
            }
        }
    };

    viewer.scene.postRender.addEventListener(updatePhysics);

    const cleanup = () => {
        viewer.scene.postRender.removeEventListener(updatePhysics);
        controller.enableZoom = true;
        controller.enableTranslate = false;
        controller.enableTilt = false;
        controller.enableLook = false;
        controller.lookEventTypes = undefined;
        controller.rotateEventTypes = undefined;
        controller.zoomEventTypes = undefined;
    };

    onUnmounted(cleanup);

    return {
        direction,
        angle,
        cleanup
    };
}