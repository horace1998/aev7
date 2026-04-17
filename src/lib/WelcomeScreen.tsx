import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { Fingerprint, Sparkles, Loader2, Play, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { auth, googleProvider, db, OperationType, handleFirestoreError } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useSYNK, MemberBias } from "./Store";

const ONBOARDING_QUESTIONS = [
  {
    id: "bias",
    question: "誰最能引起你的靈魂共鳴？",
    sub: "WHICH MEMBER RESONATES WITH YOUR SOUL?",
    options: [
      { label: "KARINA / ROCKET PUNCHER", value: "Karina", color: "bg-blue-600" },
      { label: "WINTER / ARMAMENTER", value: "Winter", color: "bg-cyan-400" },
      { label: "GISELLE / XENOGLOSSY", value: "Giselle", color: "bg-synk-pink" },
      { label: "NINGNING / ED HACKER", value: "Ningning", color: "bg-purple-600" }
    ]
  },
  {
    id: "atmosphere",
    question: "你目前的數位環境氛圍？",
    sub: "CHOOSE YOUR CURRENT AMBIENT AURA",
    options: [
      { label: "STANDARD / 標準", value: "Standard", color: "bg-white/10" },
      { label: "NEON / 霓虹", value: "Neon", color: "bg-synk-lavender/30" },
      { label: "VOID / 虛空", value: "Void", color: "bg-black" }
    ]
  }
];

const WelcomeScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user, loading: authLoading, hasProfile } = useSYNK();
  const [phase, setPhase] = useState<"intro" | "pact" | "questions" | "auth" | "loading" | "success">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ bias: MemberBias, atmosphere: string }>({
    bias: 'None',
    atmosphere: 'Standard'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && phase === "auth") {
      handleFinalizeProfile();
    }
  }, [user, phase]);

  const handleStartOnboarding = () => {
    setPhase("pact");
  };

  const handleAcceptPact = () => {
    if (user && hasProfile) {
      handleFinalizeProfile();
    } else {
      setPhase("questions");
    }
  };

  const handleAnswer = (value: string) => {
    if (currentQuestion === 0) {
      setAnswers(prev => ({ ...prev, bias: value as MemberBias }));
      setCurrentQuestion(1);
    } else {
      setAnswers(prev => ({ ...prev, atmosphere: value }));
      setPhase("auth");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Initiating Google Sign In...");
      await signInWithPopup(auth, googleProvider);
      console.log("Google Sign In successful");
      // Success will trigger the useEffect to handleFinalizeProfile
    } catch (err: any) {
      console.error("Auth error:", err);
      setLoading(false);
      if (err.code === 'auth/popup-blocked') {
        setError("Pop-up blocked! Please allow pop-ups or open the app in a new tab.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized. Please check your Firebase settings.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  const handleFinalizeProfile = async () => {
    if (!auth.currentUser) return;
    setPhase("loading");
    setLoading(true);
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      console.log("Checking if profile exists...");
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        console.log("Creating new profile...");
        // Create new profile
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
          bias: answers.bias,
          roomAtmosphere: answers.atmosphere,
          stats: {
            level: 1,
            experience: 0,
            crystals: 10,
            completed_goals: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log("Profile ready, showing success phase");
      setPhase("success");
      setTimeout(() => onComplete(), 2000);
    } catch (e: any) {
      console.error("Finalize profile error:", e);
      setPhase("auth");
      setError(e.message || "Failed to finalize profile. Please try again.");
      // Optional: do not throw to allow UI to stay functional
      // handleFirestoreError(e, OperationType.CREATE, `users/${auth.currentUser.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010101] text-white overflow-hidden tracking-widest px-6 md:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 bg-black" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-100%] opacity-20 mix-blend-screen pointer-events-none"
      >
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-synk-blue/30 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[30%] w-[50%] h-[50%] rounded-full bg-synk-pink/30 blur-[180px]" />
      </motion.div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              className="flex flex-col items-center text-center gap-12"
            >
              <div className="flex flex-col gap-6 w-full px-4">
                <span className="text-[10px] tracking-[0.6em] text-synk-lavender opacity-60 uppercase mb-4 text-center">ESTABLISHED CONNECTION</span>
                <h1 className="high-fashion-header text-6xl md:text-9xl font-bold tracking-[0.1em] md:tracking-[0.4em] leading-none mb-4 text-center w-full">SYNKIFY</h1>
                <p className="text-[10px] md:text-[12px] tracking-[0.4em] md:tracking-[0.6em] text-white/40 uppercase text-center">探索你的數位共鳴中心 / FIND YOUR RESONANCE</p>
              </div>

              <button
                onClick={handleStartOnboarding}
                className="group flex flex-col items-center gap-6 mt-8 relative z-50 bg-transparent border-none cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center relative group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                  <Play className="w-6 h-6 text-white group-hover:text-synk-lavender transition-colors fill-white/10" />
                  <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20 group-hover:opacity-40" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-white/60">INITIATE SYNC</span>
                  <span className="text-[8px] tracking-[0.3em] text-white/20 uppercase">開始同步協議</span>
                </div>
              </button>
            </motion.div>
          )}
          
          {phase === "pact" && (
            <motion.div
              key="pact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(20px)" }}
              className="flex flex-col items-center text-center gap-10 md:gap-14 max-w-xl"
            >
              <div className="flex flex-col gap-6">
                <span className="text-[10px] tracking-[0.6em] text-synk-pink uppercase">AFFIRMATION_PACT // 誓約</span>
                <h2 className="high-fashion-header text-4xl md:text-6xl leading-tight">BECOME YOUR TRUE SELF</h2>
                <div className="w-12 h-[1px] bg-white/20 mx-auto" />
                <p className="font-zh-serif text-[16px] md:text-[18px] text-white/80 leading-relaxed italic px-4">
                  「我承諾相信自己的力量，<br />
                  跨越數碼與現實的邊界，<br />
                  在共鳴中找回真實的自我。」
                </p>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase mt-4">
                  I PROMISE TO BELIEVE IN MY OWN STRENGTH <br />
                  AND EVOLVE INTO MY AUTHENTIC SELF.
                </p>
              </div>

              <button
                onClick={handleAcceptPact}
                className="group relative px-12 py-5 overflow-hidden transition-all"
              >
                <div className="absolute inset-0 bg-white group-hover:bg-synk-lavender transition-colors" />
                <span className="relative z-10 text-black text-[11px] font-bold uppercase tracking-[0.4em]">
                  I ACCEPT THE SYNK / 我接受此誓約
                </span>
                <motion.div 
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 border border-white scale-110" 
                />
              </button>
            </motion.div>
          )}

          {phase === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full flex flex-col items-center gap-16"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <span className="text-[10px] tracking-[0.5em] text-synk-lavender uppercase font-mono">STEP {currentQuestion + 1} OF 2</span>
                <h2 className="text-3xl md:text-4xl high-fashion-header text-white">{ONBOARDING_QUESTIONS[currentQuestion].question}</h2>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase">{ONBOARDING_QUESTIONS[currentQuestion].sub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                {ONBOARDING_QUESTIONS[currentQuestion].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className="group relative h-20 md:h-24 border border-white/10 hover:border-white/40 bg-white/2 hover:bg-white/5 overflow-hidden transition-all text-left px-8 flex items-center justify-between"
                  >
                     <div className={cn("absolute left-0 bottom-0 w-[2px] h-0 group-hover:h-full transition-all duration-500", opt.color)} />
                     <span className="text-[12px] md:text-[14px] uppercase tracking-[0.5em] font-serif italic text-white/60 group-hover:text-white group-hover:translate-x-2 transition-all">{opt.label}</span>
                     <ChevronRight className="w-4 h-4 text-white/0 group-hover:text-white/40 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-12"
            >
              <div className="flex flex-col gap-6">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                   <Fingerprint className="w-8 h-8 text-synk-lavender" />
                </div>
                <h2 className="text-3xl high-fashion-header">身分驗證協定</h2>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase max-w-xs leading-relaxed">
                  請使用 GOOGLE 帳戶進行最終身分授權以儲存您的宇宙軌跡。
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="relative z-50 flex items-center gap-6 px-10 py-5 bg-white text-black text-[11px] font-bold uppercase tracking-[0.4em] hover:invert transition-all group disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>MANIFEST WITH GOOGLE / 使用帳戶登入</>
                )}
              </button>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] tracking-[0.2em] uppercase max-w-xs"
                >
                  ERROR: {error}
                </motion.div>
              )}
              
              <div className="text-[8px] tracking-[0.4em] text-white/10 uppercase mt-4">
                RE-ENTRY PROTECTION / 加密傳輸中
              </div>
            </motion.div>
          )}

          {(phase === "loading" || authLoading) && (phase !== "success") && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <Loader2 className="w-16 h-16 text-synk-lavender animate-spin opacity-40" />
              <div className="flex flex-col gap-2 items-center">
                <span className="text-[10px] uppercase tracking-[0.6em] text-white/40">SYNCHRONIZING CORE...</span>
                <span className="text-[8px] tracking-[0.3em] text-white/20 uppercase font-mono">UPLOADING RESISTANCE DATA</span>
              </div>
            </motion.div>
          )}

          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: [0, 90, 0] }}
                transition={{ 
                  scale: { type: "spring", damping: 12 },
                  rotate: { duration: 1.5, ease: "easeInOut" }
                }}
                className="w-24 h-24 rounded-full bg-white flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              >
                 <Sparkles className="w-10 h-10 text-black" />
              </motion.div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl high-fashion-header text-white">ACCESS GRANTED</h2>
                <span className="text-[10px] tracking-[0.6em] text-synk-lavender uppercase">同步完成，特工 {auth.currentUser?.displayName?.split(' ')[0].toUpperCase()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Meta */}
      <div className="absolute bottom-12 left-0 w-full px-12 flex justify-between items-end opacity-20 pointer-events-none">
         <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-widest font-mono">STATUS: {loading ? 'FETCHING' : 'IDLE'}</span>
            <span className="text-[8px] uppercase tracking-widest font-mono">SESSION: {Math.random().toString(16).slice(2, 10)}</span>
         </div>
         <span className="text-[8px] uppercase tracking-[0.5em]">SYNK V4.2.1-BETA</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;