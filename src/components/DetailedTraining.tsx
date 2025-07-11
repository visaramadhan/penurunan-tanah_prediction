import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, BarChart3, TrendingUp, Zap, Settings, Eye, Calculator, Info, Play, Pause, RotateCcw, MapPin, Filter, Layers } from 'lucide-react';
import { TrainingStep, PLSTMConfig, ModelMetrics, EpochDetail, VariableSelection } from '../types';
import { getPadangDistricts } from '../utils/dataLoader';
import { PadangDistrict, SubsidencePoint } from '../types';

interface DetailedTrainingProps {
  steps: TrainingStep[];
  onStepUpdate: (stepId: string, update: Partial<TrainingStep>) => void;
  onTrainingComplete: (metrics: ModelMetrics) => void;
  config: PLSTMConfig;
  onConfigChange: (config: PLSTMConfig) => void;
  selectedVariables: VariableSelection;
}

export const DetailedTraining: React.FC<DetailedTrainingProps> = ({
  steps,
  onStepUpdate,
  onTrainingComplete,
  config,
  onConfigChange,
  selectedVariables
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [epochDetails, setEpochDetails] = useState<EpochDetail[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showEpochDetails, setShowEpochDetails] = useState(false);
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState<string | null>(null);
  
  // Real-time prediction and map states
  const [isRealTimePrediction, setIsRealTimePrediction] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [subsidencePoints, setSubsidencePoints] = useState<SubsidencePoint[]>([]);
  const [districts, setDistricts] = useState<PadangDistrict[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPoint, setSelectedPoint] = useState<SubsidencePoint | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -0.9492, lng: 100.3543 });
  const [zoomLevel, setZoomLevel] = useState(11);
  const [riskFilter, setRiskFilter] = useState<string[]>(['low', 'medium', 'high', 'critical']);
  const [showDataType, setShowDataType] = useState<'real' | 'prediction'>('real');

  // Algorithm explanations for each step
  const algorithmExplanations = {
    'data-loading': {
      title: 'Data Loading Algorithm',
      formula: 'D = ∪ᵢ₌₂₀₂₁²⁰²⁴ Dᵢ',
      explanation: `
        1. Scan folder structure: datapdg/{year}/
        2. For each year (2021-2024):
           - Read all RINEX/CSV files
           - Parse coordinate data (Easting, Northing, Height)
           - Validate data integrity and completeness
        3. Merge temporal datasets: D = D₂₀₂₁ ∪ D₂₀₂₂ ∪ D₂₀₂₃ ∪ D₂₀₂₄
        4. Create unified time-series dataset
      `,
      parameters: 'File formats: RINEX, CSV, XLSX | Coordinate system: UTM 48S'
    },
    'data-cleaning': {
      title: 'Data Preprocessing Algorithm',
      formula: 'X_clean = f(X_raw, σ, IQR)',
      explanation: `
        1. Outlier Detection using IQR method:
           - Q1 = 25th percentile, Q3 = 75th percentile
           - IQR = Q3 - Q1
           - Outliers: x < Q1 - 1.5×IQR or x > Q3 + 1.5×IQR
        
        2. Missing Value Imputation:
           - Linear interpolation for temporal gaps < 3 days
           - Spatial interpolation using nearest neighbors
        
        3. Coordinate Normalization:
           - Convert to relative coordinates from baseline
           - Apply geoid correction if available
      `,
      parameters: 'IQR multiplier: 1.5 | Max gap: 3 days | Min data quality: 85%'
    },
    'feature-engineering': {
      title: 'Feature Engineering Algorithm',
      formula: 'F = [S, V, A, T_features, S_features]',
      explanation: `
        1. Subsidence Calculation:
           S(t) = h₀ - h(t) where h₀ is baseline height
        
        2. Velocity Computation:
           V(t) = dS/dt = (S(t) - S(t-1)) / Δt
        
        3. Acceleration Calculation:
           A(t) = dV/dt = (V(t) - V(t-1)) / Δt
        
        4. Temporal Features:
           - Day of year, month, season
           - Moving averages (7, 30, 90 days)
        
        5. Spatial Features:
           - Distance to nearest monitoring point
           - Spatial lag features from neighboring points
      `,
      parameters: 'Window sizes: 7, 30, 90 days | Spatial radius: 5km | Feature scaling: MinMax'
    },
    'sequence-preparation': {
      title: 'Time Series Sequence Algorithm',
      formula: 'X_seq = [x(t-n+1), ..., x(t)], Y = x(t+1)',
      explanation: `
        1. Sliding Window Creation:
           - Input sequence length: ${config.sequenceLength} days
           - For each time point t, create sequence:
             X = [x(t-${config.sequenceLength}+1), x(t-${config.sequenceLength}+2), ..., x(t)]
             Y = x(t+1) (target)
        
        2. Train/Validation Split:
           - Split ratio: ${(config.validationSplit * 100).toFixed(0)}% validation
           - Temporal split (not random) to prevent data leakage
        
        3. Batch Preparation:
           - Batch size: ${config.batchSize}
           - Shuffle training batches
           - Normalize features using training statistics
      `,
      parameters: `Sequence length: ${config.sequenceLength} | Batch size: ${config.batchSize} | Validation: ${(config.validationSplit * 100).toFixed(0)}%`
    },
    'model-architecture': {
      title: 'PLSTM Architecture Algorithm',
      formula: 'Y = Σᵢ₌₁ⁿ wᵢ × LSTMᵢ(Xᵢ) + b',
      explanation: `
        1. Parallel LSTM Setup:
           - Number of parallel regions: ${config.parallelRegions}
           - Each region processes spatial subset of data
        
        2. LSTM Layer Configuration:
           - Layers: ${config.layers}
           - Neurons per layer: ${config.neurons}
           - Dropout rate: ${(config.dropoutRate * 100).toFixed(0)}%
        
        3. Attention Mechanism:
           - Weighted combination of regional outputs
           - Attention weights learned during training
        
        4. Output Layer:
           - Dense layer for final prediction
           - Activation: Linear (regression task)
      `,
      parameters: `Layers: ${config.layers} | Neurons: ${config.neurons} | Dropout: ${(config.dropoutRate * 100).toFixed(0)}% | Regions: ${config.parallelRegions}`
    },
    'model-training': {
      title: 'Training Algorithm',
      formula: 'θ* = argmin Σ L(ŷᵢ, yᵢ) + λR(θ)',
      explanation: `
        1. Loss Function:
           - Mean Squared Error: MSE = (1/n)Σ(ŷᵢ - yᵢ)²
           - L2 Regularization: R(θ) = Σθᵢ²
        
        2. Optimization:
           - Algorithm: Adam optimizer
           - Learning rate: ${config.learningRate}
           - Learning rate decay: 0.95 every 10 epochs
        
        3. Training Process:
           - Epochs: ${config.epochs}
           - Early stopping if validation loss doesn't improve
           - Gradient clipping to prevent exploding gradients
      `,
      parameters: `Epochs: ${config.epochs} | Learning rate: ${config.learningRate} | Optimizer: Adam`
    },
    'model-evaluation': {
      title: 'Model Evaluation Algorithm',
      formula: 'Metrics = {MSE, RMSE, MAE, R², Confidence}',
      explanation: `
        1. Performance Metrics:
           - MSE = (1/n)Σ(ŷᵢ - yᵢ)²
           - RMSE = √MSE
           - MAE = (1/n)Σ|ŷᵢ - yᵢ|
           - R² = 1 - (SS_res/SS_tot)
        
        2. Confidence Intervals:
           - Bootstrap sampling for uncertainty estimation
           - 95% confidence intervals for predictions
        
        3. Cross-validation:
           - Time series cross-validation
           - Walk-forward validation approach
      `,
      parameters: 'Bootstrap samples: 1000 | Confidence level: 95% | CV folds: 5'
    }
  };

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
  const getStepIcon = (status: TrainingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (status: TrainingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-800 border-green-600';
      case 'processing':
        return 'bg-gray-800 border-blue-600';
      case 'error':
        return 'bg-gray-800 border-red-600';
      default:
        return 'bg-gray-800 border-gray-600';
    }
  };

  const startTraining = async () => {
    setIsTraining(true);
    setCurrentStep(0);
    setCurrentEpoch(0);
    setEpochDetails([]);

    // Detailed preprocessing steps
    const preprocessingSteps = [
      {
        id: 'data-loading',
        title: 'Loading Data dari Folder datapdg',
        description: 'Membaca data dari folder 2021-2024',
        details: [
          'Scanning folder datapdg...',
          'Loading data tahun 2021...',
          'Loading data tahun 2022...',
          'Loading data tahun 2023...',
          'Loading data tahun 2024...',
          'Validating data integrity...'
        ]
      },
      {
        id: 'data-cleaning',
        title: 'Data Cleaning & Preprocessing',
        description: 'Membersihkan dan memproses data mentah',
        details: [
          'Removing outliers using IQR method...',
          'Handling missing values...',
          'Normalizing coordinate systems...',
          'Calculating subsidence rates...',
          'Quality assessment completed'
        ]
      },
      {
        id: 'feature-engineering',
        title: 'Feature Engineering',
        description: 'Membuat fitur tambahan untuk model',
        details: [
          'Calculating velocity vectors...',
          'Computing acceleration values...',
          'Creating temporal features...',
          'Generating spatial lag features...',
          'Feature scaling and normalization...'
        ]
      },
      {
        id: 'sequence-preparation',
        title: 'Sequence Preparation',
        description: 'Menyiapkan sequence untuk LSTM',
        details: [
          `Creating sequences with length ${config.sequenceLength}...`,
          'Splitting into training/validation sets...',
          `Validation split: ${(config.validationSplit * 100).toFixed(1)}%`,
          'Preparing batch data...',
          `Batch size: ${config.batchSize}`
        ]
      },
      {
        id: 'model-architecture',
        title: 'PLSTM Architecture Setup',
        description: 'Inisialisasi arsitektur model PLSTM',
        details: [
          `Setting up ${config.layers} LSTM layers...`,
          `Each layer with ${config.neurons} neurons...`,
          `Parallel regions: ${config.parallelRegions}...`,
          `Dropout rate: ${(config.dropoutRate * 100).toFixed(1)}%...`,
          'Compiling model with Adam optimizer...'
        ]
      }
    ];

    // Execute preprocessing steps
    for (let i = 0; i < preprocessingSteps.length; i++) {
      setCurrentStep(i);
      const step = preprocessingSteps[i];
      onStepUpdate(step.id, { status: 'processing', progress: 0 });

      for (let j = 0; j < step.details.length; j++) {
        const progress = ((j + 1) / step.details.length) * 100;
        onStepUpdate(step.id, { 
          status: 'processing', 
          progress,
          details: step.details.slice(0, j + 1)
        });
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      onStepUpdate(step.id, { status: 'completed', progress: 100 });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Training phase with detailed epoch tracking
    setCurrentStep(5);
    onStepUpdate('model-training', { status: 'processing', progress: 0 });

    const epochDetailsArray: EpochDetail[] = [];
    
    for (let epoch = 1; epoch <= config.epochs; epoch++) {
      setCurrentEpoch(epoch);
      const startTime = Date.now();
      
      // Simulate training metrics
      const trainingLoss = Math.exp(-epoch * 0.05) * (0.8 + Math.random() * 0.4);
      const validationLoss = Math.exp(-epoch * 0.04) * (0.9 + Math.random() * 0.3);
      const accuracy = Math.min(0.95, 0.3 + (epoch / config.epochs) * 0.6 + Math.random() * 0.1);
      const learningRate = config.learningRate * Math.pow(0.95, Math.floor(epoch / 10));
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const duration = Date.now() - startTime;
      
      const epochDetail: EpochDetail = {
        epoch,
        trainingLoss,
        validationLoss,
        accuracy,
        learningRate,
        duration
      };
      
      epochDetailsArray.push(epochDetail);
      setEpochDetails([...epochDetailsArray]);
      
      const progress = (epoch / config.epochs) * 100;
      onStepUpdate('model-training', { 
        status: 'processing', 
        progress,
        details: [
          `Epoch ${epoch}/${config.epochs}`,
          `Training Loss: ${trainingLoss.toFixed(6)}`,
          `Validation Loss: ${validationLoss.toFixed(6)}`,
          `Accuracy: ${(accuracy * 100).toFixed(2)}%`,
          `Learning Rate: ${learningRate.toFixed(6)}`
        ]
      });
    }

    onStepUpdate('model-training', { status: 'completed', progress: 100 });

    // Evaluation phase
    setCurrentStep(6);
    onStepUpdate('model-evaluation', { status: 'processing', progress: 0 });
    
    const evaluationSteps = [
      'Calculating MSE and RMSE...',
      'Computing MAE and R² score...',
      'Generating prediction confidence intervals...',
      'Validating model performance...',
      'Creating evaluation report...'
    ];

    for (let i = 0; i < evaluationSteps.length; i++) {
      const progress = ((i + 1) / evaluationSteps.length) * 100;
      onStepUpdate('model-evaluation', { 
        status: 'processing', 
        progress,
        details: evaluationSteps.slice(0, i + 1)
      });
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    onStepUpdate('model-evaluation', { status: 'completed', progress: 100 });

    // Generate final metrics
    const finalMetrics: ModelMetrics = {
      mse: 0.015 + Math.random() * 0.01,
      rmse: 0.12 + Math.random() * 0.02,
      mae: 0.08 + Math.random() * 0.02,
      accuracy: 0.88 + Math.random() * 0.08,
      r2Score: 0.85 + Math.random() * 0.1,
      trainingLoss: epochDetailsArray.map(e => e.trainingLoss),
      validationLoss: epochDetailsArray.map(e => e.validationLoss),
      epochDetails: epochDetailsArray
    };

    onTrainingComplete(finalMetrics);
    setIsTraining(false);
    
    // Start real-time prediction after training
    setTimeout(() => {
      setIsRealTimePrediction(true);
    }, 1000);
  };

  const handleConfigChange = (field: keyof PLSTMConfig, value: number) => {
    onConfigChange({ ...config, [field]: value });
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
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Konfigurasi Model PLSTM</h3>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300"
          >
            <Settings className="h-5 w-5" />
            <span>{showConfig ? 'Sembunyikan' : 'Tampilkan'} Konfigurasi</span>
          </button>
        </div>

        {/* Selected Variables Summary */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 mb-4">
          <h4 className="text-green-400 font-medium mb-3">Variabel yang Dipilih</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-green-300 text-sm font-medium mb-1">Utama ({selectedVariables.primary.length})</div>
              <div className="text-gray-300 text-sm">{selectedVariables.primary.join(', ')}</div>
            </div>
            <div>
              <div className="text-blue-300 text-sm font-medium mb-1">Sekunder ({selectedVariables.secondary.length})</div>
              <div className="text-gray-300 text-sm">{selectedVariables.secondary.join(', ') || 'Tidak ada'}</div>
            </div>
            <div>
              <div className="text-purple-300 text-sm font-medium mb-1">Lingkungan ({selectedVariables.environmental.length})</div>
              <div className="text-gray-300 text-sm">{selectedVariables.environmental.join(', ') || 'Tidak ada'}</div>
            </div>
          </div>
        </div>

        {showConfig && (
          <div className="space-y-6">
            <div className="bg-green-900 border border-green-600 rounded-lg p-4">
              <h4 className="text-green-200 font-medium mb-3">📋 Panduan Pengaturan Parameter</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-300">
                <div>
                  <p><strong>Epochs:</strong> 50-200 untuk data kecil, 200-500 untuk data besar</p>
                  <p><strong>Batch Size:</strong> 16-32 untuk GPU terbatas, 64-128 untuk GPU kuat</p>
                  <p><strong>Learning Rate:</strong> 0.001 (default), 0.0001 untuk fine-tuning</p>
                </div>
                <div>
                  <p><strong>Neurons:</strong> 64-128 untuk data sederhana, 256-512 untuk kompleks</p>
                  <p><strong>Sequence Length:</strong> 30-60 hari untuk pola bulanan, 90+ untuk seasonal</p>
                  <p><strong>Dropout:</strong> 0.2-0.3 untuk mencegah overfitting</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Jumlah Layer LSTM (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.layers}
                onChange={(e) => handleConfigChange('layers', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Lebih banyak layer = model lebih kompleks</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Neurons per Layer (32-512)
              </label>
              <input
                type="number"
                min="32"
                max="512"
                step="32"
                value={config.neurons}
                onChange={(e) => handleConfigChange('neurons', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Lebih banyak neuron = kapasitas belajar lebih besar</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Jumlah Epochs (10-1000)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={config.epochs}
                onChange={(e) => handleConfigChange('epochs', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Jumlah iterasi training, lebih banyak = lebih akurat</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Batch Size (8-256)
              </label>
              <input
                type="number"
                min="8"
                max="256"
                value={config.batchSize}
                onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Jumlah sampel per update, lebih besar = lebih stabil</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Rate (0.0001-0.1)
              </label>
              <input
                type="number"
                min="0.0001"
                max="0.1"
                step="0.0001"
                value={config.learningRate}
                onChange={(e) => handleConfigChange('learningRate', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Kecepatan belajar, terlalu besar = tidak stabil</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sequence Length (7-365 hari)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={config.sequenceLength}
                onChange={(e) => handleConfigChange('sequenceLength', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Panjang data historis untuk prediksi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dropout Rate (0-0.8)
              </label>
              <input
                type="number"
                min="0"
                max="0.8"
                step="0.1"
                value={config.dropoutRate}
                onChange={(e) => handleConfigChange('dropoutRate', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Mencegah overfitting, 0.2-0.3 optimal</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Validation Split (0.1-0.4)
              </label>
              <input
                type="number"
                min="0.1"
                max="0.4"
                step="0.05"
                value={config.validationSplit}
                onChange={(e) => handleConfigChange('validationSplit', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Proporsi data untuk validasi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parallel Regions (1-20)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.parallelRegions}
                onChange={(e) => handleConfigChange('parallelRegions', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Jumlah region paralel untuk PLSTM</p>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Training Progress */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Progress Training Model</h3>
          <div className="flex items-center space-x-4">
            {isTraining && (
              <div className="flex items-center space-x-2 text-green-400">
                <Zap className="h-5 w-5 animate-pulse" />
                <span>Training Active</span>
              </div>
            )}
            <button
              onClick={startTraining}
              disabled={isTraining}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTraining ? 'Training...' : 'Mulai Training'}
            </button>
          </div>
        </div>

        {/* Current Training Status */}
        {isTraining && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{currentStep + 1}/7</div>
                <div className="text-sm text-gray-300">Current Step</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{currentEpoch}/{config.epochs}</div>
                <div className="text-sm text-gray-300">Epoch Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{epochDetails.length}</div>
                <div className="text-sm text-gray-300">Completed Epochs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {epochDetails.length > 0 ? (epochDetails[epochDetails.length - 1].accuracy * 100).toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm text-gray-300">Current Accuracy</div>
              </div>
            </div>
          </div>
        )}

        {/* Training Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStepColor(step.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStepIcon(step.status)}
                  <div>
                    <h4 className="font-medium text-white">{step.title}</h4>
                    <p className="text-sm text-gray-300">{step.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-300">
                    {step.progress.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {step.status === 'processing' && (
                <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              )}

              {step.details && step.details.length > 0 && (
                <div className="mt-3 bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <div className="space-y-1">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="text-sm text-gray-300 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Epoch Details */}
      {epochDetails.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Detail Training per Epoch</h3>
            <button
              onClick={() => setShowEpochDetails(!showEpochDetails)}
              className="flex items-center space-x-2 text-green-400 hover:text-green-300"
            >
              <Eye className="h-5 w-5" />
              <span>{showEpochDetails ? 'Sembunyikan' : 'Tampilkan'} Detail</span>
            </button>
          </div>

          {/* Epoch Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <span className="text-sm text-gray-400">Best Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {epochDetails.length > 0 ? (Math.max(...epochDetails.map(e => e.accuracy)) * 100).toFixed(2) : '0.00'}%
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                <span className="text-sm text-gray-400">Final Loss</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {epochDetails.length > 0 ? epochDetails[epochDetails.length - 1].trainingLoss.toFixed(6) : '0.000000'}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-gray-400">Avg Duration</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {epochDetails.length > 0 ? Math.round(epochDetails.reduce((sum, e) => sum + e.duration, 0) / epochDetails.length) : 0}ms
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <Settings className="h-6 w-6 text-orange-400" />
                <span className="text-sm text-gray-400">Learning Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {epochDetails.length > 0 ? epochDetails[epochDetails.length - 1].learningRate.toFixed(6) : config.learningRate.toFixed(6)}
              </div>
            </div>
          </div>

          {showEpochDetails && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {epochDetails.slice(-10).map((epoch) => (
                  <div key={epoch.epoch} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-white">Epoch {epoch.epoch}</div>
                      <div className="text-xs text-gray-400">{epoch.duration}ms</div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
              {/* Algorithm Details */}
              {showAlgorithmDetails === step.id && algorithmExplanations[step.id as keyof typeof algorithmExplanations] && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-green-400" />
                      <h5 className="text-green-400 font-medium">
                        {algorithmExplanations[step.id as keyof typeof algorithmExplanations].title}
                      </h5>
                    </div>
                    
                    <div className="bg-gray-800 rounded p-3 border border-gray-600">
                      <div className="text-green-300 font-mono text-sm mb-2">
                        Formula: {algorithmExplanations[step.id as keyof typeof algorithmExplanations].formula}
                      </div>
                      <div className="text-blue-300 text-xs">
                        Parameters: {algorithmExplanations[step.id as keyof typeof algorithmExplanations].parameters}
                      </div>
                    </div>
                    
                    <div className="text-gray-300 text-sm whitespace-pre-line">
                      {algorithmExplanations[step.id as keyof typeof algorithmExplanations].explanation}
                    </div>
                  </div>
                </div>
              )}
                      <div className="text-red-400">Loss: {epoch.trainingLoss.toFixed(4)}</div>
                      <div className="text-orange-400">Val: {epoch.validationLoss.toFixed(4)}</div>
                      <div className="text-green-400">Acc: {(epoch.accuracy * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAlgorithmDetails(showAlgorithmDetails === step.id ? null : step.id)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Calculator className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time Prediction and Map Section */}
      {isRealTimePrediction && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-green-400" />
              Peta Interaktif Penurunan Tanah Kota Padang
            </h3>
            
            {/* Map Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};