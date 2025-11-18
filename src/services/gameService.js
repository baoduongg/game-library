import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

const gamesCollection = collection(db, 'games');

/**
 * Get all games
 */
export const getAllGames = async () => {
  try {
    const q = query(gamesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting games:', error);
    throw error;
  }
};

/**
 * Get game by slug
 */
export const getGameBySlug = async (slug) => {
  try {
    const q = query(gamesCollection, where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const gameDoc = snapshot.docs[0];
    return {
      id: gameDoc.id,
      ...gameDoc.data(),
    };
  } catch (error) {
    console.error('Error getting game by slug:', error);
    throw error;
  }
};

/**
 * Get game by ID
 */
export const getGameById = async (gameId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
      return null;
    }

    return {
      id: gameSnap.id,
      ...gameSnap.data(),
    };
  } catch (error) {
    console.error('Error getting game by ID:', error);
    throw error;
  }
};

/**
 * Add new game
 */
export const addGame = async (gameData) => {
  try {
    const docRef = await addDoc(gamesCollection, {
      ...gameData,
      plays: 0,
      rating: 0,
      featured: false,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding game:', error);
    throw error;
  }
};

/**
 * Update game
 */
export const updateGame = async (gameId, gameData) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      ...gameData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
};

/**
 * Delete game
 */
export const deleteGame = async (gameId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    await deleteDoc(gameRef);
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
};

/**
 * Increment play count
 */
export const incrementPlayCount = async (gameId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    console.log('gameSnap', gameSnap.data());
    await updateDoc(gameRef, {
      plays: gameSnap.data().plays + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error incrementing play count:', error);
    throw error;
  }
};

/**
 * Get featured games
 */
export const getFeaturedGames = async () => {
  try {
    const q = query(
      gamesCollection,
      where('featured', '==', true),
      where('status', '==', 'active'),
      orderBy('plays', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting featured games:', error);
    throw error;
  }
};

/**
 * Get games by category
 */
export const getGamesByCategory = async (category) => {
  try {
    const q = query(
      gamesCollection,
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting games by category:', error);
    throw error;
  }
};
