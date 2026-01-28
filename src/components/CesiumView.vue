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
const { initPlayer, coords } = usePlayerSystem();

const { aircraftCount, fetchFlights, error } = useFlightData();
const { start: startAutoRefresh } = useAutoRefresh(fetchFlights, 30000);

watch(error, (newError) => {
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

  setupScene(viewer, Cesium, config, coords);
  const playerState = initPlayer(viewer, Cesium, config.location);

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
  }, { immediate: true });

  watch(() => playerState.direction.value, (val) => direction.value = val);
  watch(() => playerState.angle.value, (val) => angle.value = val);
  watch(() => playerState.fov.value, (val) => fov.value = val);
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
