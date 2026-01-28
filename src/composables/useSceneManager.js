import { ref, watch } from "vue";
import {fetchMoonTextureUrl} from "@/services/AstronomyService.js";

export function useSceneManager() {
    const showBuildings = ref(true);
    const showLandscape = ref(true);

    const setupScene = async (viewer, Cesium, config, coords) => {
        viewer.resolutionScale = 0.9;
        viewer.shadows = true;
        viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;
        viewer.shadowMap.size = 2048;
        viewer.shadowMap.softShadows = true;

        viewer.scene.globe.enableLighting = true;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0003;
        viewer.scene.fog.screenSpaceErrorFactor = 2.0;
        viewer.scene.globe.maximumScreenSpaceError = 2;

        watch(showLandscape, (val) => {
            viewer.scene.globe.show = val;
            if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = val;
        });

        let buildingsTileset = null;
        watch(showBuildings, (val) => {
            if (buildingsTileset) buildingsTileset.show = val;
        });

        viewer.scene.moon = new Cesium.Moon({
            show: true,
            onlySunLighting: true
        });

        const updateMoon = async (lat, lng) => {
            try {
                console.log("Fetching custom moon texture from Astronomy API...");
                const customMoonUrl = await fetchMoonTextureUrl(lat, lng);
                viewer.scene.moon = new Cesium.Moon({
                    textureUrl: customMoonUrl || Cesium.buildModuleUrl("Assets/Textures/moonSmall.jpg"),
                    onlySunLighting: false
                });
            } catch (e) {
                console.error("Could not set up custom moon, using default.", e);
            }
        };

        updateMoon(config.location.lat, config.location.lng);

        if (coords) {
            watch(coords, (val) => {
                if (val) {
                    updateMoon(val.lat, val.lng);
                }
            });
        }

        try {
            viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();

            buildingsTileset = await Cesium.createOsmBuildingsAsync();
            buildingsTileset.style = new Cesium.Cesium3DTileStyle({ color: "color('white', 0.3)" });

            buildingsTileset.maximumScreenSpaceError = 32;
            buildingsTileset.dynamicScreenSpaceError = true;
            buildingsTileset.dynamicScreenSpaceErrorDensity = 0.00278;
            buildingsTileset.dynamicScreenSpaceErrorFactor = 4.0;
            buildingsTileset.dynamicScreenSpaceErrorHeightFalloff = 0.25;

            buildingsTileset.show = showBuildings.value;

            viewer.scene.primitives.add(buildingsTileset);
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
                pixelOffset: new Cesium.CallbackProperty((time) => {
                    const camera = viewer.scene.camera;
                    const height = viewer.canvas.clientHeight;
                    const fovy = camera.frustum.fovy;

                    const icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
                    if (!Cesium.defined(icrfToFixed)) return new Cesium.Cartesian2(0, -20);

                    const moonPositionInertial = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(time);
                    const moonPositionFixed = Cesium.Matrix3.multiplyByVector(icrfToFixed, moonPositionInertial, new Cesium.Cartesian3());

                    const distance = Cesium.Cartesian3.distance(camera.positionWC, moonPositionFixed);
                    const focalLength = height / (2 * Math.tan(fovy * 0.5));
                    const radiusPx = (1737400 / distance) * focalLength;

                    return new Cesium.Cartesian2(0, -(radiusPx + 20));
                }, false),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    };

    return {
        setupScene,
        showBuildings,
        showLandscape
    };
}
