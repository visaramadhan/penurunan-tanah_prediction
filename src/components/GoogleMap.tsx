import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { SubsidencePoint, PadangDistrict } from '../types';

interface GoogleMapProps {
  subsidencePoints: SubsidencePoint[];
  districts: PadangDistrict[];
  selectedPoint: SubsidencePoint | null;
  onPointClick: (point: SubsidencePoint) => void;
  showDataType: 'real' | 'prediction';
  selectedYear: number;
  riskFilter: string[];
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  subsidencePoints,
  districts,
  selectedPoint,
  onPointClick,
  showDataType,
  selectedYear,
  riskFilter
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#22c55e';
    }
  };

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your actual API key
        version: "weekly",
        libraries: ["places"]
      });

      try {
        await loader.load();
        
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: -0.9492, lng: 100.3543 }, // Padang city center
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#1f2937" }]
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#374151" }]
              },
              {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{ "color": "#4b5563" }]
              }
            ]
          });

          setMap(mapInstance);
          
          const infoWindowInstance = new google.maps.InfoWindow();
          setInfoWindow(infoWindowInstance);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        // Fallback to simulated map if Google Maps fails
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];
    const filteredPoints = subsidencePoints.filter(point => 
      riskFilter.includes(point.riskLevel)
    );

    filteredPoints.forEach(point => {
      const marker = new google.maps.Marker({
        position: { lat: point.latitude, lng: point.longitude },
        map: map,
        title: point.stationName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getRiskColor(point.riskLevel),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        const content = `
          <div style="color: #000; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${point.stationName}</h3>
            <p style="margin: 4px 0;"><strong>Kecamatan:</strong> ${point.district}</p>
            <p style="margin: 4px 0;"><strong>${showDataType === 'real' ? 'Penurunan Observasi' : 'Prediksi Penurunan'}:</strong> ${(point.subsidence * 100).toFixed(1)} cm/tahun</p>
            <p style="margin: 4px 0;"><strong>Tingkat Risiko:</strong> <span style="color: ${getRiskColor(point.riskLevel)}; font-weight: bold;">${point.riskLevel.toUpperCase()}</span></p>
            <p style="margin: 4px 0;"><strong>Confidence:</strong> ${(point.confidence * 100).toFixed(1)}%</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Tahun: ${selectedYear}</p>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        onPointClick(point);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, subsidencePoints, riskFilter, showDataType, selectedYear, infoWindow, onPointClick]);

  // Fallback simulated map if Google Maps is not available
  if (!map) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-900 to-green-900 overflow-hidden rounded-lg">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Loading overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
            <p>Loading Google Maps...</p>
            <p className="text-sm text-gray-300 mt-1">Pastikan API key Google Maps sudah dikonfigurasi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg" />
      
      {/* Legend */}
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
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700">{item.level}: {item.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};