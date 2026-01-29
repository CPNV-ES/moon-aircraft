<script setup>
defineProps({
  text: {
    type: String,
    default: "Chargement..."
  }
});
</script>

<template>
  <div class="loading-overlay">
    <div class="loader-content">
      <div class="spinner"></div>
      <div class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 60px; height: 60px;
  border: 4px solid rgba(255,255,255,0.2);
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.loading-text {
  font-family: monospace;
  font-size: 1.2rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>