import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ProcessedData, PredictionResult } from '../types';

interface DataVisualizationProps {
  data: ProcessedData[] | PredictionResult[];
  type: 'subsidence' | 'prediction' | 'scatter';
  title: string;
  height?: number;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  type,
  title,
  height = 300
}) => {
  const formatData = () => {
    if (type === 'prediction') {
      return (data as PredictionResult[]).map(point => ({
        timestamp: new Date(point.timestamp).toLocaleDateString(),
        actual: point.actualSubsidence,
        predicted: point.predictedSubsidence,
        confidence: point.confidence * 100
      }));
    } else {
      return (data as ProcessedData[]).map(point => ({
        timestamp: new Date(point.timestamp).toLocaleDateString(),
        subsidence: point.subsidence,
        yearlySubsidence: point.yearlySubsidence,
        height: point.height
      }));
    }
  };

  const chartData = formatData();

  const renderChart = () => {
    switch (type) {
      case 'prediction':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Actual Subsidence"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#059669" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Subsidence"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Scatter dataKey="subsidence" fill="#2563eb" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="subsidence" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Land Subsidence"
              />
              <Line 
                type="monotone" 
                dataKey="yearlySubsidence" 
                stroke="#0891b2" 
                strokeWidth={2}
                name="Yearly Subsidence Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};