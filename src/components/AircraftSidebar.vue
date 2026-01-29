<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  selectedAircraft: Object
});

const emit = defineEmits(['close']);

const closeSidebar = () => {
  emit('close');
};

const formatAltitude = (altitude) => {
  if (altitude === null || altitude === undefined) return 'N/A';
  const meters = Math.round(altitude);
  const feet = Math.round(altitude * 3.28084);
  return `${meters} m / ${feet} ft`;
};

const formatSpeed = (speed) => {
  if (speed === null || speed === undefined) return 'N/A';
  const ms = Math.round(speed);
  const knots = Math.round(speed * 1.94384);
  return `${ms} m/s / ${knots} nœuds`;
};

const formatHeading = (heading) => {
  if (heading === null || heading === undefined) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  const index = Math.round(heading / 45) % 8;
  return `${Math.round(heading)}° (${directions[index]})`;
};

const formatPosition = (lat, lon) => {
  if (lat === null || lon === null || lat === undefined || lon === undefined) return 'N/A';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'O'; // O for Ouest
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
};
</script>

<template>
  <div v-if="isOpen" class="sidebar">
    <!-- En-tête -->
    <div class="sidebar-header">
      <h2>Détails de l'avion</h2>
      <button @click="closeSidebar" class="close-btn">×</button>
    </div>

    <!-- Contenu -->
    <div class="sidebar-content">
      <!-- Aucun avion sélectionné -->
      <div v-if="!selectedAircraft" class="no-selection">
        <div class="icon">✈️</div>
        <p>Aucun avion sélectionné</p>
        <p class="hint">Cliquez sur un avion dans la scène 3D pour voir ses détails</p>
      </div>

      <!-- Détails de l'avion -->
      <div v-else class="aircraft-info">
        <!-- Indicatif -->
        <div class="info-group full-width">
          <label>INDICATIF (CALLSIGN)</label>
          <div class="value callsign">{{ selectedAircraft.callsign || 'N/A' }}</div>
        </div>

        <!-- ICAO24 et Origine -->
        <div class="info-row">
          <div class="info-group">
            <label>ICAO24</label>
            <div class="value icao">{{ selectedAircraft.icao24 || 'N/A' }}</div>
          </div>
          <div class="info-group">
            <label>PAYS D'ORIGINE</label>
            <div class="value origin">{{ selectedAircraft.originCountry || 'N/A' }}</div>
          </div>
        </div>

        <!-- Altitude et Vitesse -->
        <div class="info-row">
          <div class="info-group">
            <label>ALTITUDE</label>
            <div class="value altitude">
              {{ formatAltitude(selectedAircraft.position.altitude) }}
            </div>
          </div>
          <div class="info-group">
            <label>VITESSE</label>
            <div class="value speed">
              {{ formatSpeed(selectedAircraft.velocity) }}
            </div>
          </div>
        </div>

        <!-- Cap et Statut au sol -->
        <div class="info-row">
          <div class="info-group">
            <label>CAP (HEADING)</label>
            <div class="value heading">
              {{ formatHeading(selectedAircraft.heading) }}
            </div>
          </div>
          <div class="info-group">
            <label>AU SOL</label>
            <div class="value ground">
              {{ selectedAircraft.onGround ? 'Oui' : 'Non' }}
            </div>
          </div>
        </div>
        
        <!-- Position -->
        <div class="info-group full-width">
          <label>POSITION</label>
          <div class="value position">
            {{ formatPosition(selectedAircraft.position.latitude, selectedAircraft.position.longitude) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: transform 0.3s ease-in-out;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

.close-btn {
  background: none; border: none; color: #94a3b8; font-size: 1.5rem;
  cursor: pointer; transition: color 0.2s;
}
.close-btn:hover { color: #ef4444; }

.sidebar-content { flex: 1; overflow-y: auto; padding: 1.5rem; }

.no-selection { text-align: center; padding: 4rem 2rem; color: #64748b; }
.no-selection .icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.no-selection p { margin: 0.5rem 0; }
.no-selection .hint { font-size: 0.9rem; color: #475569; }

.aircraft-info { display: flex; flex-direction: column; gap: 1.25rem; }
.info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.info-group { display: flex; flex-direction: column; gap: 0.4rem; }
.info-group.full-width { width: 100%; }

label {
  font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: #94a3b8;
}

.value {
  font-family: 'Courier New', monospace; font-size: 1rem; padding: 0.75rem;
  background: rgba(30, 41, 59, 0.7); border-radius: 6px;
  border: 1px solid #334155; white-space: pre-wrap;
}

.callsign { font-size: 1.5rem; font-weight: bold; color: #a78bfa; text-align: center; }
.icao, .origin { color: #60a5fa; }
.altitude, .speed { color: #fbbf24; }
.heading { color: #34d399; }
.position { color: #38bdf8; }
.ground { color: #cbd5e1; }
</style>