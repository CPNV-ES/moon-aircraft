<script setup>
defineProps({
  direction: String,
  angle: Number,
  fov: Number,
  showBuildings: Boolean,
  aircraftCount: Number,
  loading: Boolean
});

defineEmits(['toggleBuildings', 'fetch-flights']);
</script>

<template>
  <div class="hud-overlay">
    <div class="hud-compass">
      <div class="direction-letter">{{ direction }}</div>
      <div class="direction-angle">{{ angle }}°</div>
      <div class="fov-info">FOV: {{ fov }}°</div>
      <div v-if="aircraftCount > 0" class="aircraft-count">
        Aircraft: {{ aircraftCount }}
      </div>
    </div>

    <button class="hud-btn fetch-btn" @click="$emit('fetch-flights')" :disabled="loading">
      {{ loading ? 'Loading...' : 'Fetch Flights' }}
    </button>

    <button class="hud-btn" @click="$emit('toggleBuildings')">
      {{ showBuildings ? 'Hide Buildings' : 'Show Buildings' }}
    </button>
  </div>
</template>

<style scoped>
.hud-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.hud-compass {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 10px 25px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  min-width: 120px;
  text-align: center;
}

.direction-letter {
  font-size: 2rem;
  font-weight: 800;
  color: #ff4d4d;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.direction-angle { font-family: monospace; font-size: 1rem; opacity: 0.8; }
.fov-info { margin-top: 5px; font-size: 0.8rem; color: #aaa; font-family: monospace; }
.aircraft-count { margin-top: 8px; font-size: 0.9rem; color: #00ddff; font-family: monospace; font-weight: bold; }

.hud-btn {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
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
.hud-btn:active { transform: translateX(-50%) scale(0.95); }
.hud-btn:disabled { background: #333; color: #888; cursor: not-allowed; }

.fetch-btn {
  bottom: 100px;
}
</style>