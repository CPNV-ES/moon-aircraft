<script setup>
import { ref, watch, computed } from "vue";
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
import AircraftSidebar from "@/components/AircraftSidebar.vue";

const viewerRef = ref(null);
const cesiumRef = ref(null);

const appState = ref('IDLE'); 
const loadingText = ref("Initialisation...");

const isSidebarOpen = ref(false);
const selectedIcao24 = ref(null);

const { setupScene, enableHighResParams, showBuildings, showLandscape, aimAtMoon } = useSceneManager();
const { requestGps, loadFromStorage, hasStoredLocation, currentLocation } = useLocationManager();
const { fetchFlights } = useFlightData();
const { clearAircraft, getAircraft } = useAircraftStore();
const { setViewer: setAircraftViewer } = useAircraftManager();
const { initPlayer, stopPlayer, direction: playerDir, angle: playerAng, fov: playerFov } = usePlayerSystem();

const direction = ref("---");
const angle = ref(0);
const fov = ref(60);

const selectedAircraftData = computed(() => {
  if (selectedIcao24.value) {
    return getAircraft(selectedIcao24.value);
  }
  return null;
});

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

const handleSceneClick = (click) => {
  const viewer = viewerRef.value;
  if (!viewer) return;

  const pickedObject = viewer.scene.pick(click.position);
  if (pickedObject && pickedObject.id && pickedObject.id.properties && pickedObject.id.properties.isAircraft) {
    const icao = pickedObject.id.id;
    console.log(`Avion sélectionné : ${icao}`);
    selectedIcao24.value = icao;
    isSidebarOpen.value = true;
  } else {
    isSidebarOpen.value = false;
    selectedIcao24.value = null;
  }
};

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

  viewer.screenSpaceEventHandler.setInputAction(handleSceneClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const startExperience = async (method) => {
  if (!viewerRef.value) return;
  const viewer = viewerRef.value;
  const Cesium = cesiumRef.value;

  appState.value = 'LOADING';
  loadingText.value = "Acquisition de la position GPS...";

  try {
    let loc = (method === 'gps') ? await requestGps() : loadFromStorage();
    await enableHighResParams(viewer, Cesium);
    
    await viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, loc.height),
      duration: 3,
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
  isSidebarOpen.value = false;
  appState.value = 'IDLE';
  viewerRef.value.camera.flyHome(2.0);
};

</script>

<template>
  <div class="viewer-container">
    <vc-viewer
      :animation="false" :base-layer-picker="false" :timeline="false"
      :selection-indicator="false" :info-box="false"
      @ready="onViewerReady"
    >
    </vc-viewer>

    <!-- UI Overlays -->
    <transition name="fade">
      <LandingScreen v-if="appState === 'IDLE'" :has-history="hasStoredLocation" @start-gps="startExperience('gps')" @start-history="startExperience('history')" />
    </transition>

    <transition name="fade">
      <AppLoading v-if="appState === 'LOADING'" :text="loadingText" />
    </transition>

    <transition name="fade">
      <AppHud v-if="appState === 'ACTIVE'" :direction="direction" :angle="angle" :fov="fov" :show-buildings="showBuildings" @toggle-buildings="showBuildings = !showBuildings" :show-landscape="showLandscape" @toggle-landscape="showLandscape = !showLandscape" @aim-moon="onAimMoon" @go-home="goHome" />
    </transition>
    
    <!-- Sidebar -->
    <AircraftSidebar 
      :is-open="isSidebarOpen"
      :selected-aircraft="selectedAircraftData"
      @close="isSidebarOpen = false"
    />
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>