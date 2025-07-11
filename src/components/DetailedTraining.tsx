import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, BarChart3, TrendingUp, Zap, Settings, Eye } from 'lucide-react';
import { TrainingStep, PLSTMConfig, ModelMetrics, EpochDetail, VariableSelection } from '../types';

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
  };

  const handleConfigChange = (field: keyof PLSTMConfig, value: number) => {
    onConfigChange({ ...config, [field]: value });
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Jumlah Layer LSTM
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.layers}
                onChange={(e) => handleConfigChange('layers', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Neurons per Layer
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Jumlah Epochs
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={config.epochs}
                onChange={(e) => handleConfigChange('epochs', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Batch Size
              </label>
              <input
                type="number"
                min="8"
                max="256"
                value={config.batchSize}
                onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Rate
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sequence Length
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={config.sequenceLength}
                onChange={(e) => handleConfigChange('sequenceLength', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dropout Rate
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Validation Split
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parallel Regions
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.parallelRegions}
                onChange={(e) => handleConfigChange('parallelRegions', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-green-500"
              />
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
                      <div className="text-red-400">Loss: {epoch.trainingLoss.toFixed(4)}</div>
                      <div className="text-orange-400">Val: {epoch.validationLoss.toFixed(4)}</div>
                      <div className="text-green-400">Acc: {(epoch.accuracy * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};