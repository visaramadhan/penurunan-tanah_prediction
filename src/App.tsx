import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Brain, BarChart3, MapPin, Menu, X, BookOpen, Map } from 'lucide-react';
import { Training } from './pages/Training';
import { Prediction } from './pages/Prediction';
import { Documentation } from './pages/Documentation';
import { MapView } from './pages/MapView';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-900 shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SubsidenceAI</h1>
              <p className="text-xs text-gray-300">PLSTM Prediction System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-green-800 text-green-300' 
                  : 'text-gray-300 hover:text-green-400'
              }`}
            >
              <Brain className="h-5 w-5" />
              <span>Model Training</span>
            </Link>
            <Link
              to="/documentation"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/documentation') 
                  ? 'bg-green-800 text-green-300' 
                  : 'text-gray-300 hover:text-green-400'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Documentation</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-green-800 text-green-300' 
                    : 'text-gray-300 hover:text-green-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Brain className="h-5 w-5" />
                <span>Model Training</span>
              </Link>
              <Link
                to="/documentation"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/documentation') 
                    ? 'bg-green-800 text-green-300' 
                    : 'text-gray-300 hover:text-green-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-5 w-5" />
                <span>Documentation</span>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Land Subsidence Prediction System
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Advanced PLSTM (Parallel Long Short-Term Memory) model for accurate land subsidence 
            prediction using high-precision RINEX data from GNSS measurements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Training
            </Link>
            <Link
              to="/prediction"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Live Prediction
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              PLSTM Architecture
            </h3>
            <p className="text-gray-300">
              Parallel processing of geospatial time-series data with high accuracy 
              and computational efficiency.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Real-Time Analysis
            </h3>
            <p className="text-gray-300">
              Continuous monitoring and prediction of land subsidence patterns 
              with risk assessment capabilities.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              RINEX Integration
            </h3>
            <p className="text-gray-300">
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
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;