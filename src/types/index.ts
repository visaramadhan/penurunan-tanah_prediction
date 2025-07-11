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
  velocity: number;
  acceleration: number;
  temperature?: number;
  precipitation?: number;
  groundwaterLevel?: number;
}

export interface TrainingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  data?: any;
  details?: string[];
  metrics?: any;
}

export interface ModelMetrics {
  mse: number;
  rmse: number;
  mae: number;
  accuracy: number;
  r2Score: number;
  trainingLoss: number[];
  validationLoss: number[];
  epochDetails: EpochDetail[];
}

export interface EpochDetail {
  epoch: number;
  trainingLoss: number;
  validationLoss: number;
  accuracy: number;
  learningRate: number;
  duration: number;
}

export interface PredictionResult {
  timestamp: string;
  actualSubsidence: number;
  predictedSubsidence: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  location: {
    easting: number;
    northing: number;
    district: string;
  };
}

export interface PLSTMConfig {
  layers: number;
  neurons: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  parallelRegions: number;
  sequenceLength: number;
  dropoutRate: number;
  validationSplit: number;
}

export interface YearlyData {
  year: number;
  data: ProcessedData[];
  quality: number;
  completeness: number;
  stationCount: number;
}

export interface DataPreview {
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  yearlyData: YearlyData[];
  availableVariables: string[];
  spatialCoverage: {
    minEasting: number;
    maxEasting: number;
    minNorthing: number;
    maxNorthing: number;
  };
  dataQuality: {
    completeness: number;
    consistency: number;
    accuracy: number;
  };
}

export interface VariableSelection {
  primary: string[];
  secondary: string[];
  environmental: string[];
}

export interface PadangDistrict {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  subsidenceRate: number;
  population: number;
}

export interface SubsidencePoint {
  id: string;
  latitude: number;
  longitude: number;
  easting: number;
  northing: number;
  subsidence: number;
  yearlyRate: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  stationName: string;
  district: string;
  lastUpdate: string;
  confidence: number;
  historicalData: {
    year: number;
    subsidence: number;
  }[];
  prediction: {
    nextYear: number;
    next5Years: number;
    confidence: number;
  };
}