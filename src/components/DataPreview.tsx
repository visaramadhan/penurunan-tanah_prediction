import React, { useState } from 'react';
import { Eye, BarChart3, MapPin, Calendar, TrendingDown, Info } from 'lucide-react';
import { DataPreview, VariableSelection } from '../types';

interface DataPreviewProps {
  dataPreview: DataPreview;
  onVariableSelection: (selection: VariableSelection) => void;
  onProceedToModeling: () => void;
}

export const DataPreviewComponent: React.FC<DataPreviewProps> = ({
  dataPreview,
  onVariableSelection,
  onProceedToModeling
}) => {
  const [selectedPrimary, setSelectedPrimary] = useState<string[]>(['easting', 'northing', 'height']);
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>(['velocity', 'acceleration']);
  const [selectedEnvironmental, setSelectedEnvironmental] = useState<string[]>(['temperature', 'precipitation']);
  const [showVariableInfo, setShowVariableInfo] = useState<string | null>(null);

  const variableExplanations = {
    easting: {
      description: 'Koordinat UTM Timur - posisi horizontal dalam sistem koordinat UTM',
      importance: 'Sangat Penting',
      formula: 'X = E (meter)',
      reason: 'Menentukan lokasi spasial untuk analisis pola penurunan tanah'
    },
    northing: {
      description: 'Koordinat UTM Utara - posisi vertikal dalam sistem koordinat UTM',
      importance: 'Sangat Penting',
      formula: 'Y = N (meter)',
      reason: 'Menentukan lokasi spasial untuk analisis pola penurunan tanah'
    },
    height: {
      description: 'Ketinggian permukaan tanah dari datum referensi',
      importance: 'Sangat Penting',
      formula: 'H = h₀ - Δh (meter)',
      reason: 'Variabel utama untuk menghitung penurunan tanah'
    },
    subsidence: {
      description: 'Penurunan tanah absolut dari baseline',
      importance: 'Target Variable',
      formula: 'S = h₀ - hₜ (meter)',
      reason: 'Variabel target yang akan diprediksi oleh model'
    },
    velocity: {
      description: 'Kecepatan penurunan tanah per satuan waktu',
      importance: 'Penting',
      formula: 'v = dS/dt (meter/hari)',
      reason: 'Menunjukkan tren perubahan penurunan tanah'
    },
    acceleration: {
      description: 'Percepatan penurunan tanah',
      importance: 'Penting',
      formula: 'a = dv/dt (meter/hari²)',
      reason: 'Mendeteksi perubahan pola penurunan tanah'
    },
    temperature: {
      description: 'Suhu udara rata-rata harian',
      importance: 'Sedang',
      formula: 'T = Σ(Tᵢ)/n (°C)',
      reason: 'Mempengaruhi ekspansi-kontraksi tanah dan evapotranspirasi'
    },
    precipitation: {
      description: 'Curah hujan harian',
      importance: 'Sedang',
      formula: 'P = Σ(Pᵢ) (mm/hari)',
      reason: 'Mempengaruhi tekanan air tanah dan stabilitas tanah'
    },
    groundwaterLevel: {
      description: 'Tinggi muka air tanah',
      importance: 'Tinggi',
      formula: 'GWL = H - D (meter)',
      reason: 'Faktor utama penyebab penurunan tanah akibat ekstraksi air tanah'
    }
  };

  const getVariableColor = (importance: string) => {
    switch (importance) {
      case 'Sangat Penting': return 'text-red-400';
      case 'Target Variable': return 'text-purple-400';
      case 'Tinggi': return 'text-orange-400';
      case 'Penting': return 'text-yellow-400';
      case 'Sedang': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const handleVariableToggle = (variable: string, category: 'primary' | 'secondary' | 'environmental') => {
    switch (category) {
      case 'primary':
        setSelectedPrimary(prev => 
          prev.includes(variable) 
            ? prev.filter(v => v !== variable)
            : [...prev, variable]
        );
        break;
      case 'secondary':
        setSelectedSecondary(prev => 
          prev.includes(variable) 
            ? prev.filter(v => v !== variable)
            : [...prev, variable]
        );
        break;
      case 'environmental':
        setSelectedEnvironmental(prev => 
          prev.includes(variable) 
            ? prev.filter(v => v !== variable)
            : [...prev, variable]
        );
        break;
    }
  };

  const handleProceed = () => {
    onVariableSelection({
      primary: selectedPrimary,
      secondary: selectedSecondary,
      environmental: selectedEnvironmental
    });
    onProceedToModeling();
  };

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Eye className="h-6 w-6 mr-2 text-green-400" />
          Preview Data Penurunan Tanah Kota Padang
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-6 w-6 text-green-400" />
              <span className="text-sm text-gray-400">Total Records</span>
            </div>
            <div className="text-2xl font-bold text-white">{dataPreview.totalRecords.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Data Points</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-6 w-6 text-blue-400" />
              <span className="text-sm text-gray-400">Periode</span>
            </div>
            <div className="text-lg font-bold text-white">2021-2024</div>
            <div className="text-sm text-gray-300">4 Tahun Data</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="h-6 w-6 text-purple-400" />
              <span className="text-sm text-gray-400">Kecamatan</span>
            </div>
            <div className="text-2xl font-bold text-white">11</div>
            <div className="text-sm text-gray-300">Area Monitoring</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-6 w-6 text-red-400" />
              <span className="text-sm text-gray-400">Kualitas Data</span>
            </div>
            <div className="text-2xl font-bold text-white">{(dataPreview.dataQuality.completeness * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-300">Completeness</div>
          </div>
        </div>

        {/* Yearly Data Summary */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <h4 className="text-lg font-semibold text-green-400 mb-3">Ringkasan Data per Tahun</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {dataPreview.yearlyData.map((yearData) => (
              <div key={yearData.year} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="text-lg font-bold text-white mb-1">{yearData.year}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Records:</span>
                    <span className="text-white">{yearData.data.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stations:</span>
                    <span className="text-white">{yearData.stationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality:</span>
                    <span className="text-green-400">{(yearData.quality * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Variable Selection */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Pemilihan Variabel untuk Modeling</h3>
        <p className="text-gray-300 mb-6">
          Pilih variabel yang akan digunakan dalam model PLSTM. Kombinasi variabel yang tepat akan meningkatkan akurasi prediksi.
        </p>

        {/* Primary Variables */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-green-400 mb-3">Variabel Utama (Wajib)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {['easting', 'northing', 'height', 'subsidence'].map((variable) => (
              <div key={variable} className="relative">
                <label className="flex items-center space-x-3 bg-gray-900 p-3 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedPrimary.includes(variable)}
                    onChange={() => handleVariableToggle(variable, 'primary')}
                    className="form-checkbox h-4 w-4 text-green-600"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium capitalize">{variable}</div>
                    <div className={`text-sm ${getVariableColor(variableExplanations[variable as keyof typeof variableExplanations]?.importance)}`}>
                      {variableExplanations[variable as keyof typeof variableExplanations]?.importance}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowVariableInfo(showVariableInfo === variable ? null : variable);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </label>
                
                {showVariableInfo === variable && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 z-10 shadow-lg">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Deskripsi:</span>
                        <p className="text-white">{variableExplanations[variable as keyof typeof variableExplanations]?.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Formula:</span>
                        <code className="text-green-400 ml-2">{variableExplanations[variable as keyof typeof variableExplanations]?.formula}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Alasan:</span>
                        <p className="text-white">{variableExplanations[variable as keyof typeof variableExplanations]?.reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Variables */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-400 mb-3">Variabel Sekunder (Opsional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {['velocity', 'acceleration', 'yearlySubsidence'].map((variable) => (
              <div key={variable} className="relative">
                <label className="flex items-center space-x-3 bg-gray-900 p-3 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedSecondary.includes(variable)}
                    onChange={() => handleVariableToggle(variable, 'secondary')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium capitalize">{variable}</div>
                    <div className={`text-sm ${getVariableColor(variableExplanations[variable as keyof typeof variableExplanations]?.importance)}`}>
                      {variableExplanations[variable as keyof typeof variableExplanations]?.importance}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowVariableInfo(showVariableInfo === variable ? null : variable);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </label>
                
                {showVariableInfo === variable && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 z-10 shadow-lg">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Deskripsi:</span>
                        <p className="text-white">{variableExplanations[variable as keyof typeof variableExplanations]?.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Formula:</span>
                        <code className="text-green-400 ml-2">{variableExplanations[variable as keyof typeof variableExplanations]?.formula}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Alasan:</span>
                        <p className="text-white">{variableExplanations[variable as keyof typeof variableExplanations]?.reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Variables */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">Variabel Lingkungan (Opsional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {['temperature', 'precipitation', 'groundwaterLevel'].map((variable) => (
              <div key={variable} className="relative">
                <label className="flex items-center space-x-3 bg-gray-900 p-3 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedEnvironmental.includes(variable)}
                    onChange={() => handleVariableToggle(variable, 'environmental')}
                    className="form-checkbox h-4 w-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium capitalize">{variable}</div>
                    <div className={`text-sm ${getVariableColor(variableExplanations[variable as keyof typeof variableExplanations]?.importance)}`}>
                      {variableExplanations[variable as keyof typeof variableExplanations]?.importance}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowVariableInfo(showVariableInfo === variable ? null : variable);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </label>
                
                {showVariableInfo === variable && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 z-10 shadow-lg">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Deskripsi:</span>
                        <p className="text-white">{variableExplanations[variable as keyof typeof variableExplanations]?.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Formula:</span>
                        <code className="text-green-400 ml-2">{variableExplanations[variable as keyof typeof variableExplanations]?.formula}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Alasan:</span>
                        <p className="text-white">{variableExplanations[variable as keyof typeof variableExplanations]?.reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-6">
          <h4 className="text-green-200 font-medium mb-2">Rekomendasi Kombinasi Variabel</h4>
          <div className="text-green-300 text-sm space-y-1">
            <p>• <strong>Minimal:</strong> easting, northing, height (variabel spasial dasar)</p>
            <p>• <strong>Optimal:</strong> + velocity, acceleration (dinamika temporal)</p>
            <p>• <strong>Terbaik:</strong> + groundwaterLevel (faktor penyebab utama)</p>
            <p>• <strong>Lengkap:</strong> + temperature, precipitation (faktor lingkungan)</p>
          </div>
        </div>

        {/* Selected Variables Summary */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 mb-6">
          <h4 className="text-white font-medium mb-3">Variabel Terpilih</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-green-400 text-sm font-medium mb-1">Utama ({selectedPrimary.length})</div>
              <div className="text-gray-300 text-sm">{selectedPrimary.join(', ') || 'Tidak ada'}</div>
            </div>
            <div>
              <div className="text-blue-400 text-sm font-medium mb-1">Sekunder ({selectedSecondary.length})</div>
              <div className="text-gray-300 text-sm">{selectedSecondary.join(', ') || 'Tidak ada'}</div>
            </div>
            <div>
              <div className="text-purple-400 text-sm font-medium mb-1">Lingkungan ({selectedEnvironmental.length})</div>
              <div className="text-gray-300 text-sm">{selectedEnvironmental.join(', ') || 'Tidak ada'}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleProceed}
            disabled={selectedPrimary.length < 3}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Lanjut ke Preprocessing & Modeling
          </button>
        </div>
      </div>
    </div>
  );
};