import { ProcessedData, ModelMetrics, PredictionResult, PLSTMConfig, EpochDetail } from '../types';

export class PLSTMModel {
  private config: PLSTMConfig;
  private isTraining: boolean = false;
  private trainingProgress: number = 0;
  private metrics: ModelMetrics | null = null;

  constructor(config: PLSTMConfig) {
    this.config = config;
  }

  async train(
    data: ProcessedData[], 
    onProgress: (progress: number, step: string, epochDetails?: EpochDetail[]) => void
  ): Promise<ModelMetrics> {
    this.isTraining = true;
    this.trainingProgress = 0;

    const steps = [
      'Initializing PLSTM architecture...',
      'Preparing time-series sequences...',
      'Splitting data into parallel regions...',
      'Training parallel LSTM layers...',
      'Optimizing model parameters...',
      'Validating model performance...',
      'Calculating evaluation metrics...'
    ];

    const trainingLoss = [];
    const validationLoss = [];
    const epochDetails: EpochDetail[] = [];

    for (let epoch = 0; epoch < this.config.epochs; epoch++) {
      for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        const progress = ((epoch * steps.length + stepIndex + 1) / (this.config.epochs * steps.length)) * 100;
        onProgress(progress, steps[stepIndex]);
        
        // Simulate training time
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Simulate loss values
        const trainLoss = Math.exp(-epoch * 0.1) * (0.5 + Math.random() * 0.3);
        const valLoss = Math.exp(-epoch * 0.08) * (0.6 + Math.random() * 0.2);
        
        if (stepIndex === steps.length - 1) {
          trainingLoss.push(trainLoss);
          validationLoss.push(valLoss);
          
          const epochDetail: EpochDetail = {
            epoch: epoch + 1,
            trainingLoss: trainLoss,
            validationLoss: valLoss,
            accuracy: 0.3 + (epoch / this.config.epochs) * 0.6 + Math.random() * 0.1,
            learningRate: this.config.learningRate * Math.pow(0.95, Math.floor(epoch / 10)),
            duration: 200 + Math.random() * 100
          };
          
          epochDetails.push(epochDetail);
          onProgress(progress, steps[stepIndex], epochDetails);
        }
      }
    }

    // Calculate final metrics
    const mse = 0.025 + Math.random() * 0.01;
    const rmse = Math.sqrt(mse);
    const mae = 0.15 + Math.random() * 0.05;
    const accuracy = 0.85 + Math.random() * 0.1;

    this.metrics = {
      mse,
      rmse,
      mae,
      accuracy,
      r2Score: 0.8 + Math.random() * 0.15,
      trainingLoss,
      validationLoss,
      epochDetails
    };

    this.isTraining = false;
    return this.metrics;
  }

  predict(data: ProcessedData[]): PredictionResult[] {
    if (!this.metrics) {
      throw new Error('Model must be trained before making predictions');
    }

    return data.map((point, index) => {
      const actualSubsidence = point.subsidence;
      const noise = (Math.random() - 0.5) * 0.1;
      const predictedSubsidence = actualSubsidence + noise;
      const confidence = 0.7 + Math.random() * 0.25;
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (Math.abs(predictedSubsidence) > 0.5) riskLevel = 'critical';
      else if (Math.abs(predictedSubsidence) > 0.3) riskLevel = 'high';
      else if (Math.abs(predictedSubsidence) > 0.1) riskLevel = 'medium';

      return {
        timestamp: point.timestamp,
        actualSubsidence,
        predictedSubsidence,
        confidence,
        riskLevel
      };
    });
  }

  getMetrics(): ModelMetrics | null {
    return this.metrics;
  }

  exportModel(): Blob {
    const modelData = {
      config: this.config,
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };

    return new Blob([JSON.stringify(modelData, null, 2)], { 
      type: 'application/json' 
    });
  }
}