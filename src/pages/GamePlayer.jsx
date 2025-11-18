import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getGameBySlug, incrementPlayCount } from '@/services/gameService';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '@/config/firebase';
import {
  createRoom,
  joinRoom,
  listenToRoom,
  leaveRoom,
  listenToActiveRooms,
  getActiveRooms,
} from '@/services/roomService';

const GamePlayer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Multiplayer states
  const [gameMode, setGameMode] = useState(null); // null (not selected), 'single' or 'multi'
  const [room, setRoom] = useState(null);
  const [showMultiplayerMenu, setShowMultiplayerMenu] = useState(false);
  const [showRoomsList, setShowRoomsList] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const iframeRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const unsubscribeRoomsRef = useRef(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    loadGame();

    // Check if joining via room link
    const roomId = searchParams.get('room');
    if (roomId && currentUser) {
      handleJoinRoomFromLink(roomId);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (unsubscribeRoomsRef.current) {
        unsubscribeRoomsRef.current();
      }
      if (room && currentUser) {
        leaveRoom(room.id, currentUser.email);
      }
    };
  }, [slug, currentUser]);

  // Auto-select single mode for non-multiplayer games
  useEffect(() => {
    if (game && !game.multiplayer && gameMode === null) {
      setGameMode('single');
    }
  }, [game]);

  // Send multiplayer data to iframe
  useEffect(() => {
    if (room && iframeRef.current && currentUser) {
      const message = {
        type: 'INIT_MULTIPLAYER',
        email: currentUser.email,
        displayName: currentUser.displayName,
        roomId: room.id,
        gameState: room.gameState,
        currentTurn: room.currentTurn,
      };

      // Wait for iframe to load
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(message, '*');
      }, 1000);
    }
  }, [room, currentUser]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const gameData = await getGameBySlug(slug);

      if (!gameData) {
        setError('Game not found');
        return;
      }

      setGame(gameData);

      // Increment play count
      if (gameData.id) {
        await incrementPlayCount(gameData.id);
      }
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById('game-iframe');

    if (!document.fullscreenElement) {
      iframe.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleRestart = () => {
    const iframe = document.getElementById('game-iframe');
    iframe.src = iframe.src; // Reload iframe
  };

  // Show multiplayer menu and load rooms
  const handleShowMultiplayer = async () => {
    if (!isAuthenticated) {
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        console.error('Failed to sign in:', err);
        return;
      }
    }

    setShowMultiplayerMenu(true);
    setShowRoomsList(true);

    if (unsubscribeRoomsRef.current) {
      unsubscribeRoomsRef.current();
    }
    unsubscribeRoomsRef.current = listenToActiveRooms(slug, (rooms) => {
      setActiveRooms(rooms);
    });
  };

  // Create new multiplayer room
  const handleCreateRoom = async () => {
    try {
      setCreatingRoom(true);
      const roomId = await createRoom(
        slug,
        currentUser.email,
        currentUser.displayName
      );

      // Listen to room updates
      unsubscribeRef.current = listenToRoom(roomId, (roomData) => {
        if (roomData) {
          setRoom(roomData);
          if (roomData.status === 'playing') {
            setGameMode('multi');
          }
        }
      });

      setGameMode('multi');
      setShowMultiplayerMenu(false);
      setShowRoomsList(false);

      // Stop listening to rooms list
      if (unsubscribeRoomsRef.current) {
        unsubscribeRoomsRef.current();
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room. Please try again.');
    } finally {
      setCreatingRoom(false);
    }
  };

  // Join existing room
  const handleJoinRoom = async (roomId) => {
    try {
      setJoiningRoom(true);
      await joinRoom(roomId, currentUser.email, currentUser.displayName);

      // Listen to room updates
      unsubscribeRef.current = listenToRoom(roomId, (roomData) => {
        if (roomData) {
          setRoom(roomData);
          if (roomData.status === 'playing') {
            setGameMode('multi');
          }
        }
      });

      setGameMode('multi');
      setShowMultiplayerMenu(false);
      setShowRoomsList(false);

      // Stop listening to rooms list
      if (unsubscribeRoomsRef.current) {
        unsubscribeRoomsRef.current();
      }
    } catch (err) {
      console.error('Failed to join room:', err);
      alert('Failed to join room. ' + err.message);
    } finally {
      setJoiningRoom(false);
    }
  };

  // Join room from link
  const handleJoinRoomFromLink = async (roomId) => {
    console.log(
      'Joining room from link:',
      roomId,
      isAuthenticated,
      currentUser
    );
    if (!isAuthenticated) {
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        console.error('Failed to sign in:', err);
        return;
      }
    }

    try {
      setJoiningRoom(true);
      await joinRoom(roomId, currentUser.email, currentUser.displayName);

      // Listen to room updates
      unsubscribeRef.current = listenToRoom(roomId, (roomData) => {
        if (roomData) {
          setRoom(roomData);
          if (roomData.status === 'playing') {
            setGameMode('multi');
          }
        }
      });

      setGameMode('multi');
    } catch (err) {
      console.error('Failed to join room:', err);
      alert('Failed to join room. Room may be full or not found.');
    } finally {
      setJoiningRoom(false);
    }
  };

  // Copy room link
  const handleCopyRoomLink = () => {
    if (!room) return;

    const link = `${window.location.origin}/play/${slug}?room=${room.id}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied! Share it with your friend.');
  };

  // Leave room
  const handleLeaveRoom = async () => {
    if (room && currentUser) {
      try {
        await leaveRoom(room.id, currentUser.email);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        setRoom(null);
        setGameMode('single');
        handleRestart();
      } catch (err) {
        console.error('Failed to leave room:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-indigo-500 mb-4"></div>
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">
            {error || 'Game not found'}
          </h2>
          <button
            onClick={handleBack}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Mode Selection Screen for multiplayer games
  if (game.multiplayer && gameMode === null) {
    return (
      <div className="min-h-screen bg-[#131022] relative overflow-hidden">
        {/* Background Effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("${game.thumbnail}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#131022]/90 via-[#131022]/95 to-[#131022]" />

        {/* Content */}
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl w-full">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Dashboard</span>
            </button>

            {/* Game Info Header */}
            <div className="text-center mb-12">
              <div className="inline-block mb-6">
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-32 h-32 rounded-2xl shadow-2xl border-4 border-[#330df2]/50 object-cover"
                />
              </div>
              <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
                {game.title}
              </h1>
              <p className="text-xl text-gray-400">{game.category}</p>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Single Player */}
              <button
                onClick={() => setGameMode('single')}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-[#330df2] rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#330df2]/20"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Single Player
                  </h3>
                  <p className="text-gray-400">
                    Play solo and enjoy the game at your own pace
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-[#330df2] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Multiplayer */}
              <button
                onClick={handleShowMultiplayer}
                className="group relative bg-gradient-to-br from-purple-900/30 to-[#330df2]/20 backdrop-blur-sm border-2 border-[#330df2]/50 hover:border-[#330df2] rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#330df2]/40"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#330df2] to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Multiplayer
                  </h3>
                  <p className="text-gray-400">
                    Play with friends online in real-time
                  </p>
                  {!isAuthenticated && (
                    <p className="text-xs text-yellow-400 mt-3 flex items-center justify-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Login required
                    </p>
                  )}
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-[#330df2] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {/* Game Description */}
            {game.description && (
              <div className="mt-8 text-center">
                <p className="text-gray-400 max-w-2xl mx-auto">
                  {game.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Multiplayer Rooms List Modal */}
        {showMultiplayerMenu && showRoomsList && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-[#330df2]/50 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Multiplayer Rooms
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Join an existing room or create a new one
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMultiplayerMenu(false);
                    setShowRoomsList(false);
                    if (unsubscribeRoomsRef.current) {
                      unsubscribeRoomsRef.current();
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Create Room Button */}
                <button
                  onClick={handleCreateRoom}
                  disabled={creatingRoom}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#330df2] to-purple-600 text-white rounded-xl font-semibold hover:from-[#4a1fff] hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg shadow-[#330df2]/20"
                >
                  {creatingRoom ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating Room...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create New Room
                    </span>
                  )}
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-400">
                      Or join an existing room
                    </span>
                  </div>
                </div>

                {/* Rooms List */}
                <div className="max-h-[40vh] overflow-y-auto space-y-3">
                  {activeRooms.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="w-16 h-16 mx-auto text-gray-700 mb-4"
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
                      <p className="text-gray-400 text-lg font-medium">
                        No rooms available
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Be the first to create a room!
                      </p>
                    </div>
                  ) : (
                    activeRooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-[#330df2]/50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#330df2] to-purple-600 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">
                                  {room.playerNames?.[0] || 'Player'}'s Room
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-400">
                                    {room.players?.length || 0}/2 players
                                  </span>
                                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                  <span className="text-xs text-green-400 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Waiting
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleJoinRoom(room.id)}
                            disabled={
                              joiningRoom ||
                              room.players?.length >= 2 ||
                              room.players?.includes(currentUser?.email)
                            }
                            className="px-4 py-2 bg-[#330df2] text-white rounded-lg hover:bg-[#4a1fff] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {room.players?.includes(currentUser?.email)
                              ? 'Joined'
                              : joiningRoom
                              ? 'Joining...'
                              : 'Join'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-900 overflow-hidden flex flex-col">
      {/* Header Controls */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Back</span>
            </button>

            <div className="h-6 w-px bg-gray-700"></div>

            <div>
              <h1 className="text-white font-bold text-lg">{game.title}</h1>
              <p className="text-gray-400 text-sm">{game.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Indicator */}
            {gameMode === 'single' && !game.multiplayer && (
              <div className="px-4 py-2 bg-blue-600/20 border border-blue-500 rounded-lg">
                <span className="text-blue-400 text-sm font-medium">
                  Single Player
                </span>
              </div>
            )}

            {/* Multiplayer Controls */}
            {game.multiplayer && gameMode === 'single' && (
              <button
                onClick={() => {
                  setGameMode(null);
                  handleRestart();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#330df2] text-white rounded-lg hover:bg-[#4a1fff] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="hidden sm:inline">Switch to Multiplayer</span>
              </button>
            )}

            {gameMode === 'multi' && (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-green-600/20 border border-green-500 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">
                      {room?.status === 'waiting'
                        ? 'Waiting for opponent...'
                        : `Multiplayer • ${room?.players?.length || 0}/2`}
                    </span>
                  </div>
                </div>
                {room?.status === 'waiting' && (
                  <button
                    onClick={handleCopyRoomLink}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    title="Copy room link"
                  >
                    📋 Copy Link
                  </button>
                )}
                <button
                  onClick={handleLeaveRoom}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Leave
                </button>
              </div>
            )}

            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title="Restart Game"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Restart</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              title="Toggle Fullscreen"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isFullscreen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                )}
              </svg>
              <span className="hidden sm:inline">
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="container mx-auto p-4">
        <div
          className="bg-black rounded-lg overflow-hidden shadow-2xl"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          <iframe
            id="game-iframe"
            ref={iframeRef}
            src={game.gameUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals"
            title={game.title}
          />
        </div>

        {/* Game Info Footer */}
      </div>
    </div>
  );
};

export default GamePlayer;
