<script setup>
defineProps({
  hasHistory: Boolean
});

defineEmits(['startGps', 'startHistory']);
</script>

<template>
  <div class="landing-container">
    
    <!-- PANNEAU GAUCHE : Actions & Titre -->
    <div class="panel panel-left">
      <div class="header">
        <div class="logo">🌙 ✈️</div>
        <h1>Moon Aircraft</h1>
        <div class="badge">Visualisation en temps réel</div>
      </div>

      <div class="description">
        <p>Suivi du trafic aérien en direct synchronisé avec les cycles lunaires.</p>
      </div>

      <div class="button-group">
        <button 
          v-if="hasHistory" 
          class="btn btn-primary"
          @click="$emit('startHistory')"
        >
          <span class="icon">↺</span> Reprendre le dernier emplacement
        </button>

        <button class="btn btn-secondary" @click="$emit('startGps')">
          <span class="icon">📍</span> Me localiser (GPS)
        </button>
      </div>
      
      <p class="hint">Sélectionnez un mode pour initialiser la simulation.</p>
    </div>

    <!-- PANNEAU DROIT : Informations & Contrôles -->
    <div class="panel panel-right">
      <h2>Contrôles du système</h2>
      
      <div class="info-grid">
        <div class="info-item">
          <span class="key">Clic gauche</span>
          <span class="value">Pivoter la caméra</span>
        </div>
        <div class="info-item">
          <span class="key">Molette</span>
          <span class="value">Zoomer</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tech-stack">
        <p>Données fournies par <strong>OpenSky Network</strong> & <strong>AstronomyAPI</strong>.</p>
        <p class="sub-text">Construit avec Vue 3 + CesiumJS</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.landing-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  z-index: 1000;
}

.panel {
  background: rgba(10, 10, 15, 0.75);
  backdrop-filter: blur(15px);
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  pointer-events: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  width: 340px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
}

.panel-left {
  animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.header { margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
.logo { font-size: 3rem; margin-bottom: 0.5rem; }
h1 { font-family: 'Inter', sans-serif; font-size: 2.2rem; margin: 0; font-weight: 800; letter-spacing: -1px; }
.badge { 
  display: inline-block; 
  background: rgba(74, 158, 255, 0.2); 
  color: #4a9eff; 
  font-size: 0.7rem; 
  padding: 4px 8px; 
  border-radius: 4px; 
  margin-top: 5px; 
  text-transform: uppercase; 
  font-weight: bold; 
  letter-spacing: 1px;
}

.description p { color: #ccc; line-height: 1.5; font-size: 0.95rem; margin-bottom: 2rem; }

.button-group { display: flex; flex-direction: column; gap: 1rem; }
.btn {
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.btn-primary { background: #4a9eff; color: white; box-shadow: 0 4px 15px rgba(74, 158, 255, 0.2); }
.btn-primary:hover { background: #3b8ce6; transform: translateY(-2px); }
.btn-secondary { background: rgba(255, 255, 255, 0.08); color: white; border: 1px solid rgba(255,255,255,0.1); }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255,255,255,0.3); }

.hint { font-size: 0.8rem; margin-top: 1.5rem; opacity: 0.4; text-align: center; margin-bottom: 0;}

.panel-right {
  animation: slideInRight 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  text-align: left;
}

.panel-right h2 {
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #888;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
}

.info-grid { display: flex; flex-direction: column; gap: 12px; }
.info-item { display: flex; justify-content: space-between; align-items: center; }
.key { color: #ccc; font-size: 0.9rem; }
.value { 
  font-family: monospace; 
  background: rgba(255,255,255,0.1); 
  padding: 4px 8px; 
  border-radius: 6px; 
  font-size: 0.8rem; 
  color: #4a9eff;
}

.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 2rem 0; }

.tech-stack { font-size: 0.85rem; color: #888; line-height: 1.6; }
.tech-stack strong { color: #ccc; }
.sub-text { margin-top: 10px; font-style: italic; opacity: 0.6; font-size: 0.75rem; }

@media (max-width: 900px) {
  .landing-container {
    flex-direction: column;
    justify-content: center;
    gap: 20px;
    padding: 20px;
  }
  .panel { width: 100%; max-width: 400px; }
  .panel-right { display: none; }
}

@keyframes slideInLeft { 
  from { opacity: 0; transform: translateX(-50px); } 
  to { opacity: 1; transform: translateX(0); } 
}
@keyframes slideInRight { 
  from { opacity: 0; transform: translateX(50px); } 
  to { opacity: 1; transform: translateX(0); } 
}
</style>