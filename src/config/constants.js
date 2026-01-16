export const config = {
    cesiumToken: import.meta.env['VITE_CESIUM_TOKEN'],
    location :{
        name: 'Yverdon-les-Bains',
        lng: 6.6412,
        lat: 46.778,
        height: 437,
        heading: 180,
        pitch: 10
    }
}

// OpenSky Network API Configuration
export const OPENSKY_API = {
    BASE_URL: 'https://opensky-network.org/api',
    EARTH_RADIUS_KM: 6371,
    DEFAULT_RADIUS_KM: 100
}
