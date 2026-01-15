<script setup>
import {VcImageryProviderArcgis, VcLayerImagery, VcViewer} from "vue-cesium";
import {useCesiumCam} from "@/composables/useCesiumCam.js";

const {setupScene} = useCesiumCam();

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
  </div>
</template>

<style scoped>

</style>
