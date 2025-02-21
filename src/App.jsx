import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClipboardCheck as ChessBoard } from 'lucide-react';
import PGNInput from './components/PGNInput';
import Analysis from './components/Analysis';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              <ChessBoard className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-100">Chess Analyzer</span>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<PGNInput />} />
            <Route path="/analysis" element={<Analysis />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;