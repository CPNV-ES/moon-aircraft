<script setup>

import VueCesium, {VcViewer} from "vue-cesium";
import HelloWorld from "@/components/HelloWorld.vue";

const onViewerReady = async (cesiumInstance) => {
  const {viewer, Cesium} = cesiumInstance;
  Cesium.Ion.defaultAccessToken = 'mettre votre clé ici';
  try {
    viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();
    viewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync());
  } catch (error) {
    console.log("Erreur:", error);
  }

  viewer.scene.globe.enableLighting = true;

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(6.6412, 46.7785, 437),
    orientation: {
      heading: Cesium.Math.toRadians(180),
      pitch: Cesium.Math.toRadians(10),
      roll: 0.0
    }
  });
  viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

  const controller = viewer.scene.screenSpaceCameraController;

  controller.enableZoom = false;
  controller.enableTranslate = false;
  controller.enableTilt = false;
  controller.enableLook = true;
  controller.rotateEventTypes = undefined;
  controller.zoomEventTypes = undefined;
  controller.tiltEventTypes = undefined;
  controller.lookEventTypes = [
    Cesium.CameraEventType.LEFT_DRAG,
    Cesium.CameraEventType.PINCH
  ];

}
</script>

<template>
  <hello-world msg="Hello Vue 3!"></hello-world>
  <vc-viewer
      @ready="onViewerReady"
      :animation="false"
      :timeline="false"
      :base-layer-picker="false"
  >
  </vc-viewer>
</template>
