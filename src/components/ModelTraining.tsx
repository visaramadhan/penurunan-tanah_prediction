import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Download, Settings } from 'lucide-react';
import { TrainingStep, PLSTMConfig, ModelMetrics } from '../types';

interface ModelTrainingProps {
  steps: TrainingStep[];
  onStepUpdate: (stepId: string, update: Partial<TrainingStep>) => void;
  onTrainingComplete: (metrics: ModelMetrics) => void;
  config: PLSTMConfig;
  onConfigChange: (config: PLSTMConfig) => void;
}

export const ModelTraining: React.FC<ModelTrainingProps> = ({
  steps,
  onStepUpdate,
  onTrainingComplete,
  config,
  onConfigChange
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

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
        return 'bg-green-50 border-green-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const startTraining = async () => {
    setIsTraining(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      onStepUpdate(steps[i].id, { status: 'processing', progress: 0 });

      // Simulate step processing
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onStepUpdate(steps[i].id, { progress });
      }

      onStepUpdate(steps[i].id, { status: 'completed', progress: 100 });
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Simulate final metrics calculation
    const mockMetrics: ModelMetrics = {
      mse: 0.025 + Math.random() * 0.01,
      rmse: 0.16 + Math.random() * 0.02,
      mae: 0.12 + Math.random() * 0.03,
      accuracy: 0.85 + Math.random() * 0.1,
      trainingLoss: Array.from({ length: config.epochs }, (_, i) => Math.exp(-i * 0.1) * (0.5 + Math.random() * 0.3)),
      validationLoss: Array.from({ length: config.epochs }, (_, i) => Math.exp(-i * 0.08) * (0.6 + Math.random() * 0.2))
    };

    onTrainingComplete(mockMetrics);
    setIsTraining(false);
  };

  const handleConfigChange = (field: keyof PLSTMConfig, value: number) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">PLSTM Configuration</h3>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Settings className="h-5 w-5" />
            <span>{showConfig ? 'Hide' : 'Show'} Config</span>
          </button>
        </div>

        {showConfig && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LSTM Layers
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.layers}
                onChange={(e) => handleConfigChange('layers', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neurons per Layer
              </label>
              <input
                type="number"
                min="32"
                max="512"
                step="32"
                value={config.neurons}
                onChange={(e) => handleConfigChange('neurons', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Epochs
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={config.epochs}
                onChange={(e) => handleConfigChange('epochs', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size
              </label>
              <input
                type="number"
                min="8"
                max="256"
                value={config.batchSize}
                onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Rate
              </label>
              <input
                type="number"
                min="0.0001"
                max="0.1"
                step="0.0001"
                value={config.learningRate}
                onChange={(e) => handleConfigChange('learningRate', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parallel Regions
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.parallelRegions}
                onChange={(e) => handleConfigChange('parallelRegions', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Training Steps */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Training Progress</h3>
          <button
            onClick={startTraining}
            disabled={isTraining}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTraining ? 'Training...' : 'Start Training'}
          </button>
        </div>

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
                    <h4 className="font-medium text-gray-800">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {step.progress}%
                  </div>
                </div>
              </div>
              
              {step.status === 'processing' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};