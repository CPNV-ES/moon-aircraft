import { ref, watch, onUnmounted } from 'vue';
import * as Cesium from 'cesium';
import { useAircraftStore } from './useAircraftStore';

export function useAircraftManager() {
  const aircraftEntities = ref(new Map());
  const viewerRef = ref(null);
  const { getAllAircraft } = useAircraftStore();

  const setViewer = (viewerInstance) => {
    viewerRef.value = viewerInstance;
  };

  function updateAircraftEntities(flights) {
    const viewer = viewerRef.value;
    if (!viewer || viewer.isDestroyed()) return;

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

      const course = Cesium.Math.toRadians(aircraft.heading || 0);
      const headingOffset = Cesium.Math.toRadians(-90); 
      
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        new Cesium.HeadingPitchRoll(course + headingOffset, 0, 0)
      );

      let entity = aircraftEntities.value.get(aircraft.icao24);

      if (entity) {
        entity.position = position;
        entity.orientation = orientation;
        if(entity.label) {
            entity.label.text = `${aircraft.callsign}\n${Math.round(aircraft.position.altitude)}m`;
        }
      } else {
        entity = viewer.entities.add({
          id: aircraft.icao24,
          position: position,
          orientation: orientation,

          model: {
            uri: '/3dmodels/Airplane.glb',
            minimumPixelSize: 30, 
            scale: 0.8,           
            maximumScale: 200,    
            runAnimations: true
          },

          label: {
            text: `${aircraft.callsign}\n${Math.round(aircraft.position.altitude)}m`,
            font: 'bold 32px sans-serif', 
            scale: 0.4,                   
            
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3, 
            
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('rgba(15, 15, 25, 0.9)'),
            backgroundPadding: new Cesium.Cartesian2(12, 6),
            
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -30),
            
            eyeOffset: new Cesium.Cartesian3(0, 0, -50), 
            
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 50000.0),
            disableDepthTestDistance: undefined 
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

  const stopWatch = watch(() => getAllAircraft(), (newFlights) => {
      if(newFlights && viewerRef.value) updateAircraftEntities(newFlights);
  }, { deep: true });

  onUnmounted(() => {
    stopWatch();
    const viewer = viewerRef.value;
    if(viewer && !viewer.isDestroyed()) {
        aircraftEntities.value.forEach(e => viewer.entities.remove(e));
        aircraftEntities.value.clear();
    }
  });

  return { aircraftEntities, setViewer };
}