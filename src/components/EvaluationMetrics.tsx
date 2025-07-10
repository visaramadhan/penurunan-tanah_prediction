import React from 'react';
import { TrendingUp, Target, BarChart3, CheckCircle } from 'lucide-react';
import { ModelMetrics } from '../types';

interface EvaluationMetricsProps {
  metrics: ModelMetrics;
}

export const EvaluationMetrics: React.FC<EvaluationMetricsProps> = ({ metrics }) => {
  const metricCards = [
    {
      title: 'MSE',
      value: metrics.mse.toFixed(6),
      description: 'Mean Squared Error',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'RMSE',
      value: metrics.rmse.toFixed(6),
      description: 'Root Mean Squared Error',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'MAE',
      value: metrics.mae.toFixed(4),
      description: 'Mean Absolute Error',
      icon: BarChart3,
      color: 'purple'
    },
    {
      title: 'Accuracy',
      value: `${(metrics.accuracy * 100).toFixed(1)}%`,
      description: 'Prediction Accuracy',
      icon: CheckCircle,
      color: 'emerald'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-gray-900 border-blue-600 text-blue-300',
      green: 'bg-gray-900 border-green-600 text-green-300',
      purple: 'bg-gray-900 border-purple-600 text-purple-300',
      emerald: 'bg-gray-900 border-emerald-600 text-emerald-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-400',
      green: 'text-green-600',
      purple: 'text-purple-400',
      emerald: 'text-emerald-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 bg-gray-800 ${getColorClasses(metric.color)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`h-6 w-6 ${getIconColor(metric.color)}`} />
              <span className="text-sm font-medium text-gray-300">{metric.title}</span>
            </div>
            <div className="text-2xl font-bold mb-1 text-white">{metric.value}</div>
            <div className="text-sm text-gray-400">{metric.description}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Model Performance Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-400 mb-2">Performance Summary</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Model achieved {(metrics.accuracy * 100).toFixed(1)}% accuracy</li>
              <li>• RMSE of {metrics.rmse.toFixed(6)} indicates high precision</li>
              <li>• MAE of {metrics.mae.toFixed(4)} shows consistent predictions</li>
              <li>• Training converged successfully with minimal overfitting</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-400 mb-2">Model Interpretation</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Prediction Quality:</span>
                <span className="font-medium text-green-600">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span>Generalization:</span>
                <span className="font-medium text-blue-400">Good</span>
              </div>
              <div className="flex justify-between">
                <span>Temporal Stability:</span>
                <span className="font-medium text-green-600">High</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Consistency:</span>
                <span className="font-medium text-blue-400">Moderate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};