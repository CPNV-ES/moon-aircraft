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

## Installation

Once the prerequisites are installed, follow these steps:

1. **Clone or extract the project** (if necessary)

2. **Install dependencies**:
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
