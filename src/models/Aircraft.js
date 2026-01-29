/**
 * Represents a standardized aircraft data object.
 */
export class Aircraft {
  /**
   * @param {Object} data - A standardized data object
   * @param {string} data.icao24 - Unique identifier
   * @param {string} [data.callsign]
   * @param {string} [data.originCountry]
   * @param {number} data.longitude
   * @param {number} data.latitude
   * @param {number} [data.altitude]
   * @param {number} [data.velocity]
   * @param {number} [data.heading]
   * @param {boolean} [data.onGround]
   */
  constructor(data) {
    this.icao24 = data.icao24;
    this.callsign = data.callsign || 'N/A';
    this.originCountry = data.originCountry || 'Unknown';
    
    // Standardized Position
    this.position = {
      longitude: data.longitude,
      latitude: data.latitude,
      altitude: data.altitude || 0
    };

    // Standardized Movement
    this.velocity = data.velocity || 0;
    this.heading = data.heading || 0;
    this.onGround = data.onGround || false;

    // Track data (populated later)
    this.track = [];
  }
}