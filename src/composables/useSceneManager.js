import { ref, watch } from "vue";
import { fetchMoonTextureUrl } from "@/services/AstronomyService.js";

export function useSceneManager() {
    const showBuildings = ref(true);
    const showLandscape = ref(true);
    let buildingsTileset = null;
    let terrainProvider = null;

    const setupScene = async (viewer, Cesium, config) => {
        viewer.resolutionScale = 1.0; 
        viewer.scene.globe.enableLighting = true;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0003;

        const updateMoon = async (lat, lng) => {
            try {
                const customMoonUrl = await fetchMoonTextureUrl(lat, lng);
                viewer.scene.moon = new Cesium.Moon({
                    textureUrl: customMoonUrl || Cesium.buildModuleUrl("Assets/Textures/moonSmall.jpg"),
                    onlySunLighting: false
                });
            } catch (e) {
                console.error("Could not set up moon.", e);
            }
        };
        updateMoon(config.location.lat, config.location.lng);

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

    const enableHighResParams = async (viewer, Cesium) => {
        viewer.resolutionScale = 1.0;
        viewer.scene.globe.maximumScreenSpaceError = 2; 
        viewer.scene.globe.depthTestAgainstTerrain = true; 

        try {
            if (!terrainProvider) {
                terrainProvider = await Cesium.createWorldTerrainAsync();
                viewer.scene.terrainProvider = terrainProvider;
            }

            if (!buildingsTileset) {
                buildingsTileset = await Cesium.createOsmBuildingsAsync();
                buildingsTileset.style = new Cesium.Cesium3DTileStyle({ color: "color('white', 0.3)" });
                updateBuildingVisibility(); 
                viewer.scene.primitives.add(buildingsTileset);
            }

            function updateBuildingVisibility() {
                if (!buildingsTileset) return;
                buildingsTileset.show = showBuildings.value && showLandscape.value;
            }

            watch(showBuildings, updateBuildingVisibility);
            watch(showLandscape, (val) => {
                viewer.scene.globe.show = val;
                if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = val;
                updateBuildingVisibility();
            });

        } catch (e) {
            console.error(e);
        }
    };
    
    const aimAtMoon = (viewer, Cesium) => {
        const time = viewer.clock.currentTime;
        const icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
        if (Cesium.defined(icrfToFixed)) {
            const moonPosInertial = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(time);
            const moonPosFixed = Cesium.Matrix3.multiplyByVector(icrfToFixed, moonPosInertial, new Cesium.Cartesian3());
            
            const direction = Cesium.Cartesian3.normalize(
                Cesium.Cartesian3.subtract(moonPosFixed, viewer.camera.position, new Cesium.Cartesian3()),
                new Cesium.Cartesian3()
            );

            viewer.camera.flyTo({
                destination: viewer.camera.position,
                orientation: {
                    direction: direction,
                    up: viewer.camera.up
                }
            });
        }
    };

    return { setupScene, enableHighResParams, showBuildings, showLandscape, aimAtMoon };
}