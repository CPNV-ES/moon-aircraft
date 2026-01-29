<script setup>
import { ref, watch } from "vue";
import { VcViewer } from "vue-cesium";
import { config } from "@/config/constants.js";

import { useSceneManager } from "@/composables/useSceneManager.js";
import { usePlayerSystem } from "@/composables/usePlayerSystem.js";
import { useFlightData } from "@/composables/useFlightData.js";
import { useAutoRefresh } from "@/composables/useAutoRefresh.js";
import { useLocationManager } from "@/composables/useLocationManager.js";
import { useAircraftManager } from "@/composables/useAircraftManager.js";
import { useAircraftStore } from "@/composables/useAircraftStore.js";

import AppHud from "@/components/AppHud.vue";
import AppLoading from "@/components/AppLoading.vue";
import LandingScreen from "@/components/LandingScreen.vue";

const viewerRef = ref(null);
const cesiumRef = ref(null);

const appState = ref('IDLE'); 
const loadingText = ref("Initialisation...");

const { setupScene, enableHighResParams, showBuildings, showLandscape, aimAtMoon } = useSceneManager();
const { requestGps, loadFromStorage, hasStoredLocation, currentLocation } = useLocationManager();
const { fetchFlights, error } = useFlightData();
const { clearAircraft } = useAircraftStore();
const { setViewer: setAircraftViewer } = useAircraftManager();
const { initPlayer, stopPlayer, direction: playerDir, angle: playerAng, fov: playerFov } = usePlayerSystem();

const direction = ref("---");
const angle = ref(0);
const fov = ref(60);

const onAimMoon = () => {
    if (viewerRef.value && cesiumRef.value) {
        aimAtMoon(viewerRef.value, cesiumRef.value);
    }
};

const { start: startAutoRefresh, stop: stopAutoRefresh } = useAutoRefresh(() => {
  if (currentLocation.value && appState.value === 'ACTIVE') {
    fetchFlights(currentLocation.value.lat, currentLocation.value.lng);
  }
}, 10000);

watch(error, (newError) => {
    if(newError) console.error(`Erreur de récupération des données : ${newError}`);
});

const onViewerReady = async (cesiumInstance) => {
  const { viewer, Cesium } = cesiumInstance;
  viewerRef.value = viewer;
  cesiumRef.value = Cesium;
  Cesium.Ion.defaultAccessToken = config.cesiumToken;

  setAircraftViewer(viewer);

  try {
    const imageryProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    );
    viewer.imageryLayers.addImageryProvider(imageryProvider);
  } catch (e) {
    console.error("Échec du chargement de l'imagerie de base :", e);
  }

  setupScene(viewer, Cesium, config);
};

const startExperience = async (method) => {
  if (!viewerRef.value) return;
  const viewer = viewerRef.value;
  const Cesium = cesiumRef.value;

  appState.value = 'LOADING';
  loadingText.value = "Acquisition de la position GPS...";

  try {
    let loc;
    if (method === 'gps') {
      loc = await requestGps();
    } else {
      loc = loadFromStorage();
    }

    if (!loc) throw new Error("Impossible de déterminer la position.");

    loadingText.value = "Chargement du terrain et des bâtiments...";
    await enableHighResParams(viewer, Cesium);

    loadingText.value = `Vol vers ${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}...`;
    
    viewer.scene.screenSpaceCameraController.enableInputs = false;

    await viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, loc.height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-20),
        roll: 0.0
      },
      duration: 3.5,
      complete: async () => {
        loadingText.value = "Initialisation des systèmes...";
        
        initPlayer(viewer, Cesium, loc);
        
        watch(playerDir, (v) => direction.value = v, { immediate: true });
        watch(playerAng, (v) => angle.value = v, { immediate: true });
        watch(playerFov, (v) => fov.value = v, { immediate: true });

        viewer.scene.screenSpaceCameraController.enableInputs = true;

        loadingText.value = "Analyse de l'espace aérien...";
        await fetchFlights(loc.lat, loc.lng);
        startAutoRefresh();

        appState.value = 'ACTIVE';
      }
    });

  } catch (e) {
    console.error(e);
    alert(`Une erreur est survenue : ${e.message}`);
    appState.value = 'IDLE';
    viewer.scene.screenSpaceCameraController.enableInputs = true;
  }
};

const goHome = () => {
  const viewer = viewerRef.value;
  if (!viewer) return;

  stopAutoRefresh();
  stopPlayer();
  clearAircraft();
  
  appState.value = 'IDLE';
  viewer.camera.flyHome(2.0);
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

    <transition name="fade">
      <LandingScreen 
        v-if="appState === 'IDLE'"
        :has-history="hasStoredLocation"
        @start-gps="startExperience('gps')"
        @start-history="startExperience('history')"
      />
    </transition>

    <transition name="fade">
      <AppLoading 
        v-if="appState === 'LOADING'" 
        :text="loadingText" 
      />
    </transition>

    <transition name="fade">
      <AppHud
        v-if="appState === 'ACTIVE'"
          :direction="direction"
          :angle="angle"
          :fov="fov"
          :show-buildings="showBuildings"
          @toggle-buildings="showBuildings = !showBuildings"
          :show-landscape="showLandscape"
          @toggle-landscape="showLandscape = !showLandscape"
          @aim-moon="onAimMoon"
          @go-home="goHome"
      />
    </transition>
  </div>
</template>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: black;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>