import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { SubsidencePoint, PadangDistrict } from '../types';

interface LeafletMapProps {
  subsidencePoints: SubsidencePoint[];
  districts: PadangDistrict[];
  selectedPoint: SubsidencePoint | null;
  onPointClick: (point: SubsidencePoint) => void;
  showDataType: 'real' | 'prediction';
  selectedYear: number;
  riskFilter: string[];
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    default: return '#22c55e'; // low
  }
};

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export const LeafletMap: React.FC<LeafletMapProps> = ({
  subsidencePoints,
  districts,
  selectedPoint,
  onPointClick,
  showDataType,
  selectedYear,
  riskFilter
}) => {
  const filteredPoints = subsidencePoints.filter(point =>
    riskFilter.includes(point.riskLevel)
  );

  return (
    <div className="relative">
      <MapContainer center={[-0.9492, 100.3543]} zoom={12} className="w-full h-96 rounded-lg" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredPoints.map((point, idx) => (
          <Marker
            key={idx}
            position={[point.latitude, point.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onPointClick(point)
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold text-base">{point.stationName}</h3>
                <p><strong>Kecamatan:</strong> {point.district}</p>
                <p><strong>{showDataType === 'real' ? 'Penurunan Observasi' : 'Prediksi Penurunan'}:</strong> {(point.subsidence * 100).toFixed(1)} cm/tahun</p>
                <p><strong>Tingkat Risiko:</strong> <span style={{ color: getRiskColor(point.riskLevel) }}>{point.riskLevel.toUpperCase()}</span></p>
                <p><strong>Confidence:</strong> {(point.confidence * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Tahun: {selectedYear}</p>
              </div>
            </Popup>
            <Circle
              center={[point.latitude, point.longitude]}
              radius={100}
              pathOptions={{ color: getRiskColor(point.riskLevel), fillOpacity: 0.3 }}
            />
          </Marker>
        ))}
      </MapContainer>

      {/* Legend Risiko */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg">
        <h5 className="text-gray-800 text-sm font-medium mb-2">Tingkat Risiko</h5>
        <div className="space-y-1">
          {[
            { level: 'Rendah', color: '#22c55e', range: '< 1.5 cm/tahun' },
            { level: 'Sedang', color: '#eab308', range: '1.5-2.0 cm/tahun' },
            { level: 'Tinggi', color: '#f97316', range: '2.0-3.0 cm/tahun' },
            { level: 'Kritis', color: '#ef4444', range: '> 3.0 cm/tahun' }
          ].map((item) => (
            <div key={item.level} className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-700">{item.level}: {item.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daftar Kecamatan */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg max-h-60 overflow-y-auto">
        <h5 className="text-gray-800 text-sm font-medium mb-2">Daftar Kecamatan</h5>
        <ul className="text-xs text-gray-700 space-y-1">
          {districts.map(d => (
            <li key={d.id}>• {d.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export const GoogleMap = LeafletMap;