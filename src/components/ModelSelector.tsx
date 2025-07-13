import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Database, Trash2, Eye, Download, Upload } from 'lucide-react';
import { FirebaseService, SavedModel } from '../services/firebaseService';
import { PLSTMConfig, ModelMetrics, VariableSelection } from '../types';

interface ModelSelectorProps {
  onModelSelect: (model: SavedModel) => void;
  onCreateNew: () => void;
  selectedModel: SavedModel | null;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  onModelSelect,
  onCreateNew,
  selectedModel
}) => {
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const models = await FirebaseService.getModels();
      setSavedModels(models);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus model ini?')) {
      try {
        await FirebaseService.deleteModel(modelId);
        setSavedModels(prev => prev.filter(m => m.id !== modelId));
        if (selectedModel?.id === modelId) {
          // Reset selection if deleted model was selected
        }
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-400';
    if (accuracy >= 0.8) return 'text-blue-400';
    if (accuracy >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatVariables = (variables: VariableSelection) => {
    const all = [...variables.primary, ...variables.secondary, ...variables.environmental];
    return all.length > 0 ? all.join(', ') : 'Tidak ada variabel';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-3 text-white">Memuat model tersimpan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Database className="h-6 w-6 mr-2 text-green-400" />
          Pilih Model PLSTM
        </h3>
        <button
          onClick={onCreateNew}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Buat Model Baru</span>
        </button>
      </div>

      {savedModels.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">Belum Ada Model Tersimpan</h4>
          <p className="text-gray-400 mb-4">
            Buat model PLSTM pertama Anda untuk analisis penurunan tanah Kota Padang
          </p>
          <button
            onClick={onCreateNew}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Mulai Training Model Baru
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedModels.map((model) => (
            <div
              key={model.id}
              className={`bg-gray-900 rounded-lg p-4 border-2 transition-all cursor-pointer ${
                selectedModel?.id === model.id
                  ? 'border-green-600 bg-green-900 bg-opacity-20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => onModelSelect(model)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Brain className="h-5 w-5 text-green-400" />
                    <h4 className="text-lg font-medium text-white">{model.name}</h4>
                    <span className={`text-sm font-medium ${getAccuracyColor(model.metrics.accuracy)}`}>
                      {(model.metrics.accuracy * 100).toFixed(1)}% akurasi
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{model.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Dibuat:</span>
                      <div className="text-white">{model.createdAt.toLocaleDateString('id-ID')}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Data Range:</span>
                      <div className="text-white">{model.dataRange.start} - {model.dataRange.end}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Records:</span>
                      <div className="text-white">{model.totalRecords.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">Variabel:</span>
                    <div className="text-white text-sm mt-1">
                      {formatVariables(model.variables)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(showDetails === model.id ? null : model.id);
                    }}
                    className="text-blue-400 hover:text-blue-300 p-2"
                    title="Lihat Detail"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {model.modelFileUrl && (
                    <a
                      href={model.modelFileUrl}
                      download={`${model.name}.json`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-green-400 hover:text-green-300 p-2"
                      title="Download Model"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModel(model.id);
                    }}
                    className="text-red-400 hover:text-red-300 p-2"
                    title="Hapus Model"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Model Details */}
              {showDetails === model.id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-green-400 font-medium mb-2">Konfigurasi Model</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Layers:</span>
                          <span className="text-white">{model.config.layers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Neurons:</span>
                          <span className="text-white">{model.config.neurons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Epochs:</span>
                          <span className="text-white">{model.config.epochs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Batch Size:</span>
                          <span className="text-white">{model.config.batchSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Learning Rate:</span>
                          <span className="text-white">{model.config.learningRate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-green-400 font-medium mb-2">Metrik Performa</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">MSE:</span>
                          <span className="text-white">{model.metrics.mse.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">RMSE:</span>
                          <span className="text-white">{model.metrics.rmse.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">MAE:</span>
                          <span className="text-white">{model.metrics.mae.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">R² Score:</span>
                          <span className="text-white">{model.metrics.r2Score?.toFixed(4) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-green-400 font-medium mb-2">Variabel Detail</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-400 font-medium">Utama ({model.variables.primary.length}):</span>
                        <div className="text-gray-300 mt-1">
                          {model.variables.primary.join(', ') || 'Tidak ada'}
                        </div>
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Sekunder ({model.variables.secondary.length}):</span>
                        <div className="text-gray-300 mt-1">
                          {model.variables.secondary.join(', ') || 'Tidak ada'}
                        </div>
                      </div>
                      <div>
                        <span className="text-orange-400 font-medium">Lingkungan ({model.variables.environmental.length}):</span>
                        <div className="text-gray-300 mt-1">
                          {model.variables.environmental.join(', ') || 'Tidak ada'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};