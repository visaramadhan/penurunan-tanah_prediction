import React, { useState, useEffect } from 'react';
import { Upload, Brain, BarChart3, MapPin, Calendar, TrendingDown, Play, Pause, RotateCcw, Filter, Layers, Activity, Eye, Download, Save, Database } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { DataPreviewComponent } from '../components/DataPreview';
import { DetailedTraining } from '../components/DetailedTraining';
import { EvaluationMetrics } from '../components/EvaluationMetrics';
import { GoogleMap } from '../components/GoogleMap';
import { RealTimeCharts } from '../components/RealTimeCharts';
import { ModelSelector } from '../components/ModelSelector';
import { processRinexData, calculateSubsidence, cleanData } from '../utils/dataProcessing';
import { loadPadangData, getPadangDistricts } from '../utils/dataLoader';
import { FirebaseService, SavedModel } from '../services/firebaseService';
import { 
  TrainingStep, 
  PLSTMConfig, 
  ModelMetrics, 
  DataPreview, 
  VariableSelection, 
  ProcessedData,
  SubsidencePoint,
  PadangDistrict,
  PredictionResult
} from '../types';

export const Training: React.FC = () => {
  // Main state management
  const [currentPhase, setCurrentPhase] = useState<'input' | 'preview' | 'training' | 'prediction'>('input');
  const [useDefaultData, setUseDefaultData] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [selectedVariables, setSelectedVariables] = useState<VariableSelection>({
    primary: ['easting', 'northing', 'height'],
    secondary: ['velocity', 'acceleration'],
    environmental: ['temperature', 'precipitation']
  });

  // Training state
  const [config, setConfig] = useState<PLSTMConfig>({
    layers: 3,
    neurons: 128,
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    parallelRegions: 5,
    sequenceLength: 60,
    dropoutRate: 0.2,
    validationSplit: 0.2
  });

  const [steps, setSteps] = useState<TrainingStep[]>([
    {
      id: 'data-loading',
      title: 'Loading Data dari Folder datapdg',
      description: 'Membaca data dari folder 2021-2024',
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
      description: 'Training model dengan data yang telah diproses',
      status: 'pending',
      progress: 0
    },
    {
      id: 'model-evaluation',
      title: 'Model Evaluation',
      description: 'Evaluasi performa model dan kalkulasi metrik',
      status: 'pending',
      progress: 0
    }
  ]);

  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  // Prediction and map state
  const [isRealTimePrediction, setIsRealTimePrediction] = useState(false);
  const [subsidencePoints, setSubsidencePoints] = useState<SubsidencePoint[]>([]);
  const [districts, setDistricts] = useState<PadangDistrict[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPoint, setSelectedPoint] = useState<SubsidencePoint | null>(null);
  const [riskFilter, setRiskFilter] = useState<string[]>(['low', 'medium', 'high', 'critical']);
  const [showDataType, setShowDataType] = useState<'real' | 'prediction'>('real');
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);

  // Model management state
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<SavedModel | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');

  // Load saved models on component mount
  useEffect(() => {
    loadSavedModels();
    loadDistricts();
  }, []);

  const loadSavedModels = async () => {
    try {
      const models = await FirebaseService.getModels();
      setSavedModels(models);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadDistricts = () => {
    const padangDistricts = getPadangDistricts();
    setDistricts(padangDistricts);
  };

  // Generate mock subsidence data for Padang
  useEffect(() => {
    const generatePadangPoints = () => {
      const points: SubsidencePoint[] = [];
      
      districts.forEach((district, districtIndex) => {
        const pointCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < pointCount; i++) {
          const latOffset = (Math.random() - 0.5) * 0.02;
          const lngOffset = (Math.random() - 0.5) * 0.02;
          
          // Generate different subsidence for each year including predictions
          const baseSubsidence = district.subsidenceRate;
          const yearlyData = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => ({
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

    if (districts.length > 0) {
      generatePadangPoints();
    }
  }, [selectedYear, showDataType, districts]);

  const handleFileUpload = async (files: File[], contents: string[]) => {
    setUploadedFiles(files);
    
    // Process uploaded files
    const allData: ProcessedData[] = [];
    contents.forEach(content => {
      const rinexData = processRinexData(content);
      const processedData = calculateSubsidence(rinexData);
      const cleanedData = cleanData(processedData);
      allData.push(...cleanedData);
    });

    // Create data preview
    const preview: DataPreview = {
      totalRecords: allData.length,
      dateRange: {
        start: allData[0]?.timestamp || '2021-01-01',
        end: allData[allData.length - 1]?.timestamp || '2024-12-31'
      },
      yearlyData: [
        { year: 2021, data: allData.filter(d => new Date(d.timestamp).getFullYear() === 2021), quality: 0.9, completeness: 0.95, stationCount: 15 },
        { year: 2022, data: allData.filter(d => new Date(d.timestamp).getFullYear() === 2022), quality: 0.88, completeness: 0.92, stationCount: 18 },
        { year: 2023, data: allData.filter(d => new Date(d.timestamp).getFullYear() === 2023), quality: 0.91, completeness: 0.94, stationCount: 20 },
        { year: 2024, data: allData.filter(d => new Date(d.timestamp).getFullYear() === 2024), quality: 0.89, completeness: 0.91, stationCount: 22 }
      ],
      availableVariables: ['easting', 'northing', 'height', 'subsidence', 'velocity', 'acceleration'],
      spatialCoverage: {
        minEasting: Math.min(...allData.map(d => d.easting)),
        maxEasting: Math.max(...allData.map(d => d.easting)),
        minNorthing: Math.min(...allData.map(d => d.northing)),
        maxNorthing: Math.max(...allData.map(d => d.northing))
      },
      dataQuality: {
        completeness: 0.93,
        consistency: 0.89,
        accuracy: 0.91
      }
    };

    setDataPreview(preview);
    setCurrentPhase('preview');
  };

  const handleUseDefaultData = async () => {
    try {
      const preview = await loadPadangData();
      setDataPreview(preview);
      setCurrentPhase('preview');
    } catch (error) {
      console.error('Error loading default data:', error);
    }
  };

  const handleStepUpdate = (stepId: string, update: Partial<TrainingStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...update } : step
    ));
  };

  const handleTrainingComplete = async (finalMetrics: ModelMetrics) => {
    setMetrics(finalMetrics);
    setIsTraining(false);
    
    // Generate predictions
    const mockPredictions: PredictionResult[] = subsidencePoints.map(point => ({
      timestamp: new Date().toISOString(),
      actualSubsidence: point.subsidence,
      predictedSubsidence: point.subsidence + (Math.random() - 0.5) * 0.01,
      confidence: point.confidence,
      riskLevel: point.riskLevel,
      location: {
        easting: point.easting,
        northing: point.northing,
        district: point.district
      }
    }));
    
    setPredictions(mockPredictions);
    
    // Start real-time prediction
    setTimeout(() => {
      setIsRealTimePrediction(true);
      setCurrentPhase('prediction');
    }, 1000);
  };

  const handleSaveModel = async () => {
    if (!metrics || !modelName.trim()) {
      alert('Please provide a model name and ensure training is completed');
      return;
    }

    try {
      const modelId = await FirebaseService.saveModel(
        modelName,
        modelDescription,
        config,
        selectedVariables,
        metrics,
        dataPreview?.dateRange || { start: '2021-01-01', end: '2024-12-31' },
        dataPreview?.totalRecords || 0
      );

      // Save predictions
      if (predictions.length > 0) {
        await FirebaseService.savePredictions(
          modelId,
          modelName,
          predictions,
          { start: '2021-01-01', end: '2030-12-31' }
        );
      }

      alert('Model saved successfully!');
      await loadSavedModels();
      setModelName('');
      setModelDescription('');
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Error saving model');
    }
  };

  const handleModelSelect = (model: SavedModel) => {
    setSelectedModel(model);
    setConfig(model.config);
    setSelectedVariables(model.variables);
    setMetrics(model.metrics);
    setShowModelSelector(false);
  };

  const handlePointClick = (point: SubsidencePoint) => {
    setSelectedPoint(point);
  };

  const toggleRiskFilter = (risk: string) => {
    setRiskFilter(prev => 
      prev.includes(risk) 
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    );
  };

  const filteredPoints = subsidencePoints.filter(point => 
    riskFilter.includes(point.riskLevel)
  );

  const renderPhase = () => {
    switch (currentPhase) {
      case 'input':
        return (
          <div className="space-y-6">
            {/* Model Selection */}
            {savedModels.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Pilih Model atau Buat Baru</h3>
                  <button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Database className="h-4 w-4" />
                    <span>Gunakan Model Tersimpan</span>
                  </button>
                </div>
                
                {showModelSelector && (
                  <ModelSelector
                    onModelSelect={handleModelSelect}
                    onCreateNew={() => setShowModelSelector(false)}
                    selectedModel={selectedModel}
                  />
                )}
              </div>
            )}

            {/* Data Input Options */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Pilih Sumber Data</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  useDefaultData ? 'border-green-600 bg-green-900 bg-opacity-20' : 'border-gray-600 hover:border-gray-500'
                }`} onClick={() => setUseDefaultData(true)}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Database className="h-6 w-6 text-green-400" />
                    <h4 className="text-lg font-medium text-white">Data Default (datapdg)</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Gunakan dataset default Kota Padang 2021-2024 yang sudah tersedia
                  </p>
                  <div className="text-green-400 text-sm">
                    ✓ Data sudah tervalidasi dan siap digunakan
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  !useDefaultData ? 'border-green-600 bg-green-900 bg-opacity-20' : 'border-gray-600 hover:border-gray-500'
                }`} onClick={() => setUseDefaultData(false)}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Upload className="h-6 w-6 text-blue-400" />
                    <h4 className="text-lg font-medium text-white">Upload Data Custom</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Upload file RINEX, CSV, atau Excel dengan data koordinat sendiri
                  </p>
                  <div className="text-blue-400 text-sm">
                    ✓ Fleksibilitas untuk data dari sumber lain
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {useDefaultData ? (
                  <button
                    onClick={handleUseDefaultData}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Gunakan Data Default Padang
                  </button>
                ) : (
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    title="Upload Data RINEX/CSV"
                    description="Upload file data koordinat untuk analisis penurunan tanah"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'preview':
        return dataPreview && (
          <DataPreviewComponent
            dataPreview={dataPreview}
            onVariableSelection={setSelectedVariables}
            onProceedToModeling={() => setCurrentPhase('training')}
          />
        );

      case 'training':
        return (
          <div className="space-y-6">
            <DetailedTraining
              steps={steps}
              onStepUpdate={handleStepUpdate}
              onTrainingComplete={handleTrainingComplete}
              config={config}
              onConfigChange={setConfig}
              selectedVariables={selectedVariables}
            />

            {metrics && (
              <div className="space-y-6">
                <EvaluationMetrics metrics={metrics} />
                
                {/* Save Model Section */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Save className="h-6 w-6 mr-2 text-green-400" />
                    Simpan Model
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nama Model
                      </label>
                      <input
                        type="text"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="e.g., PLSTM Padang v1.0"
                        className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Deskripsi Model
                      </label>
                      <input
                        type="text"
                        value={modelDescription}
                        onChange={(e) => setModelDescription(e.target.value)}
                        placeholder="Deskripsi singkat tentang model ini"
                        className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveModel}
                    disabled={!modelName.trim()}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Simpan Model ke Firebase
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'prediction':
        return (
          <div className="space-y-6">
            {/* Real-time Charts */}
            <RealTimeCharts
              selectedYear={selectedYear}
              showDataType={showDataType}
            />

            {/* Interactive Map */}
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
                      <option value={2025}>2025 (Prediksi)</option>
                      <option value={2026}>2026 (Prediksi)</option>
                      <option value={2027}>2027 (Prediksi)</option>
                      <option value={2028}>2028 (Prediksi)</option>
                      <option value={2029}>2029 (Prediksi)</option>
                      <option value={2030}>2030 (Prediksi)</option>
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

                {/* Google Map */}
                <div className="lg:col-span-3">
                  <GoogleMap
                    subsidencePoints={filteredPoints}
                    districts={districts}
                    selectedPoint={selectedPoint}
                    onPointClick={handlePointClick}
                    showDataType={showDataType}
                    selectedYear={selectedYear}
                    riskFilter={riskFilter}
                  />

                  {/* Selected Point Details */}
                  {selectedPoint && (
                    <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{selectedPoint.stationName}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedPoint.riskLevel === 'critical' ? 'bg-red-500 text-white' :
                          selectedPoint.riskLevel === 'high' ? 'bg-orange-500 text-white' :
                          selectedPoint.riskLevel === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
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
                          <div className={`${
                            selectedPoint.riskLevel === 'critical' ? 'text-red-400' :
                            selectedPoint.riskLevel === 'high' ? 'text-orange-400' :
                            selectedPoint.riskLevel === 'medium' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {(selectedPoint.subsidence * 100).toFixed(1)} cm/tahun
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Confidence:</span>
                          <div className="text-white">{(selectedPoint.confidence * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Training & Prediksi Model PLSTM
          </h1>
          <p className="text-xl text-gray-300">
            Sistem prediksi penurunan tanah Kota Padang menggunakan Parallel Long Short-Term Memory
          </p>
        </div>

        {/* Phase Navigation */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
            {[
              { key: 'input', label: 'Input Data', icon: Upload },
              { key: 'preview', label: 'Preview & Variabel', icon: Eye },
              { key: 'training', label: 'Training Model', icon: Brain },
              { key: 'prediction', label: 'Prediksi & Map', icon: MapPin }
            ].map((phase, index) => (
              <div key={phase.key} className="flex items-center">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  currentPhase === phase.key 
                    ? 'bg-green-600 text-white' 
                    : index < ['input', 'preview', 'training', 'prediction'].indexOf(currentPhase)
                    ? 'bg-green-800 text-green-300'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  <phase.icon className="h-5 w-5" />
                  <span className="font-medium">{phase.label}</span>
                </div>
                {index < 3 && (
                  <div className="mx-2 text-gray-600">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {renderPhase()}
      </div>
    </div>
  );
};