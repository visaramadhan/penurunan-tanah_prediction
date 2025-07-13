# 🌍 Padang Land Subsidence Prediction System (PLSTM)

## 📋 Overview

Sistem prediksi penurunan tanah Kota Padang menggunakan arsitektur **Parallel Long Short-Term Memory (PLSTM)** untuk analisis dan prediksi penurunan tanah berdasarkan data GNSS/RINEX dengan akurasi tinggi. Sistem ini dirancang khusus untuk monitoring dan prediksi penurunan tanah di 11 kecamatan Kota Padang, Sumatera Barat.

### 🎯 Key Features
- **Real-time Monitoring**: Monitoring penurunan tanah secara real-time
- **PLSTM Neural Network**: Arsitektur neural network paralel untuk prediksi akurat
- **Interactive Google Maps**: Visualisasi interaktif menggunakan Google Maps API
- **Multi-year Analysis**: Analisis data historis 2021-2024 dan prediksi 2026-2030
- **Firebase Integration**: Penyimpanan cloud untuk model dan hasil prediksi
- **Comprehensive Analytics**: Dashboard analitik lengkap dengan grafik real-time

---

## 🛠️ Technology Stack

### **Frontend Technologies**
- **React 18.3.1** - Modern UI framework dengan hooks
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool dan development server
- **Lucide React** - Modern icon library

### **Mapping & Visualization**
- **Google Maps API** - Interactive mapping untuk Kota Padang
- **Recharts** - Advanced charting library untuk visualisasi data
- **Custom Map Styling** - Dark theme sesuai dengan aplikasi

### **Backend & Storage**
- **Firebase Firestore** - NoSQL database untuk penyimpanan model dan data
- **Firebase Storage** - File storage untuk model artifacts
- **Firebase Analytics** - Usage analytics dan monitoring

### **Machine Learning Stack**
- **Custom PLSTM Implementation** - Parallel LSTM architecture
- **Time Series Processing** - Advanced temporal data handling
- **Statistical Analysis** - Comprehensive statistical methods

---

## 🧠 Machine Learning Architecture

### **PLSTM (Parallel Long Short-Term Memory) Model**

#### **Core Architecture**
```
Input Layer → Parallel LSTM Regions → Attention Mechanism → Dense Output
```

#### **Mathematical Foundation**

##### **1. LSTM Cell State Update**
```
fₜ = σ(Wf · [hₜ₋₁, xₜ] + bf)     # Forget Gate
iₜ = σ(Wi · [hₜ₋₁, xₜ] + bi)     # Input Gate  
C̃ₜ = tanh(WC · [hₜ₋₁, xₜ] + bC)  # Candidate Values
Cₜ = fₜ * Cₜ₋₁ + iₜ * C̃ₜ         # Cell State
oₜ = σ(Wo · [hₜ₋₁, xₜ] + bo)     # Output Gate
hₜ = oₜ * tanh(Cₜ)               # Hidden State
```

##### **2. Parallel Processing**
```
Y = Σᵢ₌₁ⁿ wᵢ * LSTMᵢ(Xᵢ)
```
Dimana:
- `n` = Jumlah region paralel
- `wᵢ` = Attention weight untuk region i
- `LSTMᵢ` = LSTM model untuk region i
- `Xᵢ` = Input data untuk region i

##### **3. Subsidence Calculation**
```
S(t) = h₀ - h(t)                 # Basic Subsidence
V(t) = dS/dt                     # Velocity
A(t) = dV/dt                     # Acceleration
Rᵧ = (S / Δt) × 365             # Yearly Rate
```

### **Model Development Process**

#### **File Structure untuk ML Development**
```
src/
├── utils/
│   ├── plstm.ts              # Core PLSTM implementation
│   ├── dataProcessing.ts     # Data preprocessing utilities
│   └── dataLoader.ts         # Data loading dari folder datapdg
├── components/
│   ├── DetailedTraining.tsx  # Training interface dengan algorithm details
│   ├── ModelSelector.tsx     # Model selection dan comparison
│   └── EvaluationMetrics.tsx # Model evaluation dan metrics
├── services/
│   └── firebaseService.ts    # Firebase integration untuk model storage
└── types/
    └── index.ts              # TypeScript definitions untuk ML types
```

#### **Training Pipeline**

##### **1. Data Loading (`src/utils/dataLoader.ts`)**
```typescript
// Membaca struktur folder datapdg/
const loadPadangData = async (): Promise<DataPreview> => {
  // Scan folder 2021, 2022, 2023, 2024
  // Parse RINEX/CSV files
  // Validate data integrity
  // Return unified dataset
}
```

##### **2. Data Preprocessing (`src/utils/dataProcessing.ts`)**
```typescript
// Outlier detection menggunakan IQR method
const removeOutliers = (data: number[]): number[] => {
  const Q1 = percentile(data, 25);
  const Q3 = percentile(data, 75);
  const IQR = Q3 - Q1;
  return data.filter(x => x >= Q1 - 1.5*IQR && x <= Q3 + 1.5*IQR);
}

// Feature engineering
const calculateSubsidence = (data: RinexData[]): ProcessedData[] => {
  return data.map((point, index) => ({
    ...point,
    subsidence: baseHeight - point.height,
    velocity: calculateVelocity(data, index),
    acceleration: calculateAcceleration(data, index)
  }));
}
```

##### **3. PLSTM Training (`src/utils/plstm.ts`)**
```typescript
export class PLSTMModel {
  async train(data: ProcessedData[], config: PLSTMConfig): Promise<ModelMetrics> {
    // 1. Sequence preparation
    const sequences = generateTimeSeriesData(data, config.sequenceLength);
    
    // 2. Regional splitting
    const regions = splitIntoRegions(sequences, config.parallelRegions);
    
    // 3. Parallel LSTM training
    const models = await trainParallelLSTMs(regions, config);
    
    // 4. Attention mechanism training
    const attentionWeights = trainAttentionMechanism(models);
    
    // 5. Model evaluation
    return evaluateModel(models, attentionWeights, testData);
  }
}
```

#### **Model Configuration**
```typescript
interface PLSTMConfig {
  layers: number;           // 2-5 layers optimal
  neurons: number;          // 64-256 neurons per layer
  epochs: number;           // 50-500 epochs
  batchSize: number;        // 16-128 batch size
  learningRate: number;     // 0.001-0.01 learning rate
  parallelRegions: number;  // 2-10 regions
  sequenceLength: number;   // 30-90 days sequence
  dropoutRate: number;      // 0.2-0.3 dropout
  validationSplit: number;  // 0.2-0.3 validation split
}
```

---

## 📊 Data Structure & Variables

### **Input Data Format**
```
datapdg/
├── 2021/
│   ├── station1.csv
│   ├── station2.rinex
│   └── ...
├── 2022/
├── 2023/
└── 2024/
```

### **CSV Format Requirements**
```csv
Date,Easting,Northing,Height,Station_ID
2023-01-01,756432.123,9876543.456,45.678,PDG001
2023-01-02,756432.098,9876543.445,45.672,PDG001
```

### **Variable Categories**

#### **Primary Variables (Wajib)**
- **Easting**: Koordinat UTM Timur (meter)
- **Northing**: Koordinat UTM Utara (meter) 
- **Height**: Ketinggian dari datum (meter)
- **Subsidence**: Target variable untuk prediksi

#### **Secondary Variables (Opsional)**
- **Velocity**: Kecepatan penurunan (m/hari)
- **Acceleration**: Percepatan penurunan (m/hari²)
- **Yearly Subsidence**: Rate penurunan tahunan

#### **Environmental Variables (Opsional)**
- **Temperature**: Suhu udara rata-rata (°C)
- **Precipitation**: Curah hujan (mm/hari)
- **Groundwater Level**: Tinggi muka air tanah (meter)

---

## 🚀 Development Setup

### **Prerequisites**
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Google Maps API Key
Firebase Project Setup
```

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd padang-subsidence-system

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan API keys
```

### **Environment Variables**
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=plstm-3a5a1
```

### **Development Commands**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
```

---

## 🔬 Model Development Guide

### **1. Adding New Variables**
```typescript
// 1. Update types in src/types/index.ts
interface ProcessedData {
  // ... existing fields
  newVariable: number;
}

// 2. Update data processing in src/utils/dataProcessing.ts
const calculateNewVariable = (data: RinexData[]): number => {
  // Implementation
}

// 3. Update variable selection in src/components/DataPreview.tsx
const variableExplanations = {
  newVariable: {
    description: "Description of new variable",
    formula: "Mathematical formula",
    importance: "Variable importance level"
  }
}
```

### **2. Modifying PLSTM Architecture**
```typescript
// src/utils/plstm.ts
export class PLSTMModel {
  // Modify architecture parameters
  private buildModel(config: PLSTMConfig): Model {
    // Add new layers
    // Modify attention mechanism
    // Update loss functions
  }
}
```

### **3. Adding New Evaluation Metrics**
```typescript
// src/components/EvaluationMetrics.tsx
interface ModelMetrics {
  // ... existing metrics
  newMetric: number;
}

const calculateNewMetric = (predictions: number[], actual: number[]): number => {
  // Implementation
}
```

---

## 📈 Performance Optimization

### **Model Performance Guidelines**
- **Sequence Length**: 30-60 hari untuk pola bulanan, 90+ untuk seasonal
- **Batch Size**: 16-32 untuk GPU terbatas, 64-128 untuk GPU kuat
- **Learning Rate**: 0.001 (default), 0.0001 untuk fine-tuning
- **Epochs**: 50-200 untuk data kecil, 200-500 untuk data besar

### **Data Quality Requirements**
- **Minimum Duration**: 30 hari data kontinyu
- **Maximum Gap**: Hindari gap > 7 hari berturut-turut
- **Spatial Coverage**: Minimal 5 titik monitoring per kecamatan
- **Temporal Resolution**: Data harian optimal

---

## 🗺️ Padang City Integration

### **District Coverage**
Sistem mencakup 11 kecamatan di Kota Padang:
1. Padang Barat (High Risk)
2. Padang Timur (Medium Risk)
3. Padang Utara (Low Risk)
4. Padang Selatan (Critical Risk)
5. Koto Tangah (Medium Risk)
6. Nanggalo (Low Risk)
7. Pauh (Low Risk)
8. Lubuk Kilangan (High Risk)
9. Lubuk Begalung (Medium Risk)
10. Kuranji (Medium Risk)

### **Risk Classification**
- **Low**: < 1.5 cm/tahun (Hijau)
- **Medium**: 1.5-2.0 cm/tahun (Kuning)
- **High**: 2.0-3.0 cm/tahun (Orange)
- **Critical**: > 3.0 cm/tahun (Merah)

---

## 🔧 API Integration

### **Firebase Services**
```typescript
// Model storage
await FirebaseService.saveModel(name, config, metrics, modelBlob);

// Prediction storage  
await FirebaseService.savePredictions(modelId, predictions);

// Model retrieval
const models = await FirebaseService.getModels();
```

### **Google Maps Integration**
```typescript
// Map initialization
const map = new google.maps.Map(mapRef.current, {
  center: { lat: -0.9492, lng: 100.3543 }, // Padang center
  zoom: 12,
  mapTypeId: google.maps.MapTypeId.ROADMAP
});

// Marker creation
const marker = new google.maps.Marker({
  position: { lat: point.latitude, lng: point.longitude },
  map: map,
  icon: { /* custom styling */ }
});
```

---

## 📚 Research & References

### **Scientific Foundation**
- **LSTM Networks**: Hochreiter & Schmidhuber (1997)
- **Attention Mechanisms**: Bahdanau et al. (2014)
- **Land Subsidence Modeling**: Galloway & Burbey (2011)
- **GNSS Time Series Analysis**: Blewitt & Lavallée (2002)

### **Implementation References**
- **Parallel LSTM**: Custom implementation based on spatial decomposition
- **Attention Mechanism**: Soft attention for regional weight calculation
- **Time Series Processing**: Sliding window approach with temporal features

---

## 🤝 Contributing

### **Development Workflow**
1. Fork repository
2. Create feature branch
3. Implement changes dengan tests
4. Update documentation
5. Submit pull request

### **Code Standards**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive comments untuk ML algorithms

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

Untuk pertanyaan teknis atau pengembangan lebih lanjut:
- **Email**: [your-email@domain.com]
- **Documentation**: [project-docs-url]
- **Issues**: [github-issues-url]

---

**Developed with ❤️ for Padang City Land Subsidence Monitoring**