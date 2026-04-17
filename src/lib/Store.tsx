import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { auth, db, OperationType, handleFirestoreError } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy, getDoc } from "firebase/firestore";

export type GoalType = 'pulse' | 'orbit' | 'galaxy';
export type MemberBias = 'None' | 'Karina' | 'Winter' | 'Giselle' | 'Ningning';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  completed: boolean;
  createdAt?: any;
}

export interface UserStats {
  level: number;
  experience: number;
  crystals: number;
  completed_goals: number;
}

export interface Decoration {
  id: string;
  image: string;
  x: number;
  y: number;
  scale: number;
  type: 'image' | 'crystal' | 'orb';
}

export interface JournalEntry {
  id: string;
  uid: string;
  content: string;
  imageUrl?: string;
  location?: {
    name: string;
    coords: string;
  };
  lyrics_en?: string;
  lyrics_zh?: string;
  mood?: string;
  maskPath?: string;
  createdAt?: any;
}

interface SYNKContextType {
  user: User | null;
  loading: boolean;
  stats: UserStats;
  goals: Goal[];
  entries: JournalEntry[];
  addGoal: (title: string, type: GoalType) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addEntry: (entry: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  syncToNotion: (entry: JournalEntry) => Promise<void>;
  completionRate: number;
  triggerAchievement: (title: string, sub: string) => void;
  achievement: { show: boolean, title: string, sub: string };
  hideAchievement: () => void;
  customBackground: string | null;
  setCustomBackground: (url: string | null) => void;
  bias: MemberBias;
  setBias: (bias: MemberBias) => Promise<void>;
  customName: string;
  setCustomName: (name: string) => Promise<void>;
  customPhoto: string | null;
  setCustomPhoto: (url: string | null) => Promise<void>;
  roomAtmosphere: string;
  setRoomAtmosphere: (atmos: string) => Promise<void>;
  decorations: Decoration[];
  addDecoration: (image: string, type: 'image' | 'crystal' | 'orb') => void;
  removeDecoration: (id: string) => void;
  syncProfile: (data: Partial<SYNKContextType>) => Promise<void>;
  hasProfile: boolean;
  resetProfile: () => Promise<void>;
  accentColors: string[];
  setAccentColors: (colors: string[]) => void;
}

const SYNKContext = createContext<SYNKContextType | undefined>(undefined);

export function SYNKProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    experience: 0,
    crystals: 10,
    completed_goals: 0,
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [achievement, setAchievement] = useState({ show: false, title: "", sub: "" });
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [bias, setBias] = useState<MemberBias>('None');
  const [customName, setCustomName] = useState<string>('');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [roomAtmosphere, setRoomAtmosphere] = useState<string>('Standard');
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [accentColors, setAccentColors] = useState<string[]>(["#60a5fa", "#f472b6", "#a78bfa"]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Profile Sync
  const syncProfile = useCallback(async (data: any) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  }, []);

  // Firestore Sync Listener
  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const goalsQuery = query(goalsRef, orderBy('createdAt', 'desc'));

    setLoading(true);

    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(data.stats || stats);
        setBias(data.bias || 'None');
        setCustomName(data.customName || '');
        setCustomPhoto(data.customPhoto || null);
        setRoomAtmosphere(data.roomAtmosphere || 'Standard');
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    }, (e) => {
      setLoading(false);
      handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
    });

    const unsubGoals = onSnapshot(goalsQuery, (querySnap) => {
      const g = querySnap.docs.map(d => ({ id: d.id, ...d.data() } as Goal));
      setGoals(g);
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/goals`));

    const entriesRef = collection(db, 'users', user.uid, 'entries');
    const entriesQuery = query(entriesRef, orderBy('createdAt', 'desc'));
    
    const unsubEntries = onSnapshot(entriesQuery, (querySnap) => {
      const e = querySnap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry));
      setEntries(e);
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/entries`));

    return () => {
      unsubUser();
      unsubGoals();
      unsubEntries();
    };
  }, [user]);

  const addGoal = async (title: string, type: GoalType) => {
    if (!user) return;
    const goalsRef = collection(db, 'users', user.uid, 'goals');
    try {
      await addDoc(goalsRef, {
        uid: user.uid,
        title,
        type,
        completed: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/goals`);
    }
  };

  const completeGoal = async (id: string) => {
    if (!user) return;
    const goalRef = doc(db, 'users', user.uid, 'goals', id);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists() && !goalSnap.data().completed) {
      try {
        await updateDoc(goalRef, { completed: true });
        
        // Update stats in user document
        const userRef = doc(db, 'users', user.uid);
        const newExp = stats.experience + 50;
        const newLevel = Math.floor(newExp / 200) + 1;
        
        if (newLevel > stats.level) {
          triggerAchievement("等級提升", `已達到共鳴等級 ${newLevel}`);
        } else {
          triggerAchievement("目標達成", "+50 EXP | +5 水晶");
        }

        await updateDoc(userRef, {
          "stats.experience": newExp,
          "stats.level": newLevel,
          "stats.crystals": stats.crystals + 5,
          "stats.completed_goals": stats.completed_goals + 1,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/goals/${id}`);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    const goalRef = doc(db, 'users', user.uid, 'goals', id);
    try {
      await deleteDoc(goalRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/goals/${id}`);
    }
  };

  const addEntry = async (entryData: Partial<JournalEntry>) => {
    if (!user) return;
    const entriesRef = collection(db, 'users', user.uid, 'entries');
    try {
      const newEntry = {
        uid: user.uid,
        ...entryData,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(entriesRef, newEntry);
      
      // Auto-sync after creation if enabled
      const finalEntry = { ...newEntry, id: docRef.id } as JournalEntry;
      await syncToNotion(finalEntry);
      
      triggerAchievement("空間存檔完成", "記憶已同步至個人聖殿");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/entries`);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    const entryRef = doc(db, 'users', user.uid, 'entries', id);
    try {
      await deleteDoc(entryRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/entries/${id}`);
    }
  };

  const syncToNotion = async (entry: JournalEntry) => {
    try {
      const response = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry })
      });
      if (!response.ok) {
        throw new Error("Sync failed");
      }
    } catch (e) {
      console.error("Notion Sync Error:", e);
    }
  };

  const triggerAchievement = (title: string, sub: string) => {
    setAchievement({ show: true, title, sub });
    setTimeout(() => {
      setAchievement(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const hideAchievement = () => setAchievement(prev => ({...prev, show: false}));

  const addDecoration = (image: string, type: 'image' | 'crystal' | 'orb') => {
    const newDeco: Decoration = {
      id: Math.random().toString(),
      image,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      scale: 0.8 + Math.random() * 0.4,
      type
    };
    setDecorations([...decorations, newDeco]);
    triggerAchievement("具現完成", "新遺物已同步到您的房間");
  };

  const removeDecoration = (id: string) => {
    setDecorations(decorations.filter(d => d.id !== id));
  };

  const resetProfile = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await deleteDoc(userRef);
      setHasProfile(false);
      // Optional: Clear other local states if needed, though being caught by listener will handle most
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}`);
    }
  };

  const totalCompleted = goals.filter(g => g.completed).length;
  const completionRate = goals.length === 0 ? 0 : totalCompleted / goals.length;

  return (
    <SYNKContext.Provider value={{
      user, loading, stats, goals, entries, addGoal, completeGoal, deleteGoal, addEntry, deleteEntry, syncToNotion, completionRate,
      triggerAchievement, achievement, hideAchievement,
      customBackground, setCustomBackground,
      bias, setBias: (b: MemberBias) => syncProfile({ bias: b }),
      customName, setCustomName: (name: string) => syncProfile({ customName: name }),
      customPhoto, setCustomPhoto: (url: string | null) => syncProfile({ customPhoto: url }),
      roomAtmosphere, setRoomAtmosphere: (a: string) => syncProfile({ roomAtmosphere: a }),
      decorations, addDecoration, removeDecoration,
      syncProfile,
      hasProfile,
      resetProfile,
      accentColors,
      setAccentColors
    }}>
      {children}
    </SYNKContext.Provider>
  );
}

export function useSYNK() {
  const context = useContext(SYNKContext);
  if (!context) throw new Error("useSYNK must be used within SYNKProvider");
  return context;
}
