import React, { useState, useEffect } from 'react';
import { X, Loader2, BookOpen, Code, Terminal, Beaker, Shield, Globe, EyeOff, Zap, Database } from 'lucide-react';
import { teacherService } from '../../services/api';

export function QuestionDetailModal({ isOpen, onClose, questionId }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && questionId) {
      setLoading(true);
      teacherService.getQuestion(questionId)
        .then(data => setQuestion(data))
        .catch(err => console.error('Failed to fetch question details', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, questionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-card border border-white/10 rounded-4xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <BookOpen size={24} className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Question Details</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Reviewing specialized assessment logic</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-accent" size={32} />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Parsing neural data bank...</p>
            </div>
          ) : question ? (
            <>
              {/* Title & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">{question.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      question.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      question.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {question.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/5">
                      {question.marks} POINTS
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/2 text-slate-500">
                      {question.visibility === 'GLOBAL' ? <Globe size={10} /> : <EyeOff size={10} />}
                      {question.visibility}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center group hover:border-accent/30 transition-all">
                   <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Complexity</div>
                   <div className="text-xl font-mono font-black text-accent tracking-tighter">O({question.expectedTimeComplexity || 'N/A'})</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-accent" />
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Problem Description</h4>
                </div>
                <div className="bg-slate-950/50 p-6 rounded-4xl border border-white/5 leading-relaxed text-slate-300 text-sm whitespace-pre-wrap font-medium">
                  {question.description}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs & Constraints */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Database size={12} className="text-accent" /> Input Format
                    </h5>
                    <div className="p-4 bg-slate-900/30 rounded-2xl border border-white/2 text-[12px] text-slate-400 font-medium">
                      {question.inputFormat || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Zap size={12} className="text-accent" /> Constraints
                    </h5>
                    <div className="p-4 bg-slate-900/30 rounded-2xl border border-white/2 text-[12px] text-slate-400 font-medium">
                      {question.constraints || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Templates & Code */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Code size={12} className="text-accent" /> Template Header
                    </h5>
                    <pre className="p-4 bg-slate-950 border border-white/2 rounded-2xl font-mono text-[11px] text-emerald-500/70 overflow-x-auto">
                      {question.prefixCode || '// No prefix code'}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Test Cases */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Beaker size={16} className="text-accent" />
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Validation Logic (Test Cases)</h4>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 bg-white/2 px-3 py-1 rounded-full border border-white/5 uppercase select-none">
                    {question.testCases?.length || 0} Scenarios
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.testCases?.map((tc, idx) => (
                    <div key={idx} className="p-5 bg-slate-900/40 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-600 uppercase">Scenario #{idx + 1}</span>
                        {tc.isHidden && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-slate-400 uppercase">
                            <Shield size={10} /> Hidden
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mb-1.5">Input Stream</p>
                          <div className="p-3 bg-slate-950 rounded-xl font-mono text-[10px] text-slate-300 border border-white/5">{tc.input || 'None'}</div>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mb-1.5">Expected Output</p>
                          <div className="p-3 bg-slate-950 rounded-xl font-mono text-[10px] text-accent/80 border border-white/5">{tc.expectedOutput || 'None'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 uppercase text-[10px] font-black tracking-widest">Question not found</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/2 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-white/5"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}
