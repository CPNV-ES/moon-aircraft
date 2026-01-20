import { ref, watch } from "vue";

export function useSceneManager() {
    const showBuildings = ref(true);

    const setupScene = async (viewer, Cesium, config) => {
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

            watch(showBuildings, (val) => {
                buildings.show = val;
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
    };

    return {
        setupScene,
        showBuildings
    };
}
