import { ref, watch } from "vue";
import { config } from "@/config/constants.js";

export function useCesiumCam() {

    const direction = ref("---");
    const angle = ref(0);
    const showBuildings = ref(true);

    const fov = ref(60);

    const setupScene = async ({ viewer, Cesium }) => {

        Cesium.Ion.defaultAccessToken = config.cesiumToken;

        viewer.resolutionScale = 0.9;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0003;
        viewer.scene.fog.screenSpaceErrorFactor = 2.0;
        viewer.scene.globe.maximumScreenSpaceError = 2;

        try {
            viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();

            const buildings = await Cesium.createOsmBuildingsAsync();
            buildings.style = new Cesium.Cesium3DTileStyle({ color: "color('white', 0.3)" });

            buildings.maximumScreenSpaceError = 32;
            buildings.dynamicScreenSpaceError = true;
            buildings.dynamicScreenSpaceErrorDensity = 0.00278;
            buildings.dynamicScreenSpaceErrorFactor = 4.0;
            buildings.dynamicScreenSpaceErrorHeightFalloff = 0.25;

            viewer.scene.primitives.add(buildings);

            watch(showBuildings, (isVisible) => {
                buildings.show = isVisible;
            });

        } catch (e) {
            console.error(e);
        }

        viewer.scene.cullRequestsWhileMoving = true;
        viewer.scene.cullRequestsWhileMovingMultiplier = 60.0;

        viewer.entities.add({
            position: new Cesium.CallbackProperty((time) => {
                const icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
                if (Cesium.defined(icrfToFixed)) {
                    const moonPosition = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(time);
                    return Cesium.Matrix3.multiplyByVector(icrfToFixed, moonPosition, new Cesium.Cartesian3());
                }
                return undefined;
            }, false),
            label: {
                text: "Lune",
                font: "14pt monospace",
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -20),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });

        const defaultLoc = config.location;

        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(defaultLoc.lng, defaultLoc.lat, defaultLoc.height),
            orientation: {
                heading: Cesium.Math.toRadians(defaultLoc.heading),
                pitch: Cesium.Math.toRadians(defaultLoc.pitch),
                roll: 0.0
            }
        });

        viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

        const canvas = viewer.scene.canvas;
        canvas.addEventListener("wheel", (e) => {
            e.preventDefault();

            const camera = viewer.camera;
            const frustum = camera.frustum;

            const zoomAmount = 0.05;

            let currentFov = frustum.fov;

            if (e.deltaY > 0) {
                currentFov += zoomAmount;
            } else {
                currentFov -= zoomAmount;
            }

            const minFov = Cesium.Math.toRadians(5);
            const maxFov = Cesium.Math.toRadians(120);

            currentFov = Cesium.Math.clamp(currentFov, minFov, maxFov);

            frustum.fov = currentFov;

            fov.value = Math.round(Cesium.Math.toDegrees(currentFov));

        }, { passive: false });


        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((pos) => {
                const { latitude, longitude } = pos.coords;

                const camera = viewer.camera;
                const carto = Cesium.Cartographic.fromDegrees(longitude, latitude);

                let terrainHeight = viewer.scene.globe.getHeight(carto);
                if (terrainHeight === undefined) terrainHeight = camera.positionCartographic.height;

                viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, terrainHeight + 2.0),
                    orientation: { heading: camera.heading, pitch: camera.pitch, roll: 0.0 }
                });

            }, (err) => console.warn(err), { enableHighAccuracy: true });
        }

        const controller = viewer.scene.screenSpaceCameraController;
        controller.enableZoom = false;
        controller.enableTranslate = false;
        controller.enableTilt = false;
        controller.enableLook = true;
        controller.lookEventTypes = [Cesium.CameraEventType.LEFT_DRAG, Cesium.CameraEventType.PINCH];
        controller.rotateEventTypes = undefined;
        controller.zoomEventTypes = undefined;

        viewer.scene.postRender.addEventListener(() => {
            const camera = viewer.camera;

            let headingDeg = Cesium.Math.toDegrees(camera.heading);
            headingDeg = (headingDeg + 360) % 360;
            angle.value = Math.round(headingDeg);
            const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
            const index = Math.round(headingDeg / 45) % 8;
            direction.value = directions[index];

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
        setupScene,
        direction,
        angle,
        showBuildings,
        fov
    };
}
