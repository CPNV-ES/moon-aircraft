import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueCesium from 'vue-cesium'
import 'vue-cesium/dist/index.css'
import enUS from 'vue-cesium/es/locale/lang/en-us'

const app = createApp(App)

app.use(VueCesium, {
    locale: enUS
})

createApp(App).mount('#app')
