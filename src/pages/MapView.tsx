import React, { useState, useEffect } from 'react';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, TrendingDown, Calendar, Filter } from 'lucide-react';

interface SubsidencePoint {
  id: string;
  latitude: number;
  longitude: number;
  easting: number;
  northing: number;
  subsidence: number;
  yearlyRate: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  stationName: string;
  lastUpdate: string;
  confidence: number;
}

export const MapView: React.FC = () => {
  const [subsidencePoints, setSubsidencePoints] = useState<SubsidencePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<SubsidencePoint | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -6.2088, lng: 106.8456 }); // Jakarta coordinates
  const [zoomLevel, setZoomLevel] = useState(10);
  const [showRiskFilter, setShowRiskFilter] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string[]>(['low', 'medium', 'high', 'critical']);
  const [timeRange, setTimeRange] = useState('1year');

  // Generate mock subsidence data points
  useEffect(() => {
    const generateMockPoints = () => {
      const points: SubsidencePoint[] = [];
      const baseCoords = [
        { name: 'Jakarta Central', lat: -6.2088, lng: 106.8456 },
        { name: 'North Jakarta', lat: -6.1344, lng: 106.8467 },
        { name: 'West Jakarta', lat: -6.1664, lng: 106.7833 },
        { name: 'East Jakarta', lat: -6.2250, lng: 106.9004 },
        { name: 'South Jakarta', lat: -6.2615, lng: 106.8106 },
        { name: 'Bekasi', lat: -6.2383, lng: 107.0039 },
        { name: 'Tangerang', lat: -6.1783, lng: 106.6319 },
        { name: 'Depok', lat: -6.4025, lng: 106.7942 },
        { name: 'Bogor', lat: -6.5971, lng: 106.8060 },
        { name: 'Cibinong', lat: -6.4817, lng: 106.8540 }
      ];

      baseCoords.forEach((coord, index) => {
        // Add some random variation around each base coordinate
        for (let i = 0; i < 3; i++) {
          const latOffset = (Math.random() - 0.5) * 0.1;
          const lngOffset = (Math.random() - 0.5) * 0.1;
          const subsidence = (Math.random() - 0.3) * 0.8; // Range from -0.5 to 0.3
          const yearlyRate = Math.abs(subsidence) * (0.8 + Math.random() * 0.4);
          
          let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (yearlyRate > 0.5) riskLevel = 'critical';
          else if (yearlyRate > 0.3) riskLevel = 'high';
          else if (yearlyRate > 0.1) riskLevel = 'medium';

          points.push({
            id: `${index}-${i}`,
            latitude: coord.lat + latOffset,
            longitude: coord.lng + lngOffset,
            easting: 700000 + (coord.lng - 106) * 111000 + lngOffset * 111000,
            northing: 9300000 + (coord.lat + 6) * 111000 + latOffset * 111000,
            subsidence,
            yearlyRate,
            riskLevel,
            stationName: `${coord.name} ${i + 1}`,
            lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            confidence: 0.7 + Math.random() * 0.25
          });
        }
      });

      setSubsidencePoints(points);
    };

    generateMockPoints();
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      default: return 'bg-green-500 border-green-600';
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const filteredPoints = subsidencePoints.filter(point => 
    riskFilter.includes(point.riskLevel)
  );

  const handlePointClick = (point: SubsidencePoint) => {
    setSelectedPoint(point);
    setMapCenter({ lat: point.latitude, lng: point.longitude });
  };

  const toggleRiskFilter = (risk: string) => {
    setRiskFilter(prev => 
      prev.includes(risk) 
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    );
  };

  const resetView = () => {
    setMapCenter({ lat: -6.2088, lng: 106.8456 });
    setZoomLevel(10);
    setSelectedPoint(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Interactive Subsidence Map</h1>
          <p className="text-xl text-gray-300">
            Real-time visualization of land subsidence monitoring points and risk assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Controls and Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map Controls */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Map Controls
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ZoomIn className="h-4 w-4" />
                  <span>Zoom In</span>
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ZoomOut className="h-4 w-4" />
                  <span>Zoom Out</span>
                </button>
                <button
                  onClick={resetView}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset View</span>
                </button>
              </div>
            </div>

            {/* Risk Level Filter */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Risk Level Filter
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'low', label: 'Low Risk', color: 'green' },
                  { key: 'medium', label: 'Medium Risk', color: 'yellow' },
                  { key: 'high', label: 'High Risk', color: 'orange' },
                  { key: 'critical', label: 'Critical Risk', color: 'red' }
                ].map((risk) => (
                  <label key={risk.key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={riskFilter.includes(risk.key)}
                      onChange={() => toggleRiskFilter(risk.key)}
                      className="form-checkbox h-4 w-4 text-green-600"
                    />
                    <div className={`w-3 h-3 rounded-full bg-${risk.color}-500`}></div>
                    <span className="text-gray-300">{risk.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Points:</span>
                  <span className="text-white font-medium">{subsidencePoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Visible:</span>
                  <span className="text-white font-medium">{filteredPoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Critical:</span>
                  <span className="text-white font-medium">
                    {subsidencePoints.filter(p => p.riskLevel === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-400">High Risk:</span>
                  <span className="text-white font-medium">
                    {subsidencePoints.filter(p => p.riskLevel === 'high').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Display */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              {/* Map Header */}
              <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Jakarta Metropolitan Area - Land Subsidence Map
                  </h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
                    >
                      <option value="1month">Last Month</option>
                      <option value="3months">Last 3 Months</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="1year">Last Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Simulated Map Display */}
              <div className="relative h-96 bg-gradient-to-br from-blue-900 to-green-900 overflow-hidden">
                {/* Map Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
                    {Array.from({ length: 400 }).map((_, i) => (
                      <div key={i} className="border border-gray-600 border-opacity-30"></div>
                    ))}
                  </div>
                </div>

                {/* Subsidence Points */}
                {filteredPoints.map((point) => {
                  const x = ((point.longitude - (mapCenter.lng - 0.5)) / 1) * 100;
                  const y = ((mapCenter.lat + 0.5 - point.latitude) / 1) * 100;
                  
                  if (x < 0 || x > 100 || y < 0 || y > 100) return null;

                  return (
                    <div
                      key={point.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-125 ${
                        selectedPoint?.id === point.id ? 'scale-150 z-10' : 'z-5'
                      }`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => handlePointClick(point)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${getRiskColor(point.riskLevel)} shadow-lg`}>
                        <div className="w-full h-full rounded-full animate-pulse opacity-50"></div>
                      </div>
                      {selectedPoint?.id === point.id && (
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-2 rounded-lg shadow-lg border border-gray-600 min-w-48">
                          <div className="text-sm font-medium mb-1">{point.stationName}</div>
                          <div className="text-xs text-gray-300">
                            Subsidence: {point.subsidence.toFixed(3)}m
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 rounded-lg p-3 border border-gray-600">
                  <h4 className="text-white text-sm font-medium mb-2">Risk Levels</h4>
                  <div className="space-y-1">
                    {[
                      { level: 'Low', color: 'bg-green-500', range: '< 0.1 m/year' },
                      { level: 'Medium', color: 'bg-yellow-500', range: '0.1-0.3 m/year' },
                      { level: 'High', color: 'bg-orange-500', range: '0.3-0.5 m/year' },
                      { level: 'Critical', color: 'bg-red-500', range: '> 0.5 m/year' }
                    ].map((item) => (
                      <div key={item.level} className="flex items-center space-x-2 text-xs">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-gray-300">{item.level}: {item.range}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zoom Level Indicator */}
                <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-90 rounded-lg px-3 py-1 border border-gray-600">
                  <span className="text-white text-sm">Zoom: {zoomLevel}</span>
                </div>
              </div>
            </div>

            {/* Selected Point Details */}
            {selectedPoint && (
              <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {selectedPoint.stationName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedPoint.riskLevel)} text-white`}>
                    {selectedPoint.riskLevel.toUpperCase()} RISK
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-red-400" />
                      <h4 className="text-white font-medium">Subsidence Data</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current:</span>
                        <span className="text-white">{selectedPoint.subsidence.toFixed(3)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Yearly Rate:</span>
                        <span className={getRiskTextColor(selectedPoint.riskLevel)}>
                          {selectedPoint.yearlyRate.toFixed(3)} m/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{(selectedPoint.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <h4 className="text-white font-medium">Location</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Latitude:</span>
                        <span className="text-white">{selectedPoint.latitude.toFixed(6)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Longitude:</span>
                        <span className="text-white">{selectedPoint.longitude.toFixed(6)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">UTM Zone:</span>
                        <span className="text-white">48S</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-green-400" />
                      <h4 className="text-white font-medium">Status</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Update:</span>
                        <span className="text-white">
                          {new Date(selectedPoint.lastUpdate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data Quality:</span>
                        <span className="text-white">Good</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPoint.riskLevel === 'critical' && (
                  <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="text-red-200 font-medium mb-1">Critical Subsidence Alert</h4>
                        <p className="text-red-300 text-sm">
                          This location shows critical subsidence rates exceeding 0.5 m/year. 
                          Immediate monitoring and mitigation measures are recommended.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};