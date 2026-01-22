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
    BASE_URL: '/opensky-api',
    TOKEN_URL: '/opensky-auth/auth/realms/opensky-network/protocol/openid-connect/token',
    CLIENT_ID: import.meta.env['VITE_OPENSKY_CLIENT_ID'],
    CLIENT_SECRET: import.meta.env['VITE_OPENSKY_CLIENT_SECRET'],
    EARTH_RADIUS_KM: 6371,
    DEFAULT_RADIUS_KM: 100
}
