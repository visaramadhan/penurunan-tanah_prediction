import React, { useState, useEffect } from 'react';
import { Download, Eye, FileText, BarChart3, Play, Database, Upload, MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, TrendingDown, Calendar, Filter } from 'lucide-react';
import { DataPreviewComponent } from '../components/DataPreview';
import { DetailedTraining } from '../components/DetailedTraining';
import { EvaluationMetrics } from '../components/EvaluationMetrics';
import { FileUpload } from '../components/FileUpload';
import { loadPadangData, getPadangDistricts } from '../utils/dataLoader';
import { PLSTMModel } from '../utils/plstm';
import { TrainingStep, PLSTMConfig, ModelMetrics, DataPreview, VariableSelection, SubsidencePoint, PadangDistrict } from '../types';

export const Training: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [selectedVariables, setSelectedVariables] = useState<VariableSelection>({
    primary: ['easting', 'northing', 'height'],
    secondary: [],
    environmental: []
  });
  const [trainedModel, setTrainedModel] = useState<PLSTMModel | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useCustomData, setUseCustomData] = useState(false);

  // Real-time prediction and map states
  const [isRealTimePrediction, setIsRealTimePrediction] = useState(false);
  const [subsidencePoints, setSubsidencePoints] = useState<SubsidencePoint[]>([]);
  const [districts, setDistricts] = useState<PadangDistrict[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPoint, setSelectedPoint] = useState<SubsidencePoint | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -0.9492, lng: 100.3543 });
  const [zoomLevel, setZoomLevel] = useState(11);
  const [riskFilter, setRiskFilter] = useState<string[]>(['low', 'medium', 'high', 'critical']);
  const [showDataType, setShowDataType] = useState<'real' | 'prediction'>('real');

  const [config, setConfig] = useState<PLSTMConfig>({
    layers: 3,
    neurons: 128,
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    parallelRegions: 4,
    sequenceLength: 30,
    dropoutRate: 0.2,
    validationSplit: 0.2
  });

  const [trainingSteps, setTrainingSteps] = useState<TrainingStep[]>([
    {
      id: 'data-loading',
      title: 'Loading Data dari Folder datapdg',
      description: 'Membaca data penurunan tanah Padang 2021-2024',
      status: 'pending',
      progress: 0
    },
    {
      id: 'data-cleaning',
      title: 'Data Cleaning & Preprocessing',
      description: 'Membersihkan dan memproses data mentah',
      status: 'pending',
      progress: 0
    },
    {
      id: 'feature-engineering',
      title: 'Feature Engineering',
      description: 'Membuat fitur tambahan untuk model',
      status: 'pending',
      progress: 0
    },
    {
      id: 'sequence-preparation',
      title: 'Sequence Preparation',
      description: 'Menyiapkan sequence untuk LSTM',
      status: 'pending',
      progress: 0
    },
    {
      id: 'model-architecture',
      title: 'PLSTM Architecture Setup',
      description: 'Inisialisasi arsitektur model PLSTM',
      status: 'pending',
      progress: 0
    },
    {
      id: 'model-training',
      title: 'Model Training',
      description: 'Training PLSTM dengan data time-series',
      status: 'pending',
      progress: 0
    },
    {
      id: 'model-evaluation',
      title: 'Model Evaluation',
      description: 'Evaluasi performa model dan metrik',
      status: 'pending',
      progress: 0
    }
  ]);

  const phases = [
    'Load Data',
    'Preview & Variable Selection',
    'Model Training',
    'Model Evaluation & Real-time Prediction'
  ];

  // Generate mock subsidence data for Padang
  useEffect(() => {
    const generatePadangPoints = () => {
      const points: SubsidencePoint[] = [];
      const padangDistricts = getPadangDistricts();
      setDistricts(padangDistricts);
      
      padangDistricts.forEach((district, districtIndex) => {
        const pointCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < pointCount; i++) {
          const latOffset = (Math.random() - 0.5) * 0.02;
          const lngOffset = (Math.random() - 0.5) * 0.02;
          
          // Generate different subsidence for each year
          const baseSubsidence = district.subsidenceRate;
          const yearlyData = [2021, 2022, 2023, 2024].map(year => ({
            year,
            subsidence: baseSubsidence * (year - 2020) + (Math.random() - 0.5) * 0.005,
            prediction: baseSubsidence * (year - 2019) + (Math.random() - 0.5) * 0.003
          }));
          
          const currentData = yearlyData.find(d => d.year === selectedYear) || yearlyData[3];
          const subsidence = showDataType === 'real' ? currentData.subsidence : currentData.prediction;
          const yearlyRate = Math.abs(subsidence);
          
          let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (yearlyRate > 0.03) riskLevel = 'critical';
          else if (yearlyRate > 0.02) riskLevel = 'high';
          else if (yearlyRate > 0.015) riskLevel = 'medium';

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
            lastUpdate: new Date(selectedYear, 11, 31).toISOString(),
            confidence: 0.7 + Math.random() * 0.25,
            historicalData: yearlyData.map(d => ({ year: d.year, subsidence: d.subsidence })),
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
  }, [selectedYear, showDataType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const preview = await loadPadangData();
      setDataPreview(preview);
      setCurrentPhase(1);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomFileUpload = (files: File[], contents: string[]) => {
    // Process custom uploaded files
    console.log('Custom files uploaded:', files);
    // Simulate processing and create preview
    setTimeout(() => {
      loadData();
    }, 1000);
  };

  const updateTrainingStep = (stepId: string, update: Partial<TrainingStep>) => {
    setTrainingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...update } : step
    ));
  };

  const handleVariableSelection = (selection: VariableSelection) => {
    setSelectedVariables(selection);
  };

  const handleProceedToModeling = () => {
    setCurrentPhase(2);
  };

  const handleTrainingComplete = (metrics: ModelMetrics) => {
    setModelMetrics(metrics);
    const model = new PLSTMModel(config);
    setTrainedModel(model);
    setCurrentPhase(3);
    
    // Start real-time prediction after training
    setTimeout(() => {
      setIsRealTimePrediction(true);
    }, 1000);
  };

  const downloadModel = () => {
    if (!trainedModel) return;
    
    const modelBlob = trainedModel.exportModel();
    const url = URL.createObjectURL(modelBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plstm_padang_model_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadData = () => {
    if (!dataPreview) return;
    
    const allData = dataPreview.yearlyData.flatMap(y => y.data);
    const csvContent = [
      'timestamp,easting,northing,height,subsidence,yearlySubsidence,velocity,acceleration,temperature,precipitation,groundwaterLevel',
      ...allData.map(row => 
        `${row.timestamp},${row.easting},${row.northing},${row.height},${row.subsidence},${row.yearlySubsidence},${row.velocity},${row.acceleration},${row.temperature || ''},${row.precipitation || ''},${row.groundwaterLevel || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `padang_subsidence_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  const resetMapView = () => {
    setMapCenter({ lat: -0.9492, lng: 100.3543 });
    setZoomLevel(11);
    setSelectedPoint(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Analisis Penurunan Tanah Kota Padang
          </h1>
          <p className="text-xl text-gray-300">
            Sistem prediksi penurunan tanah menggunakan model PLSTM dengan data 2021-2024
          </p>
        </div>

        {/* Phase Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {phases.map((phase, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 ${
                  index <= currentPhase ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <= currentPhase
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-medium">{phase}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentPhase + 1) / phases.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Phase 0: Load Data */}
        {currentPhase === 0 && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
              <Database className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Load Data Penurunan Tanah Padang
              </h3>
              
              {/* Data Source Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={() => setUseCustomData(false)}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                      !useCustomData 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Gunakan Data Default (datapdg)
                  </button>
                  <button
                    onClick={() => setUseCustomData(true)}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                      useCustomData 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Upload Data Custom
                  </button>
                </div>
              </div>

              {!useCustomData ? (
                <>
                  <p className="text-gray-300 mb-6">
                    Sistem akan membaca data dari folder 'datapdg' yang berisi data penurunan tanah 
                    Kota Padang dari tahun 2021-2024 yang terbagi dalam folder per tahun.
                  </p>
                  
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 mb-6">
                    <h4 className="text-green-400 font-medium mb-2">Struktur Data yang Akan Dibaca:</h4>
                    <div className="text-left text-sm text-gray-300 space-y-1">
                      <div>📁 datapdg/</div>
                      <div className="ml-4">📁 2021/ - Data tahun 2021</div>
                      <div className="ml-4">📁 2022/ - Data tahun 2022</div>
                      <div className="ml-4">📁 2023/ - Data tahun 2023</div>
                      <div className="ml-4">📁 2024/ - Data tahun 2024</div>
                    </div>
                  </div>

                  <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Play className="h-5 w-5" />
                    <span>{isLoading ? 'Loading Data...' : 'Mulai Load Data'}</span>
                  </button>
                </>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <FileUpload
                    onFileUpload={handleCustomFileUpload}
                    title="Upload Data Penurunan Tanah"
                    description="Upload file data RINEX, CSV, atau Excel untuk analisis penurunan tanah"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 1: Data Preview & Variable Selection */}
        {currentPhase === 1 && dataPreview && (
          <DataPreviewComponent
            dataPreview={dataPreview}
            onVariableSelection={handleVariableSelection}
            onProceedToModeling={handleProceedToModeling}
          />
        )}

        {/* Phase 2: Model Training */}
        {currentPhase === 2 && (
          <DetailedTraining
            steps={trainingSteps}
            onStepUpdate={updateTrainingStep}
            onTrainingComplete={handleTrainingComplete}
            config={config}
            onConfigChange={setConfig}
            selectedVariables={selectedVariables}
          />
        )}

        {/* Phase 3: Model Evaluation & Real-time Prediction */}
        {currentPhase === 3 && modelMetrics && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Training Model Selesai
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={downloadModel}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Model</span>
                  </button>
                  <button
                    onClick={downloadData}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download Data</span>
                  </button>
                </div>
              </div>
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  Model PLSTM Berhasil Dilatih
                </h4>
                <p className="text-gray-300">
                  Model mencapai akurasi {(modelMetrics.accuracy * 100).toFixed(1)}% 
                  dan siap untuk prediksi penurunan tanah Kota Padang.
                </p>
              </div>
            </div>

            <EvaluationMetrics metrics={modelMetrics} />

            {/* Real-time Prediction and Interactive Map */}
            {isRealTimePrediction && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-green-400" />
                  Peta Interaktif Penurunan Tanah Kota Padang
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Map Controls */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Data Type Toggle */}
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-green-400 font-medium mb-3">Jenis Data</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowDataType('real')}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            showDataType === 'real' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Data Real (Observasi)
                        </button>
                        <button
                          onClick={() => setShowDataType('prediction')}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            showDataType === 'prediction' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Data Prediksi (Model)
                        </button>
                      </div>
                    </div>

                    {/* Year Selection */}
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-green-400 font-medium mb-3">Pilih Tahun</h4>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      >
                        <option value={2021}>2021</option>
                        <option value={2022}>2022</option>
                        <option value={2023}>2023</option>
                        <option value={2024}>2024</option>
                      </select>
                    </div>

                    {/* Risk Filter */}
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-green-400 font-medium mb-3">Filter Risiko</h4>
                      <div className="space-y-2">
                        {[
                          { key: 'low', label: 'Rendah', color: 'green' },
                          { key: 'medium', label: 'Sedang', color: 'yellow' },
                          { key: 'high', label: 'Tinggi', color: 'orange' },
                          { key: 'critical', label: 'Kritis', color: 'red' }
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

                    {/* Map Controls */}
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-green-400 font-medium mb-3">Kontrol Peta</h4>
                      <div className="space-y-2">
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
                          onClick={resetMapView}
                          className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Reset View</span>
                        </button>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-green-400 font-medium mb-3">Statistik</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Titik:</span>
                          <span className="text-white">{subsidencePoints.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">Kritis:</span>
                          <span className="text-white">
                            {subsidencePoints.filter(p => p.riskLevel === 'critical').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-400">Tinggi:</span>
                          <span className="text-white">
                            {subsidencePoints.filter(p => p.riskLevel === 'high').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Display */}
                  <div className="lg:col-span-3">
                    <div className="bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
                      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium">
                            Peta Kota Padang - {showDataType === 'real' ? 'Data Real' : 'Prediksi'} {selectedYear}
                          </h4>
                          <button
                            onClick={resetMapView}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            Reset View
                          </button>
                        </div>
                      </div>

                      {/* Simulated Map */}
                      <div className="relative h-96 bg-gradient-to-br from-blue-900 to-green-900 overflow-hidden">
                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
                            {Array.from({ length: 400 }).map((_, i) => (
                              <div key={i} className="border border-gray-600 border-opacity-30"></div>
                            ))}
                          </div>
                        </div>

                        {/* Monitoring Points */}
                        {filteredPoints.map((point) => {
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
                                    {showDataType === 'real' ? 'Observasi' : 'Prediksi'}: {(point.subsidence * 100).toFixed(1)} cm/tahun
                                  </div>
                                  <div className="text-xs text-gray-300">
                                    Confidence: {(point.confidence * 100).toFixed(1)}%
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 rounded-lg p-3 border border-gray-600">
                          <h5 className="text-white text-sm font-medium mb-2">Tingkat Risiko</h5>
                          <div className="space-y-1">
                            {[
                              { level: 'Rendah', color: 'bg-green-500', range: '&lt; 1.5 cm/tahun' },
                              { level: 'Sedang', color: 'bg-yellow-500', range: '1.5-2.0 cm/tahun' },
                              { level: 'Tinggi', color: 'bg-orange-500', range: '2.0-3.0 cm/tahun' },
                              { level: 'Kritis', color: 'bg-red-500', range: '&gt; 3.0 cm/tahun' }
                            ].map((item) => (
                              <div key={item.level} className="flex items-center space-x-2 text-xs">
                                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                <span className="text-gray-300" dangerouslySetInnerHTML={{ __html: `${item.level}: ${item.range}` }}></span>
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
                      <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">{selectedPoint.stationName}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(selectedPoint.riskLevel)} text-white`}>
                            {selectedPoint.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Kecamatan:</span>
                            <div className="text-white">{selectedPoint.district}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">{showDataType === 'real' ? 'Penurunan Observasi' : 'Prediksi Penurunan'}:</span>
                            <div className={getRiskTextColor(selectedPoint.riskLevel)}>
                              {(selectedPoint.subsidence * 100).toFixed(1)} cm/tahun
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Confidence:</span>
                            <div className="text-white">{(selectedPoint.confidence * 100).toFixed(1)}%</div>
                          </div>
                        </div>

                        {selectedPoint.riskLevel === 'critical' && (
                          <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                              <div>
                                <h5 className="text-red-200 font-medium mb-1">Peringatan Penurunan Kritis</h5>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};