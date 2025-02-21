import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ChessProfile, ChessGame } from './types';
import { ProfileSearch } from './components/ProfileSearch';
import { ProfileCard } from './components/ProfileCard';
import { GamesList } from './components/GamesList';
import { Analysis } from './components/Analysis';
import { Crown as ChessBoard } from "lucide-react";

function App() {
  const [profile, setProfile] = useState<ChessProfile | null>(null);
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'games'>('profile');

  const fetchProfile = async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://api.chess.com/pub/player/${username}`);
      setProfile(response.data);
      
      // Fetch games when profile is loaded
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const gamesResponse = await axios.get(
        `https://api.chess.com/pub/player/${username}/games/${year}/${month}`
      );
      setGames(gamesResponse.data.games.sort((a: ChessGame, b: ChessGame) => 
        b.end_time - a.end_time
      ));
    } catch (err) {
      setError('Failed to fetch profile. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const MainContent = () => (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ChessBoard className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-100">Decode - CHESS</span>
            </div>
            {profile && (
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                    activeTab === 'profile'
                      ? 'text-gray-900 bg-blue-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('games')}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                    activeTab === 'games'
                      ? 'text-gray-900 bg-blue-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Games
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search */}
        <ProfileSearch onSearch={fetchProfile} />

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mt-4 p-4 bg-red-900/50 rounded-lg text-red-200 border border-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-md mx-auto mt-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          </div>
        )}

        {/* Content */}
        {profile && !loading && (
          <div className="mt-6">
            {activeTab === 'profile' ? (
              <ProfileCard profile={profile} />
            ) : (
              <GamesList games={games} username={profile.username} />
            )}
          </div>
        )}
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </Router>
  );
}

export default App;