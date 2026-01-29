# Moon Aircraft

Aircraft visualization and tracking application built with Vue 3, Cesium, and Vite.

## Prerequisites

Before running the project, make sure you have the following installed:

- **Node.js**: version `^20.19.0` or `>=22.12.0`
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify the installation: `node --version`

- **pnpm**: package manager (recommended over npm/yarn)
  - Global installation:
    ```sh
    npm install -g pnpm
    ```
  - Verify the installation:
    ```sh
    pnpm --version
    ```

### Required API Keys

This application requires credentials from three external APIs. You need to create accounts and obtain API keys from:

1. **Cesium Ion**
   - Visit [cesium.com](https://cesium.com/platform/cesiumjs/)
   - Create an account and generate an access token
   - This is used for 3D geospatial visualization

2. **OpenSky Network**
   - Visit [opensky-network.org](https://opensky-network.org/)
   - Create an account and register an application
   - You'll receive a `Client ID` and `Client Secret`
   - This is used for real-time aircraft tracking data

3. **Astronomy API**
   - Visit [astronomyapi.com](https://astronomyapi.com/)
   - Create an account and generate credentials
   - You'll receive an `Application ID` and `Application Secret`
   - This is used for moon phase visualization

## Installation

Once the prerequisites are installed, follow these steps:

1. **Clone or extract the project** (if necessary)

2. **Configure environment variables**:
   - Copy the `.env.example` file to `.env`:
     ```sh
     cp .env.example .env
     ```
   - Edit the `.env` file and replace the placeholder values with your actual API credentials:
     ```env
     VITE_CESIUM_TOKEN=your_cesium_access_token_here
     VITE_APPLICATION_ID=
     VITE_APPLICATION_SECRET=

     ```

3. **Install dependencies**:
   ```sh
   pnpm install
   ```

## Running the application

### Development mode

Start the development server with hot reload:

```sh
pnpm dev
```

The application will be available at `http://localhost:5173` (by default).

### Production mode

Build and minify the application for production:

```sh
pnpm build
```

The compiled files will be generated in the `dist/` directory.

### Preview the production build

Preview the production version locally:

```sh
pnpm preview
```

## Main dependencies

- **Vue 3**: progressive JavaScript framework  
- **Cesium**: library for 3D geospatial visualization  
- **vue-cesium**: integration of Cesium with Vue  
- **Vite**: ultra-fast build tool  

## Recommended IDE

- **VS Code** with the [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension  
  - Disable the Vetur extension if it is installed

## Recommended DevTools

### Chromium-based browsers (Chrome, Edge, Brave, etc.)
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Enable “Custom Object Formatter” in Chrome DevTools ([guide](http://bit.ly/object-formatters))

### Firefox
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
- Enable “Custom Object Formatter” in Firefox DevTools ([guide](https://fxdx.dev/firefox-devtools-custom-object-formatters/))

## Project structure

- `src/`: source code  
- `public/`: static files  
- `index.html`: HTML entry point  
- `vite.config.js`: Vite configuration  

For more details on configuration, see the [Vite documentation](https://vite.dev/config/).
