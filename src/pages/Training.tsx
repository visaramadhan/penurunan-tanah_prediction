import React, { useState, useEffect } from 'react';
import { Download, Eye, FileText, BarChart3, Play, Database } from 'lucide-react';
import { DataPreviewComponent } from '../components/DataPreview';
import { DetailedTraining } from '../components/DetailedTraining';
import { EvaluationMetrics } from '../components/EvaluationMetrics';
import { loadPadangData } from '../utils/dataLoader';
import { PLSTMModel } from '../utils/plstm';
import { TrainingStep, PLSTMConfig, ModelMetrics, DataPreview, VariableSelection } from '../types';

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
    'Model Evaluation'
  ];

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

        {/* Phase 3: Model Evaluation */}
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
          </div>
        )}
      </div>
    </div>
  );
};