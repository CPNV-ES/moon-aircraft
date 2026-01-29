<template>
  <div v-if="isOpen" class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <h2>Aircraft Details</h2>
      <button @click="closeSidebar" class="close-btn">×</button>
    </div>

    <!-- Content -->
    <div class="sidebar-content">
      <!-- Aucun avion sélectionné -->
      <div v-if="!selectedAircraft" class="no-selection">
        <div class="icon">▲</div>
        <p>No aircraft selected</p>
        <p class="hint">Click on an aircraft in the 3D scene to view details</p>
      </div>

      <!-- Détails de l'avion -->
      <div v-else class="aircraft-info">
        <!-- Callsign -->
        <div class="info-group full-width">
          <label>CALLSIGN</label>
          <div class="value callsign">{{ selectedAircraft.callsign || 'N/A' }}</div>
        </div>

        <!-- ICAO24 et Origin -->
        <div class="info-row">
          <div class="info-group">
            <label>ICAO24</label>
            <div class="value icao">{{ selectedAircraft.icao24 || 'N/A' }}</div>
          </div>
          <div class="info-group">
            <label>ORIGIN</label>
            <div class="value origin">{{ selectedAircraft.origin_country || 'N/A' }}</div>
          </div>
        </div>

        <!-- Altitude et Speed -->
        <div class="info-row">
          <div class="info-group">
            <label>ALTITUDE</label>
            <div class="value altitude">
              {{ formatAltitude(selectedAircraft.geo_altitude) }}
            </div>
          </div>
          <div class="info-group">
            <label>SPEED</label>
            <div class="value speed">
              {{ formatSpeed(selectedAircraft.velocity) }}
            </div>
          </div>
        </div>

        <!-- Heading et Vertical Rate -->
        <div class="info-row">
          <div class="info-group">
            <label>HEADING</label>
            <div class="value heading">
              {{ formatHeading(selectedAircraft.true_track) }}
            </div>
          </div>
          <div class="info-group">
            <label>VERTICAL RATE</label>
            <div class="value">
              {{ formatVerticalRate(selectedAircraft.vertical_rate) }}
            </div>
          </div>
        </div>

        <!-- Position -->
        <div class="info-group full-width">
          <label>POSITION</label>
          <div class="value position">
            {{ formatPosition(selectedAircraft.latitude, selectedAircraft.longitude) }}
          </div>
        </div>

        <!-- On Ground et Last Contact -->
        <div class="info-row">
          <div class="info-group">
            <label>ON GROUND</label>
            <div class="value ground">
              {{ selectedAircraft.on_ground ? 'Yes' : 'No' }}
            </div>
          </div>
          <div class="info-group">
            <label>LAST CONTACT</label>
            <div class="value contact">
              {{ formatLastContact(selectedAircraft.last_contact) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// CORRECTION : Ajouter les imports manquants
import { ref, onMounted, onUnmounted } from 'vue';

const isOpen = ref(false);
const selectedAircraft = ref(null);
const aircraftList = ref([]);
let updateInterval = null;

// Fonction pour récupérer les données avec FETCH
const fetchAircraftData = async () => {
  try {
    console.log('Fetching aircraft data...');

    const response = await fetch('https://opensky-network.org/api/states/all', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return; // Sort de la fonction proprement
    }

    const data = await response.json();

    if (data && data.states) {
      aircraftList.value = data.states.map(state => ({
        icao24: state[0],
        callsign: state[1] ? state[1].trim() : null,
        origin_country: state[2],
        time_position: state[3],
        last_contact: state[4],
        longitude: state[5],
        latitude: state[6],
        baro_altitude: state[7],
        on_ground: state[8],
        velocity: state[9],
        true_track: state[10],
        vertical_rate: state[11],
        sensors: state[12],
        geo_altitude: state[13],
        squawk: state[14],
        spi: state[15],
        position_source: state[16]
      }));

      console.log(`${aircraftList.value.length} aircraft loaded`);
    }
  } catch (error) {
    console.error('Error fetching aircraft data:', error.message);
  }
};

// Sélectionner un avion par ICAO24
const selectAircraftByIcao = (icao24) => {
  const aircraft = aircraftList.value.find(a => a.icao24 === icao24);
  if (aircraft) {
    selectedAircraft.value = aircraft;
    isOpen.value = true;
    console.log('Aircraft selected:', aircraft.callsign || aircraft.icao24);
  } else {
    console.warn('Aircraft not found:', icao24);
  }
};

// Fermer la sidebar
const closeSidebar = () => {
  isOpen.value = false;
  selectedAircraft.value = null;
};

// Fonctions de formatage
const formatAltitude = (altitude) => {
  if (altitude === null || altitude === undefined) return 'N/A';
  return `${Math.round(altitude)} m\n${Math.round(altitude * 3.28084)} ft`;
};

const formatSpeed = (speed) => {
  if (speed === null || speed === undefined) return 'N/A';
  return `${Math.round(speed)} m/s\n${Math.round(speed * 1.94384)} knots`;
};

const formatHeading = (heading) => {
  if (heading === null || heading === undefined) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return `${Math.round(heading)}° (${directions[index]})`;
};

const formatVerticalRate = (rate) => {
  if (rate === null || rate === undefined) return 'N/A';
  const sign = rate > 0 ? 'UP' : rate < 0 ? 'DOWN' : 'LEVEL';
  return `${sign} ${Math.abs(Math.round(rate))} m/s`;
};

const formatPosition = (lat, lon) => {
  if (lat === null || lon === null) return 'N/A';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}\n${Math.abs(lon).toFixed(4)}° ${lonDir}`;
};

const formatLastContact = (timestamp) => {
  if (!timestamp) return 'N/A';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

// Lifecycle hooks
onMounted(() => {
  console.log('Sidebar mounted - Starting data fetch');
  fetchAircraftData();

  updateInterval = setInterval(() => {
    fetchAircraftData();
  }, 10000);
});

onUnmounted(() => {
  console.log('Sidebar unmounted - Clearing interval');
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

// Exposer les méthodes au parent
defineExpose({
  selectAircraftByIcao,
  closeSidebar
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 2px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.no-selection {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.no-selection .icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.no-selection p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.no-selection .hint {
  font-size: 0.9rem;
  color: #475569;
}

.aircraft-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-group.full-width {
  width: 100%;
}

label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.value {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 6px;
  border: 1px solid #334155;
  white-space: pre-line;
}

.callsign {
  font-size: 1.3rem;
  font-weight: bold;
  color: #a78bfa;
  text-align: center;
}

.icao, .origin {
  color: #60a5fa;
}

.altitude, .speed {
  color: #fbbf24;
}

.heading {
  color: #34d399;
}

.position {
  color: #38bdf8;
  font-size: 0.9rem;
}

.ground, .contact {
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }

  .info-row {
    grid-template-columns: 1fr;
  }
}

.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
