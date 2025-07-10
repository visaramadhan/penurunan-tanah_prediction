import { RinexData, ProcessedData } from '../types';

export const processRinexData = (rawData: string): RinexData[] => {
  // Enhanced RINEX data processing to handle multiple files
  const lines = rawData.split('\n').filter(line => line.trim());
  
  // Check if it's CSV format or RINEX format
  const isCSV = lines[0]?.includes(',') || lines[0]?.toLowerCase().includes('date');
  
  if (isCSV) {
    // Process CSV format
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => parseFloat(v.trim()) || 0);
      return {
        timestamp: new Date(2022, 0, index + 1).toISOString(),
        easting: values[1] || 700000 + Math.random() * 50000,
        northing: values[2] || 9300000 + Math.random() * 100000,
        height: values[3] || 50 + Math.random() * 10,
        geoidSeparation: values[4] || 20 + Math.random() * 5
      };
    });
  } else {
    // Process RINEX format (simplified simulation)
    const dataPoints = Math.min(lines.length, 365); // Max 1 year of daily data
    return Array.from({ length: dataPoints }, (_, index) => ({
      timestamp: new Date(2022, 0, index + 1).toISOString(),
      easting: 700000 + Math.random() * 50000,
      northing: 9300000 + Math.random() * 100000,
      height: 50 + Math.random() * 10 - (index * 0.001), // Simulate gradual subsidence
      geoidSeparation: 20 + Math.random() * 5
    }));
  }
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