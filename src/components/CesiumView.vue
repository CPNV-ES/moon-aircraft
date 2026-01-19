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

  display: flex;
  flex-direction: column;
  align-items: center;

  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 10px 25px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  pointer-events: none;
}

.direction-letter {
  font-size: 2rem;
  font-weight: 800;
  color: #ff4d4d;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.direction-angle {
  font-family: monospace;
  font-size: 1rem;
  opacity: 0.8;
}

.fov-info {
  margin-top: 5px;
  font-size: 0.8rem;
  color: #aaa;
  font-family: monospace;
}

.hud-btn {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;

  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 30px;
  font-family: monospace;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s;
}

.hud-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-50%) scale(1.05);
}

.hud-btn:active {
  transform: translateX(-50%) scale(0.95);
}
</style>
