export interface RinexData {
  timestamp: string;
  easting: number;
  northing: number;
  height: number;
  geoidSeparation: number;
}

export interface ProcessedData {
  timestamp: string;
  easting: number;
  northing: number;
  height: number;
  subsidence: number;
  yearlySubsidence: number;
}

export interface TrainingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  data?: any;
}

export interface ModelMetrics {
  mse: number;
  rmse: number;
  mae: number;
  accuracy: number;
  trainingLoss: number[];
  validationLoss: number[];
}

export interface PredictionResult {
  timestamp: string;
  actualSubsidence: number;
  predictedSubsidence: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PLSTMConfig {
  layers: number;
  neurons: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  parallelRegions: number;
}