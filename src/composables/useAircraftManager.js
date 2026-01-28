import { ref } from 'vue';
import * as Cesium from 'cesium';

export function useAircraftManager(viewer) {
  const aircraftEntities = ref(new Map());

  /**
   * Updates, creates, or removes aircraft entities based on fresh flight data.
   * @param {Array<Aircraft>} flights - The array of aircraft data from useFlightData.
   */
  function updateAircraftEntities(flights) {
    if (!viewer) return;

    const newIcao24s = new Set(flights.map(f => f.icao24));

    for (const [icao24, entity] of aircraftEntities.value.entries()) {
      if (!newIcao24s.has(icao24)) {
        viewer.entities.remove(entity);
        aircraftEntities.value.delete(icao24);
      }
    }

    flights.forEach(aircraft => {
      const position = Cesium.Cartesian3.fromDegrees(
        aircraft.position.longitude,
        aircraft.position.latitude,
        aircraft.position.altitude
      );

      const heading = Cesium.Math.toRadians(aircraft.heading || 0);
      const pitch = 0;
      const roll = 0;
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        new Cesium.HeadingPitchRoll(heading, pitch, roll)
      );

      let entity = aircraftEntities.value.get(aircraft.icao24);

      if (entity) {
        // Entity exists, update its position and orientation
        entity.position = position;
        entity.orientation = orientation;
      } else {
        // Entity doesn't exist, create it
        entity = viewer.entities.add({
          id: aircraft.icao24,
          position: position,
          orientation: orientation,
          model: {
            uri: '/3dmodels/DC8_AFRC_AIR_0824.glb',
            minimumPixelSize: 64,
            maximumScale: 1000,
          },
          properties: {
            isAircraft: true,
            ...aircraft
          }
        });
        aircraftEntities.value.set(aircraft.icao24, entity);
      }
    });
  }

  return {
    updateAircraftEntities
  };
}