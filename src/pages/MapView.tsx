import React, { useState, useEffect } from 'react';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, TrendingDown, Calendar, Filter, Eye, BarChart3 } from 'lucide-react';
import { getPadangDistricts } from '../utils/dataLoader';
import { SubsidencePoint, PadangDistrict } from '../types';

export const MapView: React.FC = () => {
  const [subsidencePoints, setSubsidencePoints] = useState<SubsidencePoint[]>([]);
  const [districts, setDistricts] = useState<PadangDistrict[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<SubsidencePoint | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<PadangDistrict | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -0.9492, lng: 100.3543 }); // Padang center
  const [zoomLevel, setZoomLevel] = useState(11);
  const [showRiskFilter, setShowRiskFilter] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string[]>(['low', 'medium', 'high', 'critical']);
  const [timeRange, setTimeRange] = useState('1year');
  const [viewMode, setViewMode] = useState<'points' | 'districts'>('points');

  // Generate mock subsidence data points for Padang
  useEffect(() => {
    const generatePadangPoints = () => {
      const points: SubsidencePoint[] = [];
      const padangDistricts = getPadangDistricts();
      setDistricts(padangDistricts);
      
      padangDistricts.forEach((district, districtIndex) => {
        // Generate 3-5 monitoring points per district
        const pointCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < pointCount; i++) {
          const latOffset = (Math.random() - 0.5) * 0.02;
          const lngOffset = (Math.random() - 0.5) * 0.02;
          const subsidence = district.subsidenceRate + (Math.random() - 0.5) * 0.01;
          const yearlyRate = Math.abs(subsidence);
          
          let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (yearlyRate > 0.03) riskLevel = 'critical';
          else if (yearlyRate > 0.02) riskLevel = 'high';
          else if (yearlyRate > 0.015) riskLevel = 'medium';

          // Generate historical data
          const historicalData = [];
          for (let year = 2021; year <= 2024; year++) {
            historicalData.push({
              year,
              subsidence: subsidence * (year - 2020) + (Math.random() - 0.5) * 0.005
            });
          }

          points.push({
            id: `${district.id}-${i}`,
            latitude: district.coordinates.lat + latOffset,
            longitude: district.coordinates.lng + lngOffset,
            easting: 128000 + (district.coordinates.lng - 100) * 111000 + lngOffset * 111000,
            northing: 9890000 + (district.coordinates.lat + 1) * 111000 + latOffset * 111000,
            subsidence,
            yearlyRate,
            riskLevel,
            stationName: `${district.name} ${i + 1}`,
            district: district.name,
            lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            confidence: 0.7 + Math.random() * 0.25,
            historicalData,
            prediction: {
              nextYear: subsidence * 1.1,
              next5Years: subsidence * 1.5,
              confidence: 0.8 + Math.random() * 0.15
            }
          });
        }
      });

      setSubsidencePoints(points);
    };

    generatePadangPoints();
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

  const getDistrictColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500 bg-opacity-30 border-red-400';
      case 'high': return 'bg-orange-500 bg-opacity-30 border-orange-400';
      case 'medium': return 'bg-yellow-500 bg-opacity-30 border-yellow-400';
      default: return 'bg-green-500 bg-opacity-30 border-green-400';
    }
  };

  const filteredPoints = subsidencePoints.filter(point => 
    riskFilter.includes(point.riskLevel)
  );

  const filteredDistricts = districts.filter(district => 
    riskFilter.includes(district.riskLevel)
  );

  const handlePointClick = (point: SubsidencePoint) => {
    setSelectedPoint(point);
    setSelectedDistrict(null);
    setMapCenter({ lat: point.latitude, lng: point.longitude });
  };

  const handleDistrictClick = (district: PadangDistrict) => {
    setSelectedDistrict(district);
    setSelectedPoint(null);
    setMapCenter({ lat: district.coordinates.lat, lng: district.coordinates.lng });
  };

  const toggleRiskFilter = (risk: string) => {
    setRiskFilter(prev => 
      prev.includes(risk) 
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    );
  };

  const resetView = () => {
    setMapCenter({ lat: -0.9492, lng: 100.3543 });
    setZoomLevel(11);
    setSelectedPoint(null);
    setSelectedDistrict(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Peta Interaktif Penurunan Tanah Kota Padang</h1>
          <p className="text-xl text-gray-300">
            Visualisasi real-time titik monitoring dan prediksi penurunan tanah di Kota Padang
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Controls and Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* View Mode Toggle */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Mode Tampilan
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setViewMode('points')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'points' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Titik Monitoring
                </button>
                <button
                  onClick={() => setViewMode('districts')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'districts' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Area Kecamatan
                </button>
              </div>
            </div>

            {/* Map Controls */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Kontrol Peta
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
                  onClick={() => setZoomLevel(prev => Math.max(prev - 1, 8))}
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
                Filter Tingkat Risiko
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'low', label: 'Risiko Rendah', color: 'green' },
                  { key: 'medium', label: 'Risiko Sedang', color: 'yellow' },
                  { key: 'high', label: 'Risiko Tinggi', color: 'orange' },
                  { key: 'critical', label: 'Risiko Kritis', color: 'red' }
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
              <h3 className="text-lg font-semibold text-white mb-4">Statistik</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Titik:</span>
                  <span className="text-white font-medium">{subsidencePoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Kecamatan:</span>
                  <span className="text-white font-medium">{districts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Kritis:</span>
                  <span className="text-white font-medium">
                    {subsidencePoints.filter(p => p.riskLevel === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-400">Tinggi:</span>
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
                    Peta Penurunan Tanah Kota Padang - {viewMode === 'points' ? 'Titik Monitoring' : 'Area Kecamatan'}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
                    >
                      <option value="1month">Bulan Terakhir</option>
                      <option value="3months">3 Bulan Terakhir</option>
                      <option value="6months">6 Bulan Terakhir</option>
                      <option value="1year">Tahun Terakhir</option>
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

                {/* District Areas (when in district mode) */}
                {viewMode === 'districts' && filteredDistricts.map((district) => {
                  const x = ((district.coordinates.lng - (mapCenter.lng - 0.1)) / 0.2) * 100;
                  const y = ((mapCenter.lat + 0.1 - district.coordinates.lat) / 0.2) * 100;
                  
                  if (x < 0 || x > 100 || y < 0 || y > 100) return null;

                  return (
                    <div
                      key={district.id}
                      className={`absolute cursor-pointer transition-all duration-200 hover:opacity-80 ${
                        selectedDistrict?.id === district.id ? 'z-10 opacity-90' : 'z-5 opacity-60'
                      }`}
                      style={{ 
                        left: `${Math.max(0, x - 8)}%`, 
                        top: `${Math.max(0, y - 6)}%`,
                        width: '16%',
                        height: '12%'
                      }}
                      onClick={() => handleDistrictClick(district)}
                    >
                      <div className={`w-full h-full rounded-lg border-2 ${getDistrictColor(district.riskLevel)} flex items-center justify-center`}>
                        <div className="text-center">
                          <div className="text-white text-xs font-medium">{district.name}</div>
                          <div className={`text-xs ${getRiskTextColor(district.riskLevel)}`}>
                            {(Math.abs(district.subsidenceRate) * 100).toFixed(1)} cm/yr
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Monitoring Points (when in points mode) */}
                {viewMode === 'points' && filteredPoints.map((point) => {
                  const x = ((point.longitude - (mapCenter.lng - 0.1)) / 0.2) * 100;
                  const y = ((mapCenter.lat + 0.1 - point.latitude) / 0.2) * 100;
                  
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
                            Penurunan: {(point.subsidence * 100).toFixed(1)} cm/tahun
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 rounded-lg p-3 border border-gray-600">
                  <h4 className="text-white text-sm font-medium mb-2">Tingkat Risiko</h4>
                  <div className="space-y-1">
                    {[
                      { level: 'Rendah', color: 'bg-green-500', range: '< 1.5 cm/tahun' },
                      { level: 'Sedang', color: 'bg-yellow-500', range: '1.5-2.0 cm/tahun' },
                      { level: 'Tinggi', color: 'bg-orange-500', range: '2.0-3.0 cm/tahun' },
                      { level: 'Kritis', color: 'bg-red-500', range: '> 3.0 cm/tahun' }
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

            {/* Selected Point/District Details */}
            {(selectedPoint || selectedDistrict) && (
              <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
                {selectedPoint && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        {selectedPoint.stationName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedPoint.riskLevel)} text-white`}>
                        RISIKO {selectedPoint.riskLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingDown className="h-5 w-5 text-red-400" />
                          <h4 className="text-white font-medium">Data Penurunan</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Saat Ini:</span>
                            <span className="text-white">{(selectedPoint.subsidence * 100).toFixed(1)} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Per Tahun:</span>
                            <span className={getRiskTextColor(selectedPoint.riskLevel)}>
                              {(selectedPoint.yearlyRate * 100).toFixed(1)} cm/tahun
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
                          <BarChart3 className="h-5 w-5 text-purple-400" />
                          <h4 className="text-white font-medium">Prediksi</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tahun Depan:</span>
                            <span className="text-white">{(selectedPoint.prediction.nextYear * 100).toFixed(1)} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">5 Tahun:</span>
                            <span className="text-orange-400">{(selectedPoint.prediction.next5Years * 100).toFixed(1)} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Akurasi:</span>
                            <span className="text-white">{(selectedPoint.prediction.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-5 w-5 text-green-400" />
                          <h4 className="text-white font-medium">Informasi</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Kecamatan:</span>
                            <span className="text-white">{selectedPoint.district}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Update:</span>
                            <span className="text-white">
                              {new Date(selectedPoint.lastUpdate).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className="text-green-400">Aktif</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedDistrict && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Kecamatan {selectedDistrict.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedDistrict.riskLevel)} text-white`}>
                        RISIKO {selectedDistrict.riskLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingDown className="h-5 w-5 text-red-400" />
                          <h4 className="text-white font-medium">Rata-rata Penurunan</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Per Tahun:</span>
                            <span className={getRiskTextColor(selectedDistrict.riskLevel)}>
                              {(Math.abs(selectedDistrict.subsidenceRate) * 100).toFixed(1)} cm/tahun
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Populasi:</span>
                            <span className="text-white">{selectedDistrict.population.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-blue-400" />
                          <h4 className="text-white font-medium">Titik Monitoring</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-white">
                              {subsidencePoints.filter(p => p.district === selectedDistrict.name).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Aktif:</span>
                            <span className="text-green-400">
                              {subsidencePoints.filter(p => p.district === selectedDistrict.name).length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-5 w-5 text-green-400" />
                          <h4 className="text-white font-medium">Koordinat</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Latitude:</span>
                            <span className="text-white">{selectedDistrict.coordinates.lat.toFixed(4)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Longitude:</span>
                            <span className="text-white">{selectedDistrict.coordinates.lng.toFixed(4)}°</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedPoint?.riskLevel === 'critical' && (
                  <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="text-red-200 font-medium mb-1">Peringatan Penurunan Kritis</h4>
                        <p className="text-red-300 text-sm">
                          Lokasi ini menunjukkan tingkat penurunan tanah yang kritis melebihi 3.0 cm/tahun. 
                          Diperlukan monitoring intensif dan tindakan mitigasi segera.
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