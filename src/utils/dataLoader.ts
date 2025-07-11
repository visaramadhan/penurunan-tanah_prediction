import { ProcessedData, YearlyData, DataPreview, PadangDistrict } from '../types';

// Simulate reading data from datapdg folder structure
export const loadPadangData = async (): Promise<DataPreview> => {
  // Simulate API call to read folder structure
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const years = [2021, 2022, 2023, 2024];
  const yearlyData: YearlyData[] = [];
  
  // Generate mock data for each year based on Padang coordinates
  for (const year of years) {
    const data = generateYearlyPadangData(year);
    yearlyData.push({
      year,
      data,
      quality: 0.85 + Math.random() * 0.1,
      completeness: 0.9 + Math.random() * 0.08,
      stationCount: 15 + Math.floor(Math.random() * 10)
    });
  }
  
  const allData = yearlyData.flatMap(y => y.data);
  
  return {
    totalRecords: allData.length,
    dateRange: {
      start: '2021-01-01',
      end: '2024-12-31'
    },
    yearlyData,
    availableVariables: [
      'easting', 'northing', 'height', 'subsidence', 'yearlySubsidence',
      'velocity', 'acceleration', 'temperature', 'precipitation', 'groundwaterLevel'
    ],
    spatialCoverage: {
      minEasting: 128000,
      maxEasting: 135000,
      minNorthing: 9920000,
      maxNorthing: 9950000
    },
    dataQuality: {
      completeness: 0.92,
      consistency: 0.88,
      accuracy: 0.91
    }
  };
};

const generateYearlyPadangData = (year: number): ProcessedData[] => {
  const data: ProcessedData[] = [];
  const baseDate = new Date(year, 0, 1);
  
  // Padang city districts coordinates
  const districts = [
    { name: 'Padang Barat', lat: -0.9492, lng: 100.3543, easting: 128500, northing: 9894500 },
    { name: 'Padang Timur', lat: -0.9537, lng: 100.3621, easting: 129200, northing: 9894000 },
    { name: 'Padang Utara', lat: -0.9312, lng: 100.3678, easting: 129500, northing: 9896500 },
    { name: 'Padang Selatan', lat: -0.9712, lng: 100.3456, easting: 128300, northing: 9892000 },
    { name: 'Koto Tangah', lat: -0.9123, lng: 100.4123, easting: 131000, northing: 9898500 },
    { name: 'Nanggalo', lat: -0.9234, lng: 100.3789, easting: 130000, northing: 9897200 },
    { name: 'Pauh', lat: -0.8956, lng: 100.4234, easting: 131500, northing: 9900000 },
    { name: 'Lubuk Kilangan', lat: -0.9876, lng: 100.4567, easting: 133000, northing: 9890000 },
    { name: 'Lubuk Begalung', lat: -0.9654, lng: 100.4321, easting: 132000, northing: 9892500 },
    { name: 'Kuranji', lat: -0.9345, lng: 100.4098, easting: 130800, northing: 9896000 }
  ];
  
  // Generate daily data for each district
  for (let day = 0; day < 365; day++) {
    districts.forEach((district, districtIndex) => {
      const timestamp = new Date(baseDate.getTime() + day * 24 * 60 * 60 * 1000);
      
      // Simulate subsidence progression over years
      const yearProgress = (year - 2021) / 3;
      const baseSubsidence = -0.02 * yearProgress - (day / 365) * 0.015;
      const districtFactor = (districtIndex % 3) * 0.01; // Some districts more affected
      
      const subsidence = baseSubsidence - districtFactor + (Math.random() - 0.5) * 0.005;
      const velocity = -0.015 + (Math.random() - 0.5) * 0.01;
      const acceleration = (Math.random() - 0.5) * 0.001;
      
      data.push({
        timestamp: timestamp.toISOString(),
        easting: district.easting + (Math.random() - 0.5) * 1000,
        northing: district.northing + (Math.random() - 0.5) * 1000,
        height: 10 + Math.abs(subsidence) * 100,
        subsidence,
        yearlySubsidence: subsidence * 365,
        velocity,
        acceleration,
        temperature: 26 + Math.sin(day / 365 * 2 * Math.PI) * 3 + Math.random() * 2,
        precipitation: Math.max(0, 150 + Math.sin(day / 365 * 2 * Math.PI) * 100 + Math.random() * 50),
        groundwaterLevel: 5 + Math.sin(day / 365 * 2 * Math.PI) * 2 + Math.random()
      });
    });
  }
  
  return data;
};

export const getPadangDistricts = (): PadangDistrict[] => {
  return [
    {
      id: 'padang-barat',
      name: 'Padang Barat',
      coordinates: { lat: -0.9492, lng: 100.3543 },
      bounds: { north: -0.940, south: -0.958, east: 100.365, west: 100.343 },
      riskLevel: 'high',
      subsidenceRate: -0.025,
      population: 85000
    },
    {
      id: 'padang-timur',
      name: 'Padang Timur',
      coordinates: { lat: -0.9537, lng: 100.3621 },
      bounds: { north: -0.945, south: -0.962, east: 100.375, west: 100.349 },
      riskLevel: 'medium',
      subsidenceRate: -0.018,
      population: 92000
    },
    {
      id: 'padang-utara',
      name: 'Padang Utara',
      coordinates: { lat: -0.9312, lng: 100.3678 },
      bounds: { north: -0.920, south: -0.942, east: 100.380, west: 100.355 },
      riskLevel: 'low',
      subsidenceRate: -0.012,
      population: 78000
    },
    {
      id: 'padang-selatan',
      name: 'Padang Selatan',
      coordinates: { lat: -0.9712, lng: 100.3456 },
      bounds: { north: -0.960, south: -0.982, east: 100.358, west: 100.333 },
      riskLevel: 'critical',
      subsidenceRate: -0.035,
      population: 105000
    },
    {
      id: 'koto-tangah',
      name: 'Koto Tangah',
      coordinates: { lat: -0.9123, lng: 100.4123 },
      bounds: { north: -0.900, south: -0.925, east: 100.425, west: 100.400 },
      riskLevel: 'medium',
      subsidenceRate: -0.020,
      population: 156000
    },
    {
      id: 'nanggalo',
      name: 'Nanggalo',
      coordinates: { lat: -0.9234, lng: 100.3789 },
      bounds: { north: -0.910, south: -0.937, east: 100.392, west: 100.366 },
      riskLevel: 'low',
      subsidenceRate: -0.015,
      population: 67000
    },
    {
      id: 'pauh',
      name: 'Pauh',
      coordinates: { lat: -0.8956, lng: 100.4234 },
      bounds: { north: -0.880, south: -0.911, east: 100.440, west: 100.407 },
      riskLevel: 'low',
      subsidenceRate: -0.010,
      population: 89000
    },
    {
      id: 'lubuk-kilangan',
      name: 'Lubuk Kilangan',
      coordinates: { lat: -0.9876, lng: 100.4567 },
      bounds: { north: -0.970, south: -1.005, east: 100.475, west: 100.438 },
      riskLevel: 'high',
      subsidenceRate: -0.028,
      population: 72000
    },
    {
      id: 'lubuk-begalung',
      name: 'Lubuk Begalung',
      coordinates: { lat: -0.9654, lng: 100.4321 },
      bounds: { north: -0.950, south: -0.981, east: 100.450, west: 100.414 },
      riskLevel: 'medium',
      subsidenceRate: -0.022,
      population: 94000
    },
    {
      id: 'kuranji',
      name: 'Kuranji',
      coordinates: { lat: -0.9345, lng: 100.4098 },
      bounds: { north: -0.920, south: -0.949, east: 100.425, west: 100.395 },
      riskLevel: 'medium',
      subsidenceRate: -0.019,
      population: 118000
    }
  ];
};