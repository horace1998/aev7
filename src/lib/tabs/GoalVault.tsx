import React, { useState } from "react";
import { useSYNK, GoalType } from "../Store";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, X, Target, Layout, Table, Columns } from "lucide-react";
import { cn } from "../utils";

export default function GoalVault() {
  const { goals, addGoal, completeGoal, deleteGoal, bias } = useSYNK();
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<GoalType>("pulse");
  const [view, setView] = useState<"standard" | "table" | "board">("standard");

  const getLoreTitle = () => {
    switch(bias) {
        case 'Karina': return "資深特工指令";
        case 'Winter': return "重裝武器代碼";
        case 'Giselle': return "語言模組協議";
        case 'Ningning': return "E.D. 駭客腳本";
        default: return "共鳴指令中心";
    }
  };
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addGoal(newTitle, newType);
    setNewTitle("");
  };

  const getGoalColor = (type: GoalType) => {
    switch (type) {
      case "pulse": return "text-synk-pink bg-synk-pink/10 border-synk-pink/30";
      case "orbit": return "text-synk-blue bg-synk-blue/10 border-synk-blue/30";
      case "galaxy": return "text-synk-lavender bg-synk-lavender/10 border-synk-lavender/30";
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-14 pb-32 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-12 md:gap-16">
        {/* Editorial Header Section */}
        <header className="flex flex-col gap-12 border-b border-white/10 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.5em] text-white/20 mb-3 md:mb-4 block uppercase font-light">DATABASE VAULT V4</span>
              <h1 className="high-fashion-header text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none">VAULT</h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
                <span className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.4em] text-synk-lavender uppercase font-light leading-none">應援數據庫</span>
                <span className="hidden sm:block w-8 md:w-12 h-[1px] bg-synk-lavender/30" />
                <span className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.4em] text-white/30 uppercase leading-none">{getLoreTitle()}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-white/30">VIEW MODE / 檢視模式</span>
              <div className="flex bg-synk-glass p-1.5 md:p-2 rounded-xl border border-synk-border backdrop-blur-md w-full md:w-auto overflow-x-auto no-scrollbar">
                {(["standard", "table", "board"] as const).map((v) => (
                  <button 
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "flex-1 md:flex-none px-4 md:px-6 py-1.5 md:py-2 text-[8px] md:text-[9px] uppercase tracking-[0.3em] transition-all rounded-sm",
                      view === v ? "bg-white text-black font-bold shadow-lg" : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Input Block: EXECUTION PROTOCOL */}
        <section className="flex flex-col gap-8 max-w-4xl">
          <div className="flex items-start md:items-center gap-4">
            <span className="hidden md:block text-[10px] uppercase tracking-[0.4em] text-synk-pink vertical-text h-32 origin-top-left pt-2">PROTOCOL 01</span>
            <div className="flex-1">
               <h3 className="text-xl md:text-2xl font-serif italic text-white/90 mb-4 md:mb-6 tracking-tight">「在此輸入您的靈魂指令」</h3>
               <form onSubmit={handleAdd} className="flex flex-col gap-6 md:gap-8 bg-synk-glass p-8 md:p-14 border border-synk-border hover:border-white/20 transition-all rounded-[24px] md:rounded-[40px] shadow-2xl">
                <div className="flex items-center gap-4 md:gap-8 w-full border-b border-white/10 pb-4 group">
                  <span className="hidden xs:block text-[9px] md:text-[10px] tracking-[0.3em] text-white/20 group-focus-within:text-white transition-colors">ENTRY ID:</span>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="SYNK NOW..."
                    className="flex-1 bg-transparent border-none p-0 text-xl md:text-3xl font-serif italic text-white placeholder:text-white/5 focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                  <div className="flex flex-col gap-4">
                    <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-white/30">SELECT PHASE / 階段</span>
                    <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar w-full">
                      {(["pulse", "orbit", "galaxy"] as GoalType[]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewType(t)}
                          className={cn(
                            "px-3 md:px-4 py-1.5 md:py-2 text-[8px] md:text-[9px] uppercase tracking-[0.3em] border transition-all rounded-sm",
                            newType === t ? "bg-white text-black font-bold border-white" : "border-white/10 text-white/20 hover:border-white/30"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-white text-black font-bold text-[10px] md:text-[11px] uppercase tracking-[0.4em] px-10 md:px-12 py-3 md:py-4 shadow-xl hover:invert transition-all active:scale-95 rounded-sm"
                  >
                    INITIALIZE <span className="hidden xs:inline">/ 初始化</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Archives Display */}
        <section className="flex flex-col gap-12">
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
             <h2 className="high-fashion-header text-3xl shrink-0">DIRECTIVES</h2>
             <span className="hidden xs:block w-px h-6 bg-white/10" />
             <span className="text-[10px] tracking-[0.2em] md:tracking-[0.4em] text-white/30 uppercase">當前指令集 / {goals.length} SLOTS ACTIVE</span>
          </div>

          <div className="flex flex-col gap-6 w-full">
            {view === "standard" && (
              <div className="flex flex-col gap-1">
                <AnimatePresence>
                  {goals.map(goal => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={cn(
                        "flex flex-col md:grid md:grid-cols-[1fr_200px_40px] items-start md:items-center p-6 md:p-8 border-b border-white/5 transition-all group gap-6 md:gap-0",
                        goal.completed ? "opacity-30" : "hover:bg-white/2"
                      )}
                    >
                      <div className="flex items-center gap-6 md:gap-12 w-full min-w-0">
                        <button 
                           onClick={() => completeGoal(goal.id)}
                           className={cn(
                             "w-4 h-4 rounded-full border transition-all shrink-0",
                             goal.completed ? "bg-white border-white scale-125" : "border-white/20 hover:border-white group-hover:scale-110"
                           )}
                        />
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className={cn("text-lg md:text-2xl font-serif italic text-white transition-all truncate", goal.completed && "line-through text-white/40")}>
                            {goal.title}
                          </span>
                          <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-white/20">AGENT PROTOCOL ID: {goal.id.slice(0, 8)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 w-full md:w-auto mt-2 md:mt-0">
                         <span className={cn("text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium px-2 py-0.5 rounded md:p-0 md:bg-transparent", getGoalColor(goal.type))}>PHASE {goal.type}</span>
                         <span className="text-[8px] uppercase tracking-widest text-white/10 ml-auto md:ml-0">STABILITY CHECK: OK</span>
                      </div>
                      
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-white/10 hover:text-synk-pink transition-all flex justify-end absolute top-6 right-6 md:static"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {goals.length === 0 && (
                  <div className="py-24 text-center border border-dashed border-white/5 rounded-sm">
                     <p className="text-[11px] uppercase tracking-[0.5em] text-white/20 italic font-serif">Empty archive / 已清空數據庫</p>
                  </div>
                )}
              </div>
            )}

          {view === "table" && (
            <div className="bg-synk-glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
               <div className="grid grid-cols-[1fr_120px_100px_40px] gap-6 p-6 border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-widest text-white/50 font-bold">
                  <div>指令標題</div>
                  <div>同步階段</div>
                  <div>狀態</div>
                  <div></div>
               </div>
               {goals.map(goal => (
                 <div key={goal.id} className="grid grid-cols-[1fr_120px_100px_40px] gap-6 p-6 border-b border-white/5 items-center last:border-0 hover:bg-white/5 transition-colors">
                    <div className="text-sm text-white/90 font-medium truncate">{goal.title}</div>
                    <div>
                       <span className={cn("text-[9px] px-2 py-0.5 rounded uppercase tracking-widest", getGoalColor(goal.type))}>
                          {goal.type === 'pulse' ? '脈衝' : goal.type === 'orbit' ? '軌道' : '銀河'}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={cn("w-1.5 h-1.5 rounded-full", goal.completed ? "bg-green-500" : "bg-yellow-500 animate-pulse")} />
                       <span className="text-[10px] text-white/60">{goal.completed ? "已完成" : "進行中"}</span>
                    </div>
                    <button onClick={() => deleteGoal(goal.id)} className="text-white/20 hover:text-red-400">
                       <X className="w-3 h-3" />
                    </button>
                 </div>
               ))}
               {goals.length === 0 && (
                 <div className="p-8 text-center text-[10px] uppercase tracking-widest text-white/20">清單為空</div>
               )}
            </div>
          )}

          {view === "board" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {(["pulse", "orbit", "galaxy"] as GoalType[]).map(type => (
                 <div key={type} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                       <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{type === 'pulse' ? '脈衝' : type === 'orbit' ? '軌道' : '銀河'}</h4>
                       <span className="text-[9px] text-white/30">{goals.filter(g => g.type === type).length}</span>
                    </div>
                    {goals.filter(g => g.type === type).map(goal => (
                       <div key={goal.id} className="bg-synk-glass border border-white/10 p-4 rounded-xl flex flex-col gap-3 group">
                          <div className={cn("text-sm transition-all", goal.completed && "line-through text-white/40")}>
                             {goal.title}
                          </div>
                          <div className="flex justify-between items-center">
                             <button 
                                onClick={() => completeGoal(goal.id)}
                                className={cn("text-[9px] uppercase tracking-widest", goal.completed ? "text-green-400" : "text-white/30 hover:text-synk-blue")}
                             >
                                {goal.completed ? "已同步" : "初始化"}
                             </button>
                             <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-white/20">
                                <X className="w-3 h-3" />
                             </button>
                          </div>
                       </div>
                    ))}
                    <button className="text-[10px] text-white/10 hover:text-white/30 transition-colors py-2 border border-dashed border-white/5 rounded-xl uppercase tracking-widest">
                       + 新增
                    </button>
                 </div>
               ))}
            </div>
          )}
        </div>
      </section>
    </div>
    </div>
  );
}
