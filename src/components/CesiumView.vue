<script setup>
import { ref, watch } from "vue";
import { VcViewer } from "vue-cesium";
import { config } from "@/config/constants.js";
import { useSceneManager } from "@/composables/useSceneManager.js";
import { usePlayerSystem } from "@/composables/usePlayerSystem.js";
import AppHud from "@/components/AppHud.vue";
import { useFlightData } from "@/composables/useFlightData.js";

const { setupScene, showBuildings } = useSceneManager();
const { initPlayer } = usePlayerSystem();
const { aircraftCount, fetchFlights, error, loading } = useFlightData();

watch(error, (newError) => {
    if(newError) {
        console.error(`%cFAILURE: A fetch error was detected: ${newError}`, 'color: red; font-weight: bold;');
    }
});

const direction = ref("---");
const angle = ref(0);
const fov = ref(60);

const onViewerReady = (cesiumInstance) => {
  const { viewer, Cesium } = cesiumInstance;
  Cesium.Ion.defaultAccessToken = config.cesiumToken;

  setupScene(viewer, Cesium);

  const playerState = initPlayer(viewer, Cesium, config.location);

  direction.value = playerState.direction;
  angle.value = playerState.angle;
  fov.value = playerState.fov;
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
      :direction="direction.value"
      :angle="angle.value"
      :fov="fov.value"
      :show-buildings="showBuildings"
      :aircraft-count="aircraftCount"
      :loading="loading"
      @toggle-buildings="showBuildings = !showBuildings"
      @fetch-flights="fetchFlights"
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