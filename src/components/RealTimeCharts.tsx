import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { format,  startOfWeek } from 'date-fns';
import { Calendar, TrendingDown, BarChart3, Activity } from 'lucide-react';


const eachDayOfInterval = ({ start, end }: { start: Date; end: Date }) => {
  const days = [];
  let currentDate = start;
  while (currentDate <= end) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};
const eachMonthOfInterval = ({ start, end }: { start: Date; end: Date }) => {
  const months = [];
  let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
  while (currentDate <= endMonth) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return months;
};


interface ChartData {
  date: string;
  fullDate: Date;
  subsidence: number;
  velocity: number;
  acceleration: number;
  confidence: number;
  riskLevel: string;
}

interface RealTimeChartsProps {
  selectedYear: number;
  showDataType: 'real' | 'prediction';
}

export const RealTimeCharts: React.FC<RealTimeChartsProps> = ({
  selectedYear,
  showDataType
}) => {
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Generate mock real-time data
  useEffect(() => {
    const generateData = () => {
      setLoading(true);
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      
      let intervals: Date[] = [];
      let formatString = '';
      
      switch (chartType) {
        case 'daily':
          intervals = eachDayOfInterval({ start: startDate, end: endDate });
          formatString = 'MMM dd';
          break;
        case 'weekly':
          // Generate weekly intervals manually
          let current = startOfWeek(startDate);
          const end = startOfWeek(endDate);
          while (current <= end) {
            intervals.push(current);
            current = new Date(current.setDate(current.getDate() + 7)); // Move to the next week
          }
          formatString = 'MMM dd';
          break;
        case 'monthly':
          intervals = eachMonthOfInterval({ start: startDate, end: endDate });
          formatString = 'MMM yyyy';
          break;
      }

      const data = intervals.map((date, index) => {
        const baseSubsidence = showDataType === 'real' 
          ? -0.02 - (index / intervals.length) * 0.01 + (Math.random() - 0.5) * 0.005
          : -0.018 - (index / intervals.length) * 0.008 + (Math.random() - 0.5) * 0.003;
        
        const velocity = -0.015 + (Math.random() - 0.5) * 0.01;
        const acceleration = (Math.random() - 0.5) * 0.001;
        const confidence = 0.7 + Math.random() * 0.25;

        return {
          date: format(date, formatString),
          fullDate: date,
          subsidence: Math.abs(baseSubsidence * 100), // Convert to cm and make positive for display
          velocity: Math.abs(velocity * 100),
          acceleration: Math.abs(acceleration * 1000),
          confidence: confidence * 100,
          riskLevel: Math.abs(baseSubsidence * 100) > 3 ? 'critical' : 
                    Math.abs(baseSubsidence * 100) > 2 ? 'high' :
                    Math.abs(baseSubsidence * 100) > 1.5 ? 'medium' : 'low'
        };
      });

      setChartData(data);
      setLoading(false);
    };

    generateData();
  }, [selectedYear, showDataType, chartType]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#22c55e';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(2)} {entry.name === 'confidence' ? '%' : 'cm'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const averageSubsidence = useMemo(() => {
    return chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.subsidence, 0) / chartData.length).toFixed(2) : '0.00';
  }, [chartData]);

  const maxSubsidence = useMemo(() => {
    return chartData.length > 0 ? Math.max(...chartData.map(d => d.subsidence)).toFixed(2) : '0.00';
  }, [chartData]);

  const averageConfidence = useMemo(() => {
    return chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.confidence, 0) / chartData.length).toFixed(1) : '0.0';
  }, [chartData]);

  const criticalCount = useMemo(() => {
    return chartData.filter(d => d.riskLevel === 'critical').length;
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-400" />
            Grafik Real-time Penurunan Tanah {selectedYear}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Tampilan:</span>
            <div className="flex bg-gray-700 rounded-lg p-1">
              {[
                { key: 'daily', label: 'Harian', icon: Calendar },
                { key: 'weekly', label: 'Mingguan', icon: BarChart3 },
                { key: 'monthly', label: 'Bulanan', icon: TrendingDown }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setChartType(option.key as any)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                    chartType === option.key
                      ? 'bg-green-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
            <div className="text-sm text-gray-400">Rata-rata Penurunan</div>
            <div className="text-xl font-bold text-red-400">{averageSubsidence} cm</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
            <div className="text-sm text-gray-400">Penurunan Maksimal</div>
            <div className="text-xl font-bold text-orange-400">{maxSubsidence} cm</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
            <div className="text-sm text-gray-400">Confidence Rata-rata</div>
            <div className="text-xl font-bold text-blue-400">{averageConfidence}%</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
            <div className="text-sm text-gray-400">Titik Kritis</div>
            <div className="text-xl font-bold text-red-400">{criticalCount}</div>
          </div>
        </div>
      </div>

      {/* Main Subsidence Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-white font-medium mb-4">
          Tren Penurunan Tanah {chartType === 'daily' ? 'Harian' : chartType === 'weekly' ? 'Mingguan' : 'Bulanan'}
          <span className="text-sm text-gray-400 ml-2">
            ({showDataType === 'real' ? 'Data Observasi' : 'Data Prediksi'})
          </span>
        </h4>
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                label={{ value: 'Penurunan (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="subsidence"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Penurunan Tanah"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Velocity and Acceleration Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-white font-medium mb-4">Kecepatan Penurunan</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="velocity"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="Kecepatan"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-white font-medium mb-4">Tingkat Confidence</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="confidence"
                fill="#3b82f6"
                name="Confidence"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-white font-medium mb-4">Distribusi Tingkat Risiko</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['low', 'medium', 'high', 'critical'].map((risk) => {
            const count = chartData.filter(d => d.riskLevel === risk).length;
            const percentage = chartData.length > 0 ? (count / chartData.length) * 100 : 0;
            const labels = {
              low: 'Rendah',
              medium: 'Sedang', 
              high: 'Tinggi',
              critical: 'Kritis'
            };
            
            return (
              <div key={risk} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getRiskColor(risk) }}
                  ></div>
                  <span className="text-white font-medium">{labels[risk as keyof typeof labels]}</span>
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
