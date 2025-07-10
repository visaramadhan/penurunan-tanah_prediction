import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import { DataVisualization } from '../components/DataVisualization';
import { ProcessedData, PredictionResult } from '../types';

export const Prediction: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [realTimeData, setRealTimeData] = useState<ProcessedData[]>([]);

  // Generate mock real-time data
  useEffect(() => {
    const generateMockData = () => {
      const data: ProcessedData[] = [];
      const baseTime = new Date();
      
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(baseTime.getTime() + i * 24 * 60 * 60 * 1000);
        const subsidence = Math.sin(i * 0.1) * 0.5 + Math.random() * 0.1 - 0.05;
        
        data.push({
          timestamp: timestamp.toISOString(),
          easting: 100000 + Math.random() * 1000,
          northing: 9800000 + Math.random() * 1000,
          height: 50 - Math.abs(subsidence),
          subsidence,
          yearlySubsidence: subsidence * 365
        });
      }
      
      setRealTimeData(data);
    };
    
    generateMockData();
  }, []);

  // Simulate real-time prediction
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentIndex < realTimeData.length) {
      interval = setInterval(() => {
        const currentData = realTimeData[currentIndex];
        if (currentData) {
          const prediction: PredictionResult = {
            timestamp: currentData.timestamp,
            actualSubsidence: currentData.subsidence,
            predictedSubsidence: currentData.subsidence + (Math.random() - 0.5) * 0.1,
            confidence: 0.7 + Math.random() * 0.25,
            riskLevel: getRiskLevel(currentData.subsidence)
          };
          
          setPredictions(prev => [...prev, prediction]);
          setCurrentIndex(prev => prev + 1);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentIndex, realTimeData]);

  const getRiskLevel = (subsidence: number): 'low' | 'medium' | 'high' | 'critical' => {
    const abs = Math.abs(subsidence);
    if (abs > 0.5) return 'critical';
    if (abs > 0.3) return 'high';
    if (abs > 0.1) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const togglePrediction = () => {
    setIsRunning(!isRunning);
  };

  const resetPrediction = () => {
    setIsRunning(false);
    setPredictions([]);
    setCurrentIndex(0);
  };

  const latestPrediction = predictions[predictions.length - 1];
  const averageConfidence = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Real-Time Land Subsidence Prediction
          </h1>
          <p className="text-xl text-gray-600">
            Monitor and predict land subsidence patterns in real-time using PLSTM
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Prediction Control
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePrediction}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isRunning 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  onClick={resetPrediction}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {predictions.length}
                </div>
                <div className="text-sm text-gray-600">Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(averageConfidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Confidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        {latestPrediction && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="text-sm text-gray-500">Latest Prediction</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {latestPrediction.predictedSubsidence.toFixed(4)}m
              </div>
              <div className="text-sm text-gray-600">
                Actual: {latestPrediction.actualSubsidence.toFixed(4)}m
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <span className="text-sm text-gray-500">Risk Level</span>
              </div>
              <div className={`text-xl font-bold px-3 py-1 rounded-full ${getRiskColor(latestPrediction.riskLevel)}`}>
                {latestPrediction.riskLevel.toUpperCase()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="h-8 w-8 text-green-600" />
                <span className="text-sm text-gray-500">Confidence</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {(latestPrediction.confidence * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${latestPrediction.confidence * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Status</div>
              </div>
              <div className={`flex items-center space-x-2 ${
                isRunning ? 'text-green-600' : 'text-gray-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  isRunning ? 'bg-green-600 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="font-medium">
                  {isRunning ? 'Running' : 'Stopped'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {isRunning ? 'Real-time monitoring active' : 'Click start to begin'}
              </div>
            </div>
          </div>
        )}

        {/* Prediction Visualization */}
        {predictions.length > 0 && (
          <div className="space-y-6">
            <DataVisualization
              data={predictions}
              type="prediction"
              title="Real-Time Prediction vs Actual"
              height={400}
            />

            {/* Recent Predictions Table */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Predictions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Predicted</th>
                      <th className="text-left py-2">Actual</th>
                      <th className="text-left py-2">Error</th>
                      <th className="text-left py-2">Confidence</th>
                      <th className="text-left py-2">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.slice(-10).reverse().map((prediction, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2">
                          {new Date(prediction.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 font-medium">
                          {prediction.predictedSubsidence.toFixed(4)}m
                        </td>
                        <td className="py-2">
                          {prediction.actualSubsidence.toFixed(4)}m
                        </td>
                        <td className="py-2">
                          {Math.abs(prediction.predictedSubsidence - prediction.actualSubsidence).toFixed(4)}m
                        </td>
                        <td className="py-2">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.riskLevel)}`}>
                            {prediction.riskLevel.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {predictions.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready for Real-Time Prediction
            </h3>
            <p className="text-gray-600 mb-6">
              Click the "Start" button to begin real-time land subsidence monitoring and prediction.
            </p>
            <button
              onClick={togglePrediction}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Prediction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};