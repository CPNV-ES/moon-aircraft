import {config} from "@/config/constants.js";

export function useCesiumCam() {

    const setupScene = async ({viewer, Cesium}) => {

        Cesium.Ion.defaultAccessToken = config.cesiumToken;
        let location = config.location;

        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                location = {...location, lat: position.coords.latitude, lng: position.coords.longitude};
            } catch (e) {
                console.warn("Géolocalisation échouée, utilisation de la position par défaut.");
            }
        }

        viewer.scene.globe.enableLighting = true;

        try {
            viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();
            viewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync());
        } catch (e) {
            console.error(e);
        }

        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(location.lng, location.lat, location.height),
            orientation: {
                heading: Cesium.Math.toRadians(location.heading),
                pitch: Cesium.Math.toRadians(location.pitch),
                roll: 0.0
            }
        });

        viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

        const controller = viewer.scene.screenSpaceCameraController;
        controller.enableZoom = false;
        controller.enableTranslate = false;
        controller.enableTilt = false;
        controller.enableLook = true;

        controller.rotateEventTypes = undefined;
        controller.zoomEventTypes = undefined;
        controller.tiltEventTypes = undefined;
        controller.lookEventTypes = [
            Cesium.CameraEventType.LEFT_DRAG,
            Cesium.CameraEventType.PINCH
        ];


        viewer.scene.postRender.addEventListener(() => {
            const camera = viewer.camera;
            if (Math.abs(camera.roll) > 0.0) {
                camera.setView({ orientation: { heading: camera.heading, pitch: camera.pitch, roll: 0.0 } });
            }
            const pitchDeg = Cesium.Math.toDegrees(camera.pitch);
            if (pitchDeg < -30) camera.setView({ orientation: { heading: camera.heading, pitch: Cesium.Math.toRadians(-30), roll: 0.0 } });
            if (pitchDeg > 85) camera.setView({ orientation: { heading: camera.heading, pitch: Cesium.Math.toRadians(85), roll: 0.0 } });

            const position = camera.positionCartographic;
            const tHeight = viewer.scene.globe.getHeight(position);
            if (tHeight !== undefined && Math.abs(position.height - (tHeight + 2.0)) > 0.5) {
                const newPos = Cesium.Cartesian3.fromRadians(position.longitude, position.latitude, tHeight + 2.0);
                camera.setView({
                    destination: newPos,
                    orientation: { heading: camera.heading, pitch: camera.pitch, roll: 0.0 }
                });
            }
        });

    };

    return {
        setupScene
    };
}
