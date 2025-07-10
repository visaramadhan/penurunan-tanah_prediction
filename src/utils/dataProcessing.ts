import { RinexData, ProcessedData } from '../types';

export const processRinexData = (rawData: string): RinexData[] => {
  // Simulate RINEX data processing
  const lines = rawData.split('\n').filter(line => line.trim());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => parseFloat(v.trim()) || 0);
    return {
      timestamp: new Date(2022, 0, index + 1).toISOString(),
      easting: values[0] || 100000 + Math.random() * 1000,
      northing: values[1] || 9800000 + Math.random() * 1000,
      height: values[2] || 50 + Math.random() * 10,
      geoidSeparation: values[3] || 20 + Math.random() * 5
    };
  });
};

export const calculateSubsidence = (data: RinexData[]): ProcessedData[] => {
  return data.map((point, index) => {
    const baseHeight = data[0]?.height || 50;
    const subsidence = baseHeight - point.height;
    const yearlySubsidence = index > 0 ? subsidence / (index / 365) : 0;
    
    return {
      ...point,
      subsidence,
      yearlySubsidence
    };
  });
};

export const cleanData = (data: ProcessedData[]): ProcessedData[] => {
  return data.filter(point => {
    // Remove outliers and invalid data
    return Math.abs(point.subsidence) < 100 && 
           !isNaN(point.easting) && 
           !isNaN(point.northing) && 
           !isNaN(point.height);
  });
};

export const generateTimeSeriesData = (data: ProcessedData[], windowSize: number = 30) => {
  const sequences = [];
  
  for (let i = windowSize; i < data.length; i++) {
    const sequence = data.slice(i - windowSize, i);
    const target = data[i];
    sequences.push({ sequence, target });
  }
  
  return sequences;
};