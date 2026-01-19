<script setup>
import {VcImageryProviderArcgis, VcLayerImagery, VcViewer} from "vue-cesium";
import {useCesiumCam} from "@/composables/useCesiumCam.js";

const {setupScene, direction, angle, showBuildings, fov} = useCesiumCam();

const onViewerReady = (cesiumInstance) => {
  setupScene(cesiumInstance);
};
</script>

<template>
  <div class="viewer-container">
    <vc-viewer
        :animation="false"
        :base-layer-picker="false"
        :timeline="false"
        @ready="onViewerReady"
    >
      <vc-layer-imagery>
        <vc-imagery-provider-arcgis/>
      </vc-layer-imagery>
    </vc-viewer>
    
    <div class="hud-compass">
      <div class="direction-letter">{{ direction }}</div>
      <div class="direction-angle">{{ angle }}°</div>
      <div class="fov-info">FOV: {{ fov }}°</div>
    </div>

    <button class="hud-btn" @click="showBuildings = !showBuildings">
      {{ showBuildings ? 'Cacher Bâtiments' : 'Afficher Bâtiments' }}
    </button>

  </div>
</template>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.hud-compass {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;

</style>
