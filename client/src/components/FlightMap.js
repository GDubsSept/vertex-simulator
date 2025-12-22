import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different location types
const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 12px;
    height: 12px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 10px ${color};
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const depotIcon = createIcon('#52247F');
const alertIcon = createIcon('#ef4444');
const transitIcon = createIcon('#10b981');

// Real coordinates for Vertex facilities and logistics hubs
const locations = {
  // Vertex Facilities
  'BOS-HQ': { lat: 42.3467, lng: -71.0442, name: 'Boston HQ (Seaport)', type: 'facility' },
  'BOS-DC': { lat: 42.3601, lng: -71.0589, name: 'Boston Distribution Center', type: 'depot' },
  
  // Distribution Centers
  'MEM-HUB': { lat: 35.1495, lng: -90.0490, name: 'Memphis Central Hub', type: 'depot' },
  'CHI-DEPOT': { lat: 41.9742, lng: -87.9073, name: 'Chicago Cryo Depot', type: 'depot' },
  'ATL-DC': { lat: 33.6407, lng: -84.4277, name: 'Atlanta Distribution Center', type: 'depot' },
  'DAL-DC': { lat: 32.8998, lng: -97.0403, name: 'Dallas Distribution Center', type: 'depot' },
  
  // Airports
  'ORD': { lat: 41.9742, lng: -87.9073, name: "Chicago O'Hare (ORD)", type: 'airport' },
  'BOS': { lat: 42.3656, lng: -71.0096, name: 'Boston Logan (BOS)', type: 'airport' },
  'LAX': { lat: 33.9425, lng: -118.4081, name: 'Los Angeles (LAX)', type: 'airport' },
  'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth (DFW)', type: 'airport' },
  'MEM': { lat: 35.0421, lng: -89.9792, name: 'Memphis (MEM)', type: 'airport' },
  
  // Cryo Depots
  'CHI-CRYO': { lat: 41.8819, lng: -87.6278, name: 'Chicago Cryo Depot', type: 'cryo' },
  'MKE-CRYO': { lat: 42.9471, lng: -87.8966, name: 'Milwaukee Cryo Facility', type: 'cryo' },
  'IND-CRYO': { lat: 39.7684, lng: -86.1581, name: 'Indianapolis Cryo Center', type: 'cryo' },
};

// Flight paths based on mock data
const flightPaths = [
  {
    id: 'VX-CGT-001',
    from: 'ORD',
    to: 'BOS',
    status: 'GROUNDED',
    color: '#ef4444',
    currentPosition: { lat: 41.9742, lng: -87.9073 }
  },
  {
    id: 'VX-SM-042',
    from: 'LAX',
    to: 'MEM',
    status: 'IN_TRANSIT',
    color: '#10b981',
    currentPosition: { lat: 37.5, lng: -98.0 }
  },
  {
    id: 'VX-APL-108',
    from: 'LAX',
    to: 'DFW',
    status: 'DELAYED',
    color: '#f59e0b',
    currentPosition: { lat: 33.9425, lng: -118.4081 }
  }
];

const FlightMap = ({ flightData }) => {
  // Use bounds that show continental US
  const bounds = [[24, -125], [50, -66]];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        bounds={bounds}
        style={{ height: '100%', width: '100%', background: '#1e293b' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Depot Markers */}
        {Object.entries(locations)
          .filter(([_, loc]) => loc.type === 'depot' || loc.type === 'cryo')
          .map(([id, loc]) => (
            <Marker key={id} position={[loc.lat, loc.lng]} icon={depotIcon}>
              <Popup className="custom-popup">
                <div className="text-sm">
                  <strong>{loc.name}</strong>
                  <br />
                  <span className="text-gray-400">{id}</span>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Flight Paths */}
        {flightPaths.map((flight) => {
          const from = locations[flight.from];
          const to = locations[flight.to];
          if (!from || !to) return null;

          return (
            <React.Fragment key={flight.id}>
              {/* Path line */}
              <Polyline
                positions={[[from.lat, from.lng], [to.lat, to.lng]]}
                color={flight.color}
                weight={2}
                opacity={0.6}
                dashArray={flight.status === 'GROUNDED' ? '5, 10' : undefined}
              />
              
              {/* Current position marker */}
              <Marker
                position={[flight.currentPosition.lat, flight.currentPosition.lng]}
                icon={flight.status === 'GROUNDED' ? alertIcon : transitIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{flight.id}</strong>
                    <br />
                    Status: <span style={{ color: flight.color }}>{flight.status}</span>
                    <br />
                    {from.name} → {to.name}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default FlightMap;