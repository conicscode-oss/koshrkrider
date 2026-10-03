'use client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet';

const icon = L.divIcon({ html: '<div style="font-size:34px;line-height:34px;filter:drop-shadow(0 2px 2px #0008)">🏍️</div>', className: '', iconSize: [34, 34], iconAnchor: [17, 17] });

function Focus({ pos, focus }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, Math.max(map.getZoom(), 16)); }, [focus]); // eslint-disable-line
  return null;
}

export default function Map({ pos, trail, park, radius, focus }) {
  return (
    <MapContainer center={pos} zoom={16} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
      {trail.length > 1 && <Polyline positions={trail.map((t) => [t.lat, t.lng])} color="#ff7a00" weight={4} />}
      {park && <Circle center={[park.lat, park.lng]} radius={radius} pathOptions={{ color: '#16a34a', fillOpacity: 0.15 }} />}
      <Marker position={pos} icon={icon} />
      <Focus pos={pos} focus={focus} />
    </MapContainer>
  );
}
