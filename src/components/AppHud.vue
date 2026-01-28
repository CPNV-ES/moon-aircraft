<script setup>
defineProps({
  direction: String,
  angle: Number,
  fov: Number,
  showBuildings: Boolean,
  showLandscape: Boolean
});

defineEmits(['toggleBuildings', 'toggleLandscape']);
</script>

<template>
  <div class="hud-overlay">
    <div class="hud-panel compass-panel">
      <div class="direction-letter">{{ direction }}</div>
      <div class="direction-angle">{{ angle }}°</div>
      <div class="fov-info">FOV: {{ fov }}°</div>
    </div>

    <div class="hud-panel controls-panel">
      <button class="hud-btn" :class="{ 'is-active': showBuildings }" @click="$emit('toggleBuildings')" :title="showBuildings ? 'Cacher les bâtiments' : 'Afficher les bâtiments'">
        <svg v-if="showBuildings" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M120-120v-560h160v-160h400v320h160v400H520v-160h-80v160H120Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M120-120v-560h160v-160h400v320h160v400H520v-160h-80v160H120Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z"/></svg>
      </button>
      <button class="hud-btn" :class="{ 'is-active': showLandscape }" @click="$emit('toggleLandscape')" :title="showLandscape ? 'Cacher la Terre' : 'Afficher la Terre'">
        <svg v-if="showLandscape" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hud-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 999;
}

.hud-panel {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compass-panel {
  top: 20px;
  padding: 10px 25px;
  min-width: 120px;
}

.direction-letter { font-size: 2rem; font-weight: 800; color: #ff4d4d; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.direction-angle { font-family: monospace; font-size: 1rem; opacity: 0.8; }
.fov-info { margin-top: 5px; font-size: 0.8rem; color: #aaa; font-family: monospace; }

.controls-panel {
  bottom: 40px;
  padding: 15px 25px;
  flex-direction: row;
  gap: 15px;
}

.hud-btn {
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  border-radius: 12px;
  font-family: monospace;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  min-width: unset;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hud-btn.is-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.hud-btn:active { transform: scale(0.95); }
</style>
