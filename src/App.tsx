import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Brain, BarChart3, MapPin, Menu, X } from 'lucide-react';
import { Training } from './pages/Training';
import { Prediction } from './pages/Prediction';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SubsidenceAI</h1>
              <p className="text-xs text-gray-600">PLSTM Prediction System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Brain className="h-5 w-5" />
              <span>Model Training</span>
            </Link>
            <Link
              to="/prediction"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/prediction') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Real-Time Prediction</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Brain className="h-5 w-5" />
                <span>Model Training</span>
              </Link>
              <Link
                to="/prediction"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/prediction') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Real-Time Prediction</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Land Subsidence Prediction System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Advanced PLSTM (Parallel Long Short-Term Memory) model for accurate land subsidence 
            prediction using high-precision RINEX data from GNSS measurements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Training
            </Link>
            <Link
              to="/prediction"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Live Prediction
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              PLSTM Architecture
            </h3>
            <p className="text-gray-600">
              Parallel processing of geospatial time-series data with high accuracy 
              and computational efficiency.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Real-Time Analysis
            </h3>
            <p className="text-gray-600">
              Continuous monitoring and prediction of land subsidence patterns 
              with risk assessment capabilities.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              RINEX Integration
            </h3>
            <p className="text-gray-600">
              High-precision GPS measurements from RINEX data for accurate 
              spatial and temporal analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Training />} />
          <Route path="/prediction" element={<Prediction />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;