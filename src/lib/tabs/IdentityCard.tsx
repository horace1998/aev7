import React, { useState } from "react";
import { useSYNK } from "../Store";
import { Fingerprint, Download, User as UserIcon, Shield, Map } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../utils";

export default function IdentityCard() {
  const { stats, customBackground, setCustomBackground, bias, roomAtmosphere, setRoomAtmosphere, customName, setCustomName, customPhoto, setCustomPhoto, user, resetProfile } = useSYNK();
  const [showMotivation, setShowMotivation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [tempName, setTempName] = useState(customName || user?.displayName || "");
  const [tempPhoto, setTempPhoto] = useState(customPhoto || "");

  const handleSaveProfile = async () => {
    await setCustomName(tempName);
    await setCustomPhoto(tempPhoto);
    setIsEditing(false);
  };

  const handleResetProfile = async () => {
    if (confirm("THIS WILL ERASE ALL YOUR EXPERIENCES AND RESONANCE DATA. PROCEED?")) {
      setIsResetting(true);
      await resetProfile();
      // App.tsx handles the redirection automagically
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-5 md:p-14 pb-32 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center justify-start text-center gap-8 md:gap-16">
        {/* Editorial Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mb-12 sm:mb-20 mt-4 sm:mt-8 border-b border-white/10 w-full justify-center pb-4">
        <button 
          onClick={() => setShowMotivation(false)}
          className={`text-[10px] md:text-[11px] py-2 uppercase tracking-[0.4em] transition-all font-serif italic ${!showMotivation ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}
        >
          RESONANCE ACCESS / 共鳴存取
        </button>
        <button 
          onClick={() => setShowMotivation(true)}
          className={`text-[10px] md:text-[11px] py-2 uppercase tracking-[0.4em] transition-all font-serif italic ${showMotivation ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}
        >
          MY AUTHENTICATION / 會員認證
        </button>
      </div>

      {!showMotivation ? (
        <motion.div
          key="identity"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16 items-start"
        >
          {/* Left Column: Visuals */}
          <div className="flex flex-col gap-10">
            <div className="relative group w-full max-w-[320px] mx-auto">
                <span className="absolute -top-8 sm:-top-12 left-0 text-[8px] sm:text-[10px] tracking-[0.5em] text-white/20 uppercase font-light">IDENTIFICATION SCAN</span>
                <div className="aspect-[4/5] bg-synk-glass border border-synk-border rounded-xl md:rounded-3xl overflow-hidden relative group">
                   {customPhoto || bias !== 'None' ? (
                     <img 
                       src={customPhoto || `https://picsum.photos/seed/${bias}/600/800`} 
                       alt={bias} 
                       className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 transition-all duration-1000"
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-black">
                       <Fingerprint className="w-20 h-20 text-white/5" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   <div className="absolute bottom-8 left-8 flex flex-col items-start gap-1">
                      <span className="text-[9px] uppercase tracking-[0.4em] text-synk-lavender">ACCESS CODE</span>
                      <span className="text-2xl font-serif italic uppercase tracking-widest text-white">
                         {customName || (bias === 'None' ? 'GUEST MY' : `MY ${bias.toUpperCase()}`)}
                      </span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="mt-4 w-full py-2 border border-white/10 text-[9px] uppercase tracking-[0.3em] text-white/40 hover:text-white hover:border-white/40 transition-all"
                >
                  {isEditing ? "CANCEL EDIT" : "RECONFIGURE IDENTITY"}
                </button>
                <button 
                  onClick={handleResetProfile}
                  disabled={isResetting}
                  className="mt-2 w-full py-2 text-[8px] uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 transition-all"
                >
                  {isResetting ? "ERASING CORE..." : "RESET SYNK PROTOCOL"}
                </button>
            </div>

            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6 w-full max-w-[320px] mx-auto p-6 bg-synk-glass border border-white/5 rounded-2xl text-left"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-[0.4em] text-white/30">AGENT NAME</span>
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-black/40 border border-white/10 p-3 text-xs text-white focus:border-synk-lavender outline-none uppercase tracking-widest"
                    placeholder="ENTER NAME"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-[0.4em] text-white/30">PROFILE IMAGE SOURCE (URL)</span>
                  <input 
                    type="text" 
                    value={tempPhoto}
                    onChange={(e) => setTempPhoto(e.target.value)}
                    className="bg-black/40 border border-white/10 p-3 text-xs text-white focus:border-synk-lavender outline-none tracking-tight"
                    placeholder="HTTPS://..."
                  />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-synk-lavender transition-all"
                >
                  SAVE CONFIGURATION
                </button>
              </motion.div>
            )}

            <div className="flex flex-col gap-6 w-full max-w-[320px] mx-auto">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5 pb-3 sm:pb-4 text-left">AESTHETICS CONFIG / 美學配置</span>
              <div className="grid grid-cols-1 gap-6">
                 <div className="flex flex-col gap-3">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/20 text-left">AMBIENT AURA / 靈氣</span>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                       {(['Standard', 'Neon', 'Void'] as const).map(atmos => (
                          <button 
                             key={atmos}
                             onClick={() => setRoomAtmosphere(atmos)}
                             className={cn(
                               "flex-1 min-w-[80px] py-3 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] border transition-all",
                               roomAtmosphere === atmos ? "bg-white text-black font-bold border-white" : "border-white/10 text-white/30 hover:border-white/30"
                             )}
                          >
                             {atmos}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex flex-col gap-3">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/20 text-left">TEXTURE SYNC / 紋理</span>
                    <label className="flex items-center gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-5 border border-synk-border bg-synk-glass hover:bg-white/5 transition-all rounded-xl cursor-pointer group">
                      <Map className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-white transition-colors" />
                      <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.4em] font-serif italic text-left">MANIFEST SPATIAL SYNC / 同步</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column: Credentials */}
          <div className="flex flex-col gap-10 sm:gap-16 text-left">
            <header className="flex flex-col gap-3 sm:gap-4">
               <h1 className="high-fashion-header text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none tracking-[0.1em] sm:tracking-[0.15em]">AUTHENTICATION</h1>
               <p className="text-[10px] sm:text-[12px] text-synk-lavender/60 uppercase tracking-[0.4em] font-serif italic">身份認證 / REDEFINING REALITY</p>
            </header>

            <div className="flex flex-col gap-10 sm:gap-12">
               <div className="flex flex-col gap-8">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5 pb-3 sm:pb-4">CORE METRICS / 核心指標</span>
                  <div className="grid grid-cols-1 gap-8 sm:gap-12">
                     <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 text-left">RESONANCE INDEX</span>
                        <div className="flex items-end gap-3 sm:gap-4">
                           <span className="text-4xl sm:text-5xl font-serif italic text-white leading-none">{stats.level}</span>
                           <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-synk-lavender mb-1">LEVEL</span>
                        </div>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 text-left">EXPERIENCE ACCUMULATION</span>
                        <div className="flex items-end gap-3 sm:gap-4">
                           <span className="text-4xl sm:text-5xl font-serif italic text-white leading-none">{stats.experience}</span>
                           <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/10 mb-1">UNITS</span>
                        </div>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 text-left">ANOMALY ERASURE COUNT</span>
                        <div className="flex items-end gap-3 sm:gap-4">
                           <span className="text-4xl sm:text-5xl font-serif italic text-white leading-none">{stats.completed_goals}</span>
                           <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-synk-pink mb-1">PROTOCOLS</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-4 sm:gap-6">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5 pb-3 sm:pb-4">STATUS RATING</span>
                  <div className="flex items-center gap-4 sm:gap-6">
                     <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-synk-pink animate-pulse" />
                     <h2 className="text-xl sm:text-3xl font-serif italic uppercase tracking-widest text-white leading-tight">ELITE AGENT / 精英特工</h2>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-white/40 uppercase tracking-[0.1em] sm:tracking-[0.2em] max-w-sm leading-relaxed text-left">
                     VIRTUAL ACCESSID MY V2. AUTHORIZED TO NAVIGATE THE VOID AND SYNCHRONIZE WITH THE CORE.
                  </p>
               </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <MotivationCard />
      )}
    </div>
    </div>
  );
}

function MotivationCard() {
  const { bias, customName, customPhoto } = useSYNK();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      key="passport"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-16"
      style={{ perspective: 1200 }}
    >
      <header className="flex flex-col gap-2 items-center px-4">
         <h1 className="high-fashion-header text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-none">PASSPORT</h1>
         <p className="text-[10px] sm:text-[12px] text-synk-lavender uppercase tracking-[0.4em] sm:tracking-[0.6em] font-serif italic text-center">虛擬准入證 / VIRTUAL ACCESS PASS</p>
      </header>

      <motion.div
        className="w-[90vw] max-w-[400px] aspect-[1/1.4] bg-white text-black relative overflow-hidden flex flex-col justify-between p-6 sm:p-12 cursor-pointer shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-between items-start w-full relative z-10 border-b border-black/10 pb-6 sm:pb-8">
          <div className="flex flex-col gap-5">
             <Fingerprint className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
             <div className="w-20 h-28 sm:w-28 sm:h-36 bg-black/5 border border-black/10 overflow-hidden relative">
                {customPhoto || bias !== 'None' ? (
                   <img 
                     src={customPhoto || `https://picsum.photos/seed/${bias}/300/400`} 
                     alt="Agent Profile"
                     className="w-full h-full object-cover grayscale"
                     referrerPolicy="no-referrer"
                   />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-black/5">
                      <Fingerprint className="w-10 h-10 text-black/10" />
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
             </div>
          </div>
          <div className="text-right flex flex-col items-end pt-1">
            <span className="text-[10px] sm:text-[12px] uppercase tracking-[0.4em] font-serif italic font-bold">SYNK PASSPORT TOKEN</span>
            <span className="text-[8px] sm:text-[10px] font-mono text-black/40">#AE-KW 0X9192</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8 relative z-10 mt-6 sm:mt-0">
          <h3 className="high-fashion-header text-4xl sm:text-6xl text-black leading-none">
            {customName ? customName.toUpperCase() : "MANIFEST"}<br/>{customName ? "" : "DESTINY"}
          </h3>
          <div className="flex flex-col gap-1 sm:gap-2">
            <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.4em] text-black/30 font-bold">AGENT RESOLUTION / 宣示命運</span>
            <p className="text-[12px] sm:text-[14px] font-serif italic text-black leading-relaxed">
              「我們在宇宙的負空間中<br/>建立自己的現實。」
            </p>
          </div>
        </div>

        <div className="flex justify-between items-end relative z-10 border-t border-black/10 pt-6 sm:pt-8 mt-6 sm:mt-0">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] text-black/40">ORIGIN COORD / 座標</span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold">UNKNOWN / 未知</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 border border-black/20 bg-black flex items-center justify-center">
             <div className="w-4 h-4 sm:w-6 sm:h-6 border border-white/20" />
          </div>
        </div>
      </motion.div>

      <button className="flex items-center justify-center gap-4 sm:gap-6 px-10 sm:px-12 py-4 sm:py-5 bg-white text-black text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.4em] hover:invert transition-all group w-[80%] sm:w-auto">
        <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" /> SAVE CREDENTIALS / 儲存通行證
      </button>
    </motion.div>
  );
}
