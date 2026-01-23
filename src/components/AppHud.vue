<script setup>
defineProps({
  direction: String,
  angle: Number,
  fov: Number,
  showBuildings: Boolean
});

defineEmits(['toggleBuildings']);
</script>

<template>
  <div class="hud-overlay">
    <!-- Top Center: Compass -->
    <div class="hud-panel compass-panel">
      <div class="direction-letter">{{ direction }}</div>
      <div class="direction-angle">{{ angle }}°</div>
      <div class="fov-info">FOV: {{ fov }}°</div>
    </div>

    <!-- Bottom Center: Buildings Toggle -->
    <div class="hud-panel controls-panel">
      <button class="hud-btn" @click="$emit('toggleBuildings')">
        {{ showBuildings ? 'Hide Buildings' : 'Show Buildings' }}
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

/* Common Panel Style */
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

/* Top Compass */
.compass-panel {
  top: 20px;
  padding: 10px 25px;
  min-width: 120px;
}

.direction-letter { font-size: 2rem; font-weight: 800; color: #ff4d4d; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.direction-angle { font-family: monospace; font-size: 1rem; opacity: 0.8; }
.fov-info { margin-top: 5px; font-size: 0.8rem; color: #aaa; font-family: monospace; }

/* Bottom Controls */
.controls-panel {
  bottom: 40px;
  padding: 15px 25px;
}

/* Buttons */
.hud-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-family: monospace;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}
.hud-btn:hover { background: rgba(255, 255, 255, 0.25); }
.hud-btn:active { transform: scale(0.95); }
</style>