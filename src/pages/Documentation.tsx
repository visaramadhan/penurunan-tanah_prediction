import React, { useState } from 'react';
import { BookOpen, Calculator, MapPin, TrendingUp, FileText, AlertTriangle, Info, ChevronDown, ChevronRight } from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null);

  const sections = [
    { id: 'overview', title: 'System Overview', icon: BookOpen },
    { id: 'guide', title: 'Usage Guide', icon: FileText },
    { id: 'formulas', title: 'Mathematical Formulas', icon: Calculator },
    { id: 'rinex', title: 'RINEX Data Format', icon: MapPin },
    { id: 'plstm', title: 'PLSTM Architecture', icon: TrendingUp },
    { id: 'interpretation', title: 'Result Interpretation', icon: Info }
  ];

  const formulas = [
    {
      id: 'subsidence',
      title: 'Land Subsidence Calculation',
      formula: 'S = h₀ - hₜ',
      description: 'Where S is subsidence, h₀ is initial height, hₜ is height at time t',
      expanded: `
        Land subsidence is calculated as the vertical displacement between two time periods:
        
        S = h₀ - hₜ
        
        Where:
        • S = Land subsidence (meters)
        • h₀ = Initial height measurement (meters)
        • hₜ = Height measurement at time t (meters)
        
        Positive values indicate subsidence (sinking), negative values indicate uplift.
      `
    },
    {
      id: 'yearly-rate',
      title: 'Yearly Subsidence Rate',
      formula: 'Rᵧ = S / Δt × 365',
      description: 'Annual subsidence rate calculation',
      expanded: `
        The yearly subsidence rate normalizes subsidence measurements to an annual scale:
        
        Rᵧ = (S / Δt) × 365
        
        Where:
        • Rᵧ = Yearly subsidence rate (meters/year)
        • S = Total subsidence over period (meters)
        • Δt = Time period in days
        • 365 = Days per year conversion factor
      `
    },
    {
      id: 'lstm-cell',
      title: 'LSTM Cell State Update',
      formula: 'Cₜ = fₜ * Cₜ₋₁ + iₜ * C̃ₜ',
      description: 'Long Short-Term Memory cell state computation',
      expanded: `
        The LSTM cell state update mechanism:
        
        Cₜ = fₜ * Cₜ₋₁ + iₜ * C̃ₜ
        
        Where:
        • Cₜ = Cell state at time t
        • fₜ = Forget gate activation
        • Cₜ₋₁ = Previous cell state
        • iₜ = Input gate activation
        • C̃ₜ = Candidate values
        
        This allows the network to selectively remember and forget information.
      `
    },
    {
      id: 'parallel-processing',
      title: 'Parallel LSTM Processing',
      formula: 'Y = Σᵢ₌₁ⁿ wᵢ * LSTMᵢ(Xᵢ)',
      description: 'Weighted combination of parallel LSTM outputs',
      expanded: `
        Parallel LSTM processing combines multiple regional models:
        
        Y = Σᵢ₌₁ⁿ wᵢ * LSTMᵢ(Xᵢ)
        
        Where:
        • Y = Final prediction output
        • n = Number of parallel regions
        • wᵢ = Weight for region i
        • LSTMᵢ = LSTM model for region i
        • Xᵢ = Input data for region i
        
        This approach captures spatial heterogeneity in subsidence patterns.
      `
    }
  ];

  const toggleFormula = (formulaId: string) => {
    setExpandedFormula(expandedFormula === formulaId ? null : formulaId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">System Overview</h3>
              <p className="text-gray-300 mb-6">
                The Land Subsidence Prediction System uses advanced machine learning techniques to analyze 
                and predict ground movement patterns using high-precision GNSS data from RINEX files.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Key Features</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Multi-file RINEX data processing</li>
                    <li>• Parallel LSTM architecture</li>
                    <li>• Real-time prediction capabilities</li>
                    <li>• Interactive mapping visualization</li>
                    <li>• Risk assessment and alerts</li>
                  </ul>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Technical Specifications</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Coordinate System: UTM 48S</li>
                    <li>• Precision: Sub-millimeter accuracy</li>
                    <li>• Temporal Resolution: Daily measurements</li>
                    <li>• Spatial Coverage: Regional analysis</li>
                    <li>• Model Type: PLSTM Neural Network</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Workflow Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: 1, title: 'Data Upload', desc: 'Upload RINEX files from GNSS stations' },
                  { step: 2, title: 'Processing', desc: 'Convert coordinates and calculate subsidence' },
                  { step: 3, title: 'Training', desc: 'Train PLSTM model with time-series data' },
                  { step: 4, title: 'Prediction', desc: 'Generate real-time subsidence predictions' }
                ].map((item) => (
                  <div key={item.step} className="bg-gray-900 rounded-lg p-4 border border-gray-600 text-center">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      {item.step}
                    </div>
                    <h4 className="text-white font-medium mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'guide':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Usage Guide</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Step 1: Data Preparation</h4>
                  <div className="space-y-3 text-gray-300">
                    <p>• Collect RINEX files from your GNSS stations</p>
                    <p>• Ensure files cover the desired time period</p>
                    <p>• Supported formats: .rinex, .o, .n, .g, .csv, .xlsx</p>
                    <p>• Multiple files can be uploaded for multi-year analysis</p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Step 2: Model Training</h4>
                  <div className="space-y-3 text-gray-300">
                    <p>• Upload your RINEX files using the file upload interface</p>
                    <p>• Configure PLSTM parameters (layers, neurons, epochs)</p>
                    <p>• Monitor training progress through the step-by-step interface</p>
                    <p>• Review model performance metrics upon completion</p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Step 3: Real-Time Prediction</h4>
                  <div className="space-y-3 text-gray-300">
                    <p>• Navigate to the Prediction page</p>
                    <p>• Start real-time monitoring with the trained model</p>
                    <p>• View predictions, confidence levels, and risk assessments</p>
                    <p>• Monitor subsidence patterns on the interactive map</p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Step 4: Analysis & Export</h4>
                  <div className="space-y-3 text-gray-300">
                    <p>• Download trained models for future use</p>
                    <p>• Export cleaned data and prediction results</p>
                    <p>• Generate reports with visualizations</p>
                    <p>• Set up alerts for critical subsidence levels</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-yellow-200 font-medium mb-1">Important Notes</h4>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    <li>• Ensure RINEX files are properly formatted and complete</li>
                    <li>• Larger datasets require more training time but provide better accuracy</li>
                    <li>• Regular model retraining is recommended for optimal performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'formulas':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Mathematical Formulas</h3>
              <p className="text-gray-300 mb-6">
                Understanding the mathematical foundations behind land subsidence calculations and PLSTM modeling.
              </p>
              
              <div className="space-y-4">
                {formulas.map((formula) => (
                  <div key={formula.id} className="bg-gray-900 rounded-lg border border-gray-600">
                    <button
                      onClick={() => toggleFormula(formula.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{formula.title}</h4>
                        <div className="font-mono text-green-400 text-lg mb-1">{formula.formula}</div>
                        <p className="text-gray-400 text-sm">{formula.description}</p>
                      </div>
                      {expandedFormula === formula.id ? 
                        <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    
                    {expandedFormula === formula.id && (
                      <div className="px-4 pb-4 border-t border-gray-700">
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap mt-3 bg-gray-800 p-3 rounded">
                          {formula.expanded}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'rinex':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">RINEX Data Format</h3>
              <p className="text-gray-300 mb-6">
                RINEX (Receiver Independent Exchange Format) is the standard format for GNSS observation data.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Supported File Types</h4>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>.rinex - Standard RINEX format</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>.o - Observation files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>.n - Navigation files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>.g - GLONASS navigation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>.csv - Processed coordinate data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>.xlsx - Excel coordinate data</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Data Requirements</h4>
                  <div className="space-y-2 text-gray-300">
                    <p>• Minimum 30 days of continuous data</p>
                    <p>• Daily observation intervals</p>
                    <p>• UTM 48S coordinate system preferred</p>
                    <p>• Sub-meter positioning accuracy</p>
                    <p>• Complete observation epochs</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 mt-6">
                <h4 className="text-lg font-semibold text-green-400 mb-3">Sample Data Structure</h4>
                <pre className="text-gray-300 text-sm bg-gray-800 p-3 rounded overflow-x-auto">
{`Date,Easting,Northing,Height,Quality
2023-01-01,756432.123,9876543.456,45.678,1
2023-01-02,756432.098,9876543.445,45.672,1
2023-01-03,756432.089,9876543.441,45.669,1
...`}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'plstm':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">PLSTM Architecture</h3>
              <p className="text-gray-300 mb-6">
                Parallel Long Short-Term Memory (PLSTM) networks process multiple spatial regions simultaneously 
                for improved subsidence prediction accuracy.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Architecture Components</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-3">
                      <h5 className="text-white font-medium">Input Layer</h5>
                      <p className="text-gray-400 text-sm">Time-series sequences of coordinate data</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h5 className="text-white font-medium">Parallel LSTM Layers</h5>
                      <p className="text-gray-400 text-sm">Multiple LSTM networks for different regions</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-3">
                      <h5 className="text-white font-medium">Attention Mechanism</h5>
                      <p className="text-gray-400 text-sm">Weighted combination of regional outputs</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-3">
                      <h5 className="text-white font-medium">Output Layer</h5>
                      <p className="text-gray-400 text-sm">Subsidence prediction with confidence</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Model Parameters</h4>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>LSTM Layers:</span>
                      <span className="text-green-400">2-5 layers</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Neurons per Layer:</span>
                      <span className="text-green-400">64-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sequence Length:</span>
                      <span className="text-green-400">30-90 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parallel Regions:</span>
                      <span className="text-green-400">2-10 regions</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Learning Rate:</span>
                      <span className="text-green-400">0.001-0.01</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-green-400 mb-3">Training Process</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                    <h5 className="text-white font-medium mb-1">Data Preparation</h5>
                    <p className="text-gray-400 text-sm">Sequence generation and regional splitting</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                    <h5 className="text-white font-medium mb-1">Parallel Training</h5>
                    <p className="text-gray-400 text-sm">Simultaneous training of regional models</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                    <h5 className="text-white font-medium mb-1">Model Fusion</h5>
                    <p className="text-gray-400 text-sm">Combining outputs with attention weights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'interpretation':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Result Interpretation</h3>
              <p className="text-gray-300 mb-6">
                Understanding model outputs, risk levels, and confidence metrics for effective decision-making.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Risk Level Classification</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div>
                        <span className="text-white font-medium">Low Risk</span>
                        <p className="text-gray-400 text-sm">Subsidence < 0.1m/year</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <div>
                        <span className="text-white font-medium">Medium Risk</span>
                        <p className="text-gray-400 text-sm">0.1-0.3m/year subsidence</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <div>
                        <span className="text-white font-medium">High Risk</span>
                        <p className="text-gray-400 text-sm">0.3-0.5m/year subsidence</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <div>
                        <span className="text-white font-medium">Critical Risk</span>
                        <p className="text-gray-400 text-sm">Subsidence > 0.5m/year</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Confidence Levels</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white">90-100%</span>
                      <span className="text-green-400">Excellent</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">80-89%</span>
                      <span className="text-blue-400">Good</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">70-79%</span>
                      <span className="text-yellow-400">Fair</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">< 70%</span>
                      <span className="text-red-400">Poor</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-green-400 mb-3">Model Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <h5 className="text-white font-medium mb-1">MSE</h5>
                    <p className="text-gray-400 text-sm">Mean Squared Error measures average squared differences</p>
                  </div>
                  <div className="text-center">
                    <h5 className="text-white font-medium mb-1">RMSE</h5>
                    <p className="text-gray-400 text-sm">Root Mean Squared Error in original units</p>
                  </div>
                  <div className="text-center">
                    <h5 className="text-white font-medium mb-1">MAE</h5>
                    <p className="text-gray-400 text-sm">Mean Absolute Error shows average deviation</p>
                  </div>
                  <div className="text-center">
                    <h5 className="text-white font-medium mb-1">Accuracy</h5>
                    <p className="text-gray-400 text-sm">Overall prediction accuracy percentage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-xl text-gray-300">
            Comprehensive guide to using the Land Subsidence Prediction System
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};