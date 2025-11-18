import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/config/firebase';
import { getAllGames } from '@/services/gameService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const gamesData = await getAllGames();
      setGames(gamesData);
    } catch (err) {
      console.error('Error loading games:', err);
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(19, 16, 35, 0.85) 0%, rgba(19, 16, 35, 0.95) 100%), url("https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop")`,
        }}
      />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="border-b border-[#330df2]/20 bg-[#131022]/50 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                  GAME LIBRARY
                </h1>
                <p className="text-gray-400">
                  {user?.displayName
                    ? `Welcome back, ${user.displayName}`
                    : 'Welcome to your Game Library'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="px-6 py-3 bg-[#330df2] text-white font-semibold rounded-lg hover:bg-[#4a1fff] transition-all hover:shadow-lg hover:shadow-[#330df2]/50"
                >
                  + Add Game
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 border border-red-500/50 text-red-400 font-semibold rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#131022]/70 backdrop-blur-sm border border-[#330df2]/20 rounded-lg shadow-lg shadow-[#330df2]/10 p-6 hover:border-[#330df2]/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Games
                  </p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {games.length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#330df2]/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#330df2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#131022]/70 backdrop-blur-sm border border-[#330df2]/20 rounded-lg shadow-lg shadow-[#330df2]/10 p-6 hover:border-[#330df2]/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Featured</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {games.filter((g) => g.featured).length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#131022]/70 backdrop-blur-sm border border-[#330df2]/20 rounded-lg shadow-lg shadow-[#330df2]/10 p-6 hover:border-[#330df2]/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Plays
                  </p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {games.reduce((acc, game) => acc + (game.plays || 0), 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - Games Grid */}
          <div className="bg-[#131022]/70 backdrop-blur-sm border border-[#330df2]/20 rounded-lg shadow-2xl shadow-[#330df2]/10 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight">
                ALL GAMES
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">
                  {games.length} games available
                </span>
              </div>
            </div>

            {loading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#330df2]/30 border-t-[#330df2] mb-4"></div>
                <p className="mt-4 text-gray-400 text-lg">Loading games...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {!loading && !error && games.length === 0 && (
              <div className="text-center py-16">
                <svg
                  className="w-20 h-20 mx-auto mb-4 text-[#330df2]/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-xl text-white font-semibold mb-2">
                  No games in your library yet
                </p>
                <p className="text-gray-400 mb-6">
                  Start adding games to build your collection!
                </p>
                <button
                  onClick={() => navigate('/admin')}
                  className="px-6 py-3 bg-[#330df2] text-white font-semibold rounded-lg hover:bg-[#4a1fff] transition-all hover:shadow-lg hover:shadow-[#330df2]/50"
                >
                  + Add Your First Game
                </button>
              </div>
            )}

            {!loading && !error && games.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="group bg-[#1a1729]/80 border border-[#330df2]/20 rounded-lg overflow-hidden hover:border-[#330df2]/60 hover:shadow-2xl hover:shadow-[#330df2]/20 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/play/${game.slug}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                      {game.thumbnail ? (
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#330df2]/40 to-purple-900/40">
                          <svg
                            className="w-16 h-16 text-[#330df2]/50"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                          </svg>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {game.featured && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-yellow-500/90 backdrop-blur-sm text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                            ⭐ FEATURED
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Game Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-[#330df2] transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-sm text-[#330df2] mb-2 font-medium">
                        {game.category || 'Uncategorized'}
                      </p>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2 min-h-[40px]">
                        {game.description || 'No description available'}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-400">
                            {game.plays || 0} plays
                          </span>
                        </div>
                        {/* Multiplayer */}
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13 7H7v6h6V7z" />
                            <path
                              fillRule="evenodd"
                              d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm10 12H5V5h10v10z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-400">
                            {game.multiplayer ? 'Multiplayer' : 'Single Player'}
                          </span>
                        </div>
                      </div>

                      {/* Play Button */}
                      <button className="w-full bg-[#330df2] text-white py-2.5 rounded-lg hover:bg-[#4a1fff] transition-all font-semibold group-hover:shadow-lg group-hover:shadow-[#330df2]/50">
                        PLAY NOW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
