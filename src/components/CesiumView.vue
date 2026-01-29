<script setup>
import { ref, watch } from "vue";
import { VcViewer } from "vue-cesium";
import { config } from "@/config/constants.js";
import { useSceneManager } from "@/composables/useSceneManager.js";
import { usePlayerSystem } from "@/composables/usePlayerSystem.js";
import AppHud from "@/components/AppHud.vue";
import { useFlightData } from "@/composables/useFlightData.js";
import { useAutoRefresh } from "@/composables/useAutoRefresh.js";

const { setupScene, showBuildings, showLandscape } = useSceneManager();
const { initPlayer, coords, error: geoError } = usePlayerSystem();

const { aircraftCount, fetchFlights, error: flightError } = useFlightData();
const { start: startAutoRefresh } = useAutoRefresh(fetchFlights, 30000);

watch(flightError, (newError) => {
    if(newError) {
        console.error(`%cFAILURE: A fetch error was detected: ${newError}`, 'color: red; font-weight: bold;');
    }
});

const direction = ref("---");
const angle = ref(0);
const fov = ref(60);

const onViewerReady = async (cesiumInstance) => {
  const { viewer, Cesium } = cesiumInstance;
  Cesium.Ion.defaultAccessToken = config.cesiumToken;

  try {
    const imageryProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    );
    viewer.imageryLayers.addImageryProvider(imageryProvider);
  } catch (e) {
    console.error("Failed to load base imagery layer:", e);
  }

  let startLocation = config.location;
  let isRestored = false;

  if (coords.value) {
    startLocation = {
      lat: coords.value.lat,
      lng: coords.value.lng,
      height: config.location.height,
      heading: config.location.heading,
      pitch: config.location.pitch
    };
    isRestored = true;
  }

  setupScene(viewer, Cesium, config, coords);

  const playerState = initPlayer(viewer, Cesium, startLocation);

  if (!isRestored) {
    const unwatch = watch(coords, (val) => {
      if (val) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(val.lng, val.lat, config.location.height),
          orientation: {
            heading: Cesium.Math.toRadians(config.location.heading),
            pitch: Cesium.Math.toRadians(config.location.pitch),
            roll: 0.0
          }
        });
        unwatch();
      }
    });
  }

  watch(playerState.direction, (val) => direction.value = val, { immediate: true });
  watch(playerState.angle, (val) => angle.value = val, { immediate: true });
  watch(playerState.fov, (val) => fov.value = val, { immediate: true });
};
</script>

<template>
  <div class="viewer-container">
    <vc-viewer
      :animation="false"
      :base-layer-picker="false"
      :timeline="false"
      :selection-indicator="false"
      :info-box="false"
      @ready="onViewerReady"
    >
    </vc-viewer>

    <AppHud
        :direction="direction"
        :angle="angle"
        :fov="fov"
        :show-buildings="showBuildings"
        @toggle-buildings="showBuildings = !showBuildings"
        :show-landscape="showLandscape"
        @toggle-landscape="showLandscape = !showLandscape"
    />
  </div>
</template>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
</style>
