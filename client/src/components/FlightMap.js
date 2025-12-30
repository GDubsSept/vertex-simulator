import React, { useMemo } from 'react';
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

// Custom icons for different statuses
const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 14px;
    height: 14px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 10px ${color};
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const depotIcon = createIcon('#52247F');
const groundedIcon = createIcon('#ef4444');
const delayedIcon = createIcon('#f59e0b');
const transitIcon = createIcon('#10b981');
const arrivedIcon = createIcon('#3b82f6');

// Comprehensive airport coordinates
const airportCoordinates = {
  // Major US Airports
  'BOS': { lat: 42.3656, lng: -71.0096, name: 'Boston Logan International' },
  'ORD': { lat: 41.9742, lng: -87.9073, name: "Chicago O'Hare International" },
  'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta' },
  'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth International' },
  'DEN': { lat: 39.8561, lng: -104.6737, name: 'Denver International' },
  'LAX': { lat: 33.9425, lng: -118.4081, name: 'Los Angeles International' },
  'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco International' },
  'MEM': { lat: 35.0421, lng: -89.9792, name: 'Memphis International' },
  'CVG': { lat: 39.0489, lng: -84.6678, name: 'Cincinnati/Northern Kentucky' },
  'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International' },
  'MIA': { lat: 25.7959, lng: -80.2870, name: 'Miami International' },
  'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma International' },
  'PHX': { lat: 33.4373, lng: -112.0078, name: 'Phoenix Sky Harbor' },
  'MSP': { lat: 44.8848, lng: -93.2223, name: 'Minneapolis-Saint Paul' },
  'DTW': { lat: 42.2124, lng: -83.3534, name: 'Detroit Metropolitan' },
  'EWR': { lat: 40.6895, lng: -74.1745, name: 'Newark Liberty International' },
  'LGA': { lat: 40.7769, lng: -73.8740, name: 'LaGuardia' },
  'IAH': { lat: 29.9902, lng: -95.3368, name: 'George Bush Intercontinental' },
  'SLC': { lat: 40.7899, lng: -111.9791, name: 'Salt Lake City International' },
  'SAN': { lat: 32.7338, lng: -117.1933, name: 'San Diego International' },
  'MKE': { lat: 42.9472, lng: -87.8966, name: 'Milwaukee Mitchell' },
  'IND': { lat: 39.7173, lng: -86.2944, name: 'Indianapolis International' },
  'CLT': { lat: 35.2140, lng: -80.9431, name: 'Charlotte Douglas' },
  'BWI': { lat: 39.1774, lng: -76.6684, name: 'Baltimore/Washington' },
  'PHL': { lat: 39.8729, lng: -75.2437, name: 'Philadelphia International' },
};

// Distribution center coordinates
const depotCoordinates = {
  'BOS-DC': { lat: 42.3601, lng: -71.0589, name: 'Boston Distribution Center' },
  'MEM-HUB': { lat: 35.1495, lng: -90.0490, name: 'Memphis Central Hub' },
  'CHI-DC': { lat: 41.8500, lng: -87.6500, name: 'Chicago Distribution Center' },
  'ATL-DC': { lat: 33.6500, lng: -84.4500, name: 'Atlanta Distribution Center' },
  'DAL-DC': { lat: 32.8500, lng: -96.8500, name: 'Dallas Distribution Center' },
  'LAX-DC': { lat: 33.9200, lng: -118.3800, name: 'Los Angeles Distribution Center' },
  'DEN-DC': { lat: 39.7500, lng: -104.9500, name: 'Denver Distribution Center' },
};

// Cryo depot coordinates
const cryoCoordinates = {
  'BOS-CRYO': { lat: 42.3400, lng: -71.0500, name: 'Boston Cryo Center' },
  'CHI-CRYO': { lat: 41.9900, lng: -87.9500, name: 'Chicago Cryo Depot' },
  'MKE-CRYO': { lat: 42.9471, lng: -87.8966, name: 'Milwaukee Cryo Facility' },
  'DEN-CRYO': { lat: 39.7300, lng: -104.8300, name: 'Denver Cryo Storage' },
  'ATL-CRYO': { lat: 33.6300, lng: -84.4400, name: 'Atlanta Cryo Center' },
  'LAX-CRYO': { lat: 33.9100, lng: -118.3900, name: 'Los Angeles Cryo Depot' },
  'DFW-CRYO': { lat: 32.8700, lng: -97.0200, name: 'Dallas Cryo Facility' },
  'MEM-CRYO': { lat: 35.0600, lng: -89.9900, name: 'Memphis Cryo Hub' },
  'IND-CRYO': { lat: 39.7684, lng: -86.1581, name: 'Indianapolis Cryo Center' },
};

// Extract airport code from location string
const extractAirportCode = (locationStr) => {
  if (!locationStr) return null;
  
  // Look for 3-letter code in parentheses like "Denver (DEN)" or "Chicago O'Hare (ORD)"
  const parenMatch = locationStr.match(/\(([A-Z]{3})\)/);
  if (parenMatch) return parenMatch[1];
  
  // Look for standalone 3-letter code
  const codeMatch = locationStr.match(/\b([A-Z]{3})\b/);
  if (codeMatch && airportCoordinates[codeMatch[1]]) return codeMatch[1];
  
  // Try to match by city name
  const locationLower = locationStr.toLowerCase();
  const cityMappings = {
    'boston': 'BOS',
    'chicago': 'ORD',
    'atlanta': 'ATL',
    'dallas': 'DFW',
    'denver': 'DEN',
    'los angeles': 'LAX',
    'san francisco': 'SFO',
    'memphis': 'MEM',
    'miami': 'MIA',
    'seattle': 'SEA',
    'phoenix': 'PHX',
    'minneapolis': 'MSP',
    'detroit': 'DTW',
    'new york': 'JFK',
    'philadelphia': 'PHL',
    'charlotte': 'CLT',
    'salt lake': 'SLC',
    'indianapolis': 'IND',
    'milwaukee': 'MKE',
  };
  
  for (const [city, code] of Object.entries(cityMappings)) {
    if (locationLower.includes(city)) return code;
  }
  
  return null;
};

// Get icon based on flight status
const getFlightIcon = (status) => {
  switch (status?.toUpperCase()) {
    case 'GROUNDED': return groundedIcon;
    case 'DELAYED': return delayedIcon;
    case 'DIVERTED': return delayedIcon;
    case 'ARRIVED': return arrivedIcon;
    case 'IN_TRANSIT': return transitIcon;
    default: return transitIcon;
  }
};

// Get line color based on status
const getLineColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'GROUNDED': return '#ef4444';
    case 'DELAYED': return '#f59e0b';
    case 'DIVERTED': return '#f59e0b';
    case 'ARRIVED': return '#3b82f6';
    case 'IN_TRANSIT': return '#10b981';
    default: return '#10b981';
  }
};

const FlightMap = ({ flightData, inventoryData, cryoDepots }) => {
  // Use bounds that show continental US
  const bounds = [[24, -125], [50, -66]];

  // Build flight paths from dynamic data
  const flightPaths = useMemo(() => {
    if (!flightData) return [];
    
    return Object.entries(flightData).map(([flightId, flight]) => {
      const fromCode = extractAirportCode(flight.location);
      const toCode = extractAirportCode(flight.destination);
      
      const fromCoords = fromCode ? airportCoordinates[fromCode] : null;
      const toCoords = toCode ? airportCoordinates[toCode] : null;
      
      // Calculate current position based on status
      let currentPosition = fromCoords;
      if (flight.status === 'IN_TRANSIT' && fromCoords && toCoords) {
        // Show plane halfway for in-transit
        currentPosition = {
          lat: (fromCoords.lat + toCoords.lat) / 2,
          lng: (fromCoords.lng + toCoords.lng) / 2,
        };
      } else if (flight.status === 'ARRIVED' && toCoords) {
        currentPosition = toCoords;
      }
      
      return {
        id: flightId,
        flight,
        fromCoords,
        toCoords,
        currentPosition,
        status: flight.status,
      };
    }).filter(fp => fp.currentPosition); // Only show flights we can place on map
  }, [flightData]);

  // Build depot markers from dynamic data
  const depotMarkers = useMemo(() => {
    const markers = [];
    
    // Add inventory depots
    if (inventoryData) {
      Object.entries(inventoryData).forEach(([depotId, depot]) => {
        const coords = depotCoordinates[depotId];
        if (coords) {
          markers.push({
            id: depotId,
            ...coords,
            type: 'depot',
            data: depot,
          });
        }
      });
    }
    
    // Add cryo depots from scenario
    if (cryoDepots) {
      cryoDepots.forEach(depot => {
        const coords = cryoCoordinates[depot.id];
        if (coords) {
          markers.push({
            id: depot.id,
            ...coords,
            type: 'cryo',
            data: depot,
          });
        }
      });
    }
    
    return markers;
  }, [inventoryData, cryoDepots]);

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
        {depotMarkers.map((depot) => (
          <Marker key={depot.id} position={[depot.lat, depot.lng]} icon={depotIcon}>
            <Popup className="custom-popup">
              <div className="text-sm">
                <strong>{depot.name}</strong>
                <br />
                <span className="text-gray-400">{depot.id}</span>
                {depot.type === 'cryo' && depot.data?.available_slots && (
                  <>
                    <br />
                    <span className="text-blue-400">
                      {depot.data.available_slots} cryo slots available
                    </span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Flight Paths and Markers */}
        {flightPaths.map((fp) => (
          <React.Fragment key={fp.id}>
            {/* Path line (if we have both endpoints) */}
            {fp.fromCoords && fp.toCoords && (
              <Polyline
                positions={[[fp.fromCoords.lat, fp.fromCoords.lng], [fp.toCoords.lat, fp.toCoords.lng]]}
                color={getLineColor(fp.status)}
                weight={2}
                opacity={0.6}
                dashArray={fp.status === 'GROUNDED' ? '5, 10' : undefined}
              />
            )}
            
            {/* Current position marker */}
            {fp.currentPosition && (
              <Marker
                position={[fp.currentPosition.lat, fp.currentPosition.lng]}
                icon={getFlightIcon(fp.status)}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{fp.id}</strong>
                    <br />
                    Status: <span style={{ color: getLineColor(fp.status) }}>{fp.status}</span>
                    <br />
                    {fp.flight.cargo}
                    {fp.flight.patient_id && (
                      <>
                        <br />
                        Patient: <span className="text-purple-400">{fp.flight.patient_id}</span>
                      </>
                    )}
                    {fp.flight.delay_reason && (
                      <>
                        <br />
                        <span className="text-yellow-400">{fp.flight.delay_reason}</span>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default FlightMap;