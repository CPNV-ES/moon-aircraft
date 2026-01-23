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
            <div class="value" :class="getVerticalClass(selectedAircraft.vertical_rate)">
              {{ formatVerticalRate(selectedAircraft.vertical_rate) }}
            </div>
          </div>
        </div>

        <!-- Position -->
        <div class="info-group full-width">
          <label>POSITION</label>
          <div class="value position">
            Lat: {{ formatCoordinate(selectedAircraft.latitude) }}
            Lon: {{ formatCoordinate(selectedAircraft.longitude) }}
          </div>
        </div>

        <!-- On Ground et Last Contact -->
        <div class="info-row">
          <div class="info-group">
            <label>ON GROUND</label>
            <div class="value ground">
              {{ selectedAircraft.on_ground ? 'YES' : 'NO' }}
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

<script>
export default {
  name: 'AircraftSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    selectedAircraft: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  methods: {
    closeSidebar() {
      this.$emit('close');
    },
    formatAltitude(altitude) {
      if (altitude === null || altitude === undefined) return 'N/A';
      return `${Math.round(altitude)} m`;
    },
    formatSpeed(speed) {
      if (speed === null || speed === undefined) return 'N/A';
      return `${Math.round(speed)} m/s`;
    },
    formatHeading(heading) {
      if (heading === null || heading === undefined) return 'N/A';
      return `${Math.round(heading)}°`;
    },
    formatVerticalRate(rate) {
      if (rate === null || rate === undefined) return 'N/A';
      const rounded = Math.round(rate);
      return rounded > 0 ? `+${rounded} m/s` : `${rounded} m/s`;
    },
    getVerticalClass(rate) {
      if (rate === null || rate === undefined) return '';
      if (rate > 0) return 'climbing';
      if (rate < 0) return 'descending';
      return '';
    },
    formatCoordinate(coord) {
      if (coord === null || coord === undefined) return 'N/A';
      return coord.toFixed(4);
    },
    formatLastContact(timestamp) {
      if (!timestamp) return 'N/A';
      const now = Date.now() / 1000;
      const diff = Math.round(now - timestamp);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
      return `${Math.round(diff / 3600)}h ago`;
    }
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-header {
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #3b82f6;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
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

/* État vide */
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

/* Informations avion */
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

/* Styles spécifiques */
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

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
  .info-row {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar */
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