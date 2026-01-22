/**
 * Represents a standardized aircraft data object.
 * The constructor is designed to map data from the OpenSky Network API 'states' array.
 */
export class Aircraft {
  constructor(stateVector) {
    this.icao24 = stateVector[0]; // Unique ICAO24 address
    this.callsign = stateVector[1]?.trim() || 'N/A';
    this.originCountry = stateVector[2];
    
    // Position and Altitude
    this.position = {
      longitude: stateVector[5],
      latitude: stateVector[6],
      // Use barometric altitude, fall back to geometric if null
      altitude: stateVector[7] ?? stateVector[13] ?? 0 
    };

    // Movement
    this.onGround = stateVector[8];
    this.velocity = stateVector[9] || 0; // Speed in m/s
    this.heading = stateVector[10] || 0; // True track in degrees
    this.verticalRate = stateVector[11] || 0; // In m/s

    // Track data (to be populated later)
    this.track = [];

    // Metadata
    this.lastContact = stateVector[4];
  }
}