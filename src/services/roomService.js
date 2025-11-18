import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  orderBy,
} from 'firebase/firestore';

const roomsCollection = collection(db, 'rooms');

/**
 * Create a new multiplayer room
 * @param {string} gameSlug - The slug of the game
 * @param {string} playerEmail - Email of the player creating the room
 * @returns {Promise<string>} - Room ID
 */
export const createRoom = async (gameSlug, playerEmail, playerName = '') => {
  try {
    const roomData = {
      gameSlug,
      players: [playerEmail],
      playerNames: playerName ? [playerName] : [],
      currentTurn: playerEmail,
      gameState: {
        // Default empty state - each game will populate this
      },
      status: 'waiting', // waiting, playing, finished
      winner: null,
      createdBy: playerEmail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(roomsCollection, roomData);
    console.log('Room created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Join an existing room
 * @param {string} roomId - The ID of the room to join
 * @param {string} playerEmail - Email of the player joining
 * @returns {Promise<void>}
 */
export const joinRoom = async (roomId, playerEmail, playerName = '') => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }

    const roomData = roomSnap.data();

    // Check if room is full
    if (roomData.players.length >= 2) {
      throw new Error('Room is full');
    }

    // Check if player already in room
    if (roomData.players.includes(playerEmail)) {
      console.log('Player already in room');
      return;
    }

    // Add player to room
    const updateData = {
      players: arrayUnion(playerEmail),
      status: 'playing', // Start game when 2 players joined
      updatedAt: serverTimestamp(),
    };

    if (playerName) {
      updateData.playerNames = arrayUnion(playerName);
    }

    await updateDoc(roomRef, updateData);
    console.log('Joined room:', roomId);
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

/**
 * Leave a room
 * @param {string} roomId - The ID of the room to leave
 * @param {string} playerEmail - Email of the player leaving
 * @returns {Promise<void>}
 */
export const leaveRoom = async (roomId, playerEmail) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.log('Room not found');
      return;
    }

    const roomData = roomSnap.data();

    // If room has only 1 player, delete the room
    if (roomData.players.length <= 1) {
      await deleteDoc(roomRef);
      console.log('Room deleted (last player left)');
      return;
    }

    // Remove player from room
    await updateDoc(roomRef, {
      players: arrayRemove(playerEmail),
      status: 'finished',
      updatedAt: serverTimestamp(),
    });

    console.log('Left room:', roomId);
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};

/**
 * Get room by ID
 * @param {string} roomId - The ID of the room
 * @returns {Promise<Object|null>} - Room data or null if not found
 */
export const getRoomById = async (roomId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return null;
    }

    return {
      id: roomSnap.id,
      ...roomSnap.data(),
    };
  } catch (error) {
    console.error('Error getting room:', error);
    throw error;
  }
};

/**
 * Listen to room updates in real-time
 * @param {string} roomId - The ID of the room
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} - Unsubscribe function
 */
export const listenToRoom = (roomId, callback) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);

    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to room:', error);
        callback(null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up room listener:', error);
    throw error;
  }
};

/**
 * Update game state in room
 * @param {string} roomId - The ID of the room
 * @param {Object} gameState - New game state
 * @param {string} nextTurn - Email of next player's turn (optional)
 * @returns {Promise<void>}
 */
export const updateGameState = async (roomId, gameState, nextTurn = null) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);

    const updateData = {
      gameState,
      updatedAt: serverTimestamp(),
    };

    if (nextTurn) {
      updateData.currentTurn = nextTurn;
    }

    await updateDoc(roomRef, updateData);
  } catch (error) {
    console.error('Error updating game state:', error);
    throw error;
  }
};

/**
 * Set winner and finish game
 * @param {string} roomId - The ID of the room
 * @param {string} winner - Email of winner or "draw"
 * @returns {Promise<void>}
 */
export const setWinner = async (roomId, winner) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);

    await updateDoc(roomRef, {
      winner,
      status: 'finished',
      updatedAt: serverTimestamp(),
    });

    console.log('Game finished. Winner:', winner);
  } catch (error) {
    console.error('Error setting winner:', error);
    throw error;
  }
};

/**
 * Get active rooms for a specific game
 * @param {string} gameSlug - The slug of the game
 * @returns {Promise<Array>} - Array of active rooms
 */
export const getActiveRooms = async (gameSlug) => {
  try {
    const q = query(
      roomsCollection,
      where('gameSlug', '==', gameSlug),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting active rooms:', error);
    throw error;
  }
};

/**
 * Listen to active rooms for a specific game in real-time
 * @param {string} gameSlug - The slug of the game
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} - Unsubscribe function
 */
export const listenToActiveRooms = (gameSlug, callback) => {
  try {
    const q = query(
      roomsCollection,
      where('gameSlug', '==', gameSlug),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Listening to active rooms snapshot', snapshot);
        const rooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(rooms);
      },
      (error) => {
        console.error('Error listening to active rooms:', error);
        callback([], error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up rooms listener:', error);
    throw error;
  }
};
