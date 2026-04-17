import { useState, useEffect } from "react";
import { SYNKProvider, useSYNK } from "./lib/Store";
import WelcomeScreen from "./lib/WelcomeScreen";
import AppLayout from "./lib/AppLayout";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

function SYNKApp() {
  const { user, loading, hasProfile } = useSYNK();
  const [welcomeDone, setWelcomeDone] = useState(false);

  useEffect(() => {
    // We only reset welcomeDone if we explicitly lose the profile (e.g. after a reset)
    if (user && !hasProfile) {
      setWelcomeDone(false);
    }
  }, [user, hasProfile]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-synk-lavender animate-spin opacity-40" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {(!user || !welcomeDone) ? (
        <WelcomeScreen key="welcome" onComplete={() => setWelcomeDone(true)} />
      ) : (
        <AppLayout key="app" />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <SYNKProvider>
      <SYNKApp />
    </SYNKProvider>
  );
}
