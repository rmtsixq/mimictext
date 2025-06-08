import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const ANALYSIS_COLLECTION = 'user_analyses';

export async function saveAnalysis(userId, text, analysis) {
  try {
    const docRef = await addDoc(collection(db, ANALYSIS_COLLECTION), {
      userId,
      text,
      analysis,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
}

export async function getUserAnalyses(userId) {
  try {
    const q = query(
      collection(db, ANALYSIS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user analyses:', error);
    throw error;
  }
}

export async function getLatestAnalysis(userId) {
  try {
    const analyses = await getUserAnalyses(userId);
    return analyses[0] || null;
  } catch (error) {
    console.error('Error getting latest analysis:', error);
    throw error;
  }
} 