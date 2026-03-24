import { useEffect, useState } from "react";
import { teacherService } from "../../services/api";
import { PlusCircle, ClipboardList, BookOpen, HelpCircle, ArrowRight, Activity, Calendar, Award, Zap, ChevronRight, LayoutDashboard, Database, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export function TeacherDashboard() {
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    teacherService.getQuestions().then(setQuestions).catch(console.error);
    teacherService.getTests()
      .then(data => {
        const sortedTests = [...data].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setTests(sortedTests);
      })
      .catch(console.error);
  }, []);

  const difficultyColor = {
     EASY: "text-accent bg-accent/10 border-accent/20",
     MEDIUM: "text-amber-500 bg-amber-500/10 border-amber-500/20",
     HARD: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="animate-fade-in pb-20 space-y-12 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10" style={{ borderBottom: "1px solid var(--divider)" }}>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 text-accent rounded-lg border border-accent/20">
              <LayoutDashboard size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              Teacher Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="mt-3 text-[16px] font-medium max-w-xl" style={{ color: "var(--text-muted)" }}>
            Welcome back,{" "}
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{user?.name}</span>. Manage
            your question bank and active tests.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/teacher/questions/create"
            className="font-bold py-3.5 px-6 rounded-xl transition-all flex items-center gap-3 text-sm uppercase tracking-widest group"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--text-muted)", boxShadow: "var(--card-shadow)" }}
          >
            <Database size={18} className="group-hover:rotate-12 transition-transform" /> New Question
          </Link>
          <Link
            to="/teacher/tests/create"
            className="bg-accent hover:bg-accent-dark text-black font-bold py-3.5 px-8 rounded-xl transition-all flex items-center gap-3 text-sm shadow-lg shadow-accent/20 active:scale-95 uppercase tracking-widest"
          >
            <Zap size={18} fill="currentColor" stroke="none" /> Create Test
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Questions', val: questions.length, icon: HelpCircle, color: 'purple', desc: 'Active bank' },
          { label: 'Tests Conducted', val: tests.length, icon: ClipboardList, color: 'blue', desc: 'Lifetime count' },
          { label: 'Next Session', val: 'Soon', icon: Activity, color: 'emerald', desc: 'Upcoming' }
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden"
            style={{ background: "var(--stat-bg)", border: "1px solid var(--stat-border)", boxShadow: "var(--card-shadow)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--card-hover-border)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--stat-border)"; }}
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity p-4`}>
              <stat.icon size={120} className={stat.color === 'emerald' ? 'text-accent' : `text-${stat.color}-400`} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[11px] uppercase tracking-[0.2em] mb-6" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </span>
              <div className="flex items-end justify-between relative z-10">
                <p className="text-5xl font-bold leading-none tracking-tighter" style={{ color: "var(--text-primary)" }}>
                  {stat.val}
                </p>
                <div
                  className="p-3 rounded-xl transition-all"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", color: "var(--icon-muted)" }}
                >
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-[11px] font-bold mt-5 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }}>
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
        {/* Recent Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase" style={{ color: "var(--text-primary)" }}>
                Question Bank
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-1.5" style={{ color: "var(--text-muted)" }}>
                Recently added questions
              </p>
            </div>
            <Link
              to="/teacher/questions"
              className="p-2.5 rounded-xl transition-all group"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", color: "var(--icon-muted)" }}
            >
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {questions.length === 0 ? (
            <div
              className="border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center"
              style={{ background: "var(--card-bg)", border: "2px dashed var(--card-border)" }}
            >
              <BookOpen size={64} strokeWidth={1} className="mb-6" style={{ color: "var(--empty-icon)" }} />
              <p className="text-sm font-bold uppercase tracking-widest leading-relaxed" style={{ color: "var(--empty-text)" }}>
                No questions found. <br /> Create your first question.
              </p>
              <Link
                to="/teacher/questions/create"
                className="mt-8 font-bold text-[11px] uppercase border-b border-accent pb-1 hover:text-accent transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                Create Question
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {questions.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/teacher/questions`)}
                  className="group rounded-2xl p-4.5 flex items-center justify-between transition-all cursor-pointer"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--card-hover-border)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
                >
                  <div className="flex items-center gap-5 min-w-0 pr-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", color: "var(--icon-muted)" }}
                    >
                      <Database size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[15px] truncate uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>
                        {q.title}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] mt-1.5 font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                        <span>{q.marks} Pts</span>
                        <div className="w-1 h-1 rounded-full" style={{ background: "var(--divider)" }}></div>
                        <span className="flex items-center gap-1.5">
                          <Zap size={12} className="text-amber-500" />{" "}
                          {q.expectedTimeComplexity || "O(n)"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest shrink-0 transition-all ${difficultyColor[q.difficulty] || "text-gray-500 bg-gray-500/10 border-gray-500/20"}`}>
                    {q.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase" style={{ color: "var(--text-primary)" }}>
                History
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-1.5" style={{ color: "var(--text-muted)" }}>
                Recent test activity
              </p>
            </div>
            <Link
              to="/teacher/results"
              className="p-2.5 rounded-xl transition-all group"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", color: "var(--icon-muted)" }}
            >
              <Activity size={20} className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          {tests.length === 0 ? (
            <div
              className="border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center"
              style={{ background: "var(--card-bg)", border: "2px dashed var(--card-border)" }}
            >
              <ClipboardList size={64} strokeWidth={1} className="mb-6" style={{ color: "var(--empty-icon)" }} />
              <p className="text-sm font-bold uppercase tracking-widest leading-relaxed" style={{ color: "var(--empty-text)" }}>
                No tests created yet. <br /> Create your first test.
              </p>
              <Link
                to="/teacher/tests/create"
                className="mt-8 font-bold text-[11px] uppercase border-b border-accent pb-1 hover:text-accent transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                Create Test
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {tests.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/teacher/tests/${t.id}`)}
                  className="group rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer relative overflow-hidden"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--card-hover-border)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
                >
                  {/* Hover accent bar */}
                  <div className="absolute top-0 left-0 h-full w-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${t.status === "ACTIVE" ? "bg-accent/10 text-accent border-accent/20" : "bg-gray-500/10 border-gray-500/20"}`}
                        style={t.status !== "ACTIVE" ? { color: "var(--text-muted)" } : {}}>
                        {t.status}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
                        ID: {t.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="font-bold text-[16px] group-hover:text-accent transition-colors uppercase tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
                      {t.name}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] mt-2 font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-2">
                        <Clock size={14} /> {t.duration}M
                      </span>
                      <div className="w-1 h-1 rounded-full" style={{ background: "var(--divider)" }}></div>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />{" "}
                        {new Date(t.startTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", color: "var(--icon-muted)" }}
                  >
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}