import { ref } from "vue";

export function useFieldOfView(viewer, Cesium) {
    const fov = ref(60);

    const canvas = viewer.scene.canvas;

    const onWheel = (e) => {
        e.preventDefault();
        const camera = viewer.camera;
        const frustum = camera.frustum;

        let currentFov = frustum.fov;
        currentFov += (e.deltaY > 0 ? 0.05 : -0.05);
        currentFov = Cesium.Math.clamp(currentFov, Cesium.Math.toRadians(5), Cesium.Math.toRadians(120));

        frustum.fov = currentFov;
        fov.value = Math.round(Cesium.Math.toDegrees(currentFov));
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });

    return {
        fov
    };
}
