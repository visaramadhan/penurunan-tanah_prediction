import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { ModelMetrics, PLSTMConfig, VariableSelection, PredictionResult } from '../types';

export interface SavedModel {
  id: string;
  name: string;
  description: string;
  config: PLSTMConfig;
  variables: VariableSelection;
  metrics: ModelMetrics;
  createdAt: Date;
  dataRange: {
    start: string;
    end: string;
  };
  totalRecords: number;
  modelFileUrl?: string;
}

export interface PredictionData {
  id: string;
  modelId: string;
  modelName: string;
  predictions: PredictionResult[];
  createdAt: Date;
  predictionRange: {
    start: string;
    end: string;
  };
}

export class FirebaseService {
  // Model Management
  static async saveModel(
    name: string,
    description: string,
    config: PLSTMConfig,
    variables: VariableSelection,
    metrics: ModelMetrics,
    dataRange: { start: string; end: string },
    totalRecords: number,
    modelBlob?: Blob
  ): Promise<string> {
    try {
      let modelFileUrl = '';
      
      if (modelBlob) {
        const modelRef = ref(storage, `models/${Date.now()}_${name}.json`);
        await uploadBytes(modelRef, modelBlob);
        modelFileUrl = await getDownloadURL(modelRef);
      }

      const modelData: Omit<SavedModel, 'id'> = {
        name,
        description,
        config,
        variables,
        metrics,
        createdAt: new Date(),
        dataRange,
        totalRecords,
        modelFileUrl
      };

      const docRef = await addDoc(collection(db, 'models'), {
        ...modelData,
        createdAt: Timestamp.fromDate(modelData.createdAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error saving model:', error);
      throw error;
    }
  }

  static async getModels(): Promise<SavedModel[]> {
    try {
      const q = query(collection(db, 'models'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as SavedModel[];
    } catch (error) {
      console.error('Error getting models:', error);
      throw error;
    }
  }

  static async getModel(modelId: string): Promise<SavedModel | null> {
    try {
      const docRef = doc(db, 'models', modelId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt.toDate()
        } as SavedModel;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting model:', error);
      throw error;
    }
  }

  static async deleteModel(modelId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'models', modelId));
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }

  // Prediction Management
  static async savePredictions(
    modelId: string,
    modelName: string,
    predictions: PredictionResult[],
    predictionRange: { start: string; end: string }
  ): Promise<string> {
    try {
      const predictionData: Omit<PredictionData, 'id'> = {
        modelId,
        modelName,
        predictions,
        createdAt: new Date(),
        predictionRange
      };

      const docRef = await addDoc(collection(db, 'predictions'), {
        ...predictionData,
        createdAt: Timestamp.fromDate(predictionData.createdAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error saving predictions:', error);
      throw error;
    }
  }

  static async getPredictions(): Promise<PredictionData[]> {
    try {
      const q = query(collection(db, 'predictions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as PredictionData[];
    } catch (error) {
      console.error('Error getting predictions:', error);
      throw error;
    }
  }

  static async getPredictionsByModel(modelId: string): Promise<PredictionData[]> {
    try {
      const predictions = await this.getPredictions();
      return predictions.filter(p => p.modelId === modelId);
    } catch (error) {
      console.error('Error getting predictions by model:', error);
      throw error;
    }
  }
}