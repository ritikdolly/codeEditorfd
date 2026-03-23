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
     EASY: "text-[#2df07b] bg-[#2df07b]/5 border-[#2df07b]/10",
     MEDIUM: "text-amber-500 bg-amber-500/5 border-amber-500/10",
     HARD: "text-rose-500 bg-rose-500/5 border-rose-500/10",
  };

  return (
    <div className="animate-fade-in pb-20 space-y-12 relative z-10">
      {/* Strategic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#2df07b]/10 text-[#2df07b] rounded-lg border border-[#2df07b]/20">
              <LayoutDashboard size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              Teacher Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-3 text-[16px] font-medium max-w-xl">
            Welcome back,{" "}
            <span className="text-white font-bold">{user?.name}</span>. Manage
            your question bank and active tests.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/teacher/questions/create"
            className="bg-[#111111] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center gap-3 text-sm uppercase tracking-widest group shadow-xl"
          >
            <Database
              size={18}
              className="group-hover:rotate-12 transition-transform"
            />{" "}
            New Question
          </Link>
          <Link
            to="/teacher/tests/create"
            className="bg-[#2df07b] hover:bg-[#25c464] text-black font-bold py-3.5 px-8 rounded-xl transition-all flex items-center gap-3 text-sm shadow-lg shadow-[#2df07b]/20 active:scale-95 uppercase tracking-widest"
          >
            <Zap size={18} fill="currentColor" stroke="none" /> Create Test
          </Link>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Questions",
            val: questions.length,
            icon: HelpCircle,
            color: "#2df07b",
            desc: "Question Bank",
          },
          {
            label: "Active Tests",
            val: tests.length,
            icon: ClipboardList,
            color: "#3b82f6",
            desc: "Created Tests",
          },
          {
            label: "Engagement",
            val: "98%",
            icon: Activity,
            color: "#a855f7",
            desc: "Student Activity",
          },
          {
            label: "Results",
            val: "12",
            icon: Award,
            color: "#f59e0b",
            desc: "Tests Graded",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-xl hover:border-white/20 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] text-white transition-opacity pointer-events-none">
              <stat.icon size={160} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 font-bold text-[11px] uppercase tracking-[0.2em] mb-6">
                {stat.label}
              </span>
              <div className="flex items-end justify-between relative z-10">
                <p className="text-5xl font-bold text-white leading-none tracking-tighter">
                  {stat.val}
                </p>
                <div className="p-3 bg-white/5 rounded-xl text-gray-500 group-hover:bg-[#2df07b]/10 group-hover:text-[#2df07b] transition-all border border-white/5">
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-gray-400 mt-5 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
        {/* Recent Vectors */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
                Question Bank
              </h2>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">
                Recently added questions
              </p>
            </div>
            <Link
              to="/teacher/questions"
              className="p-2.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-xl transition-all shadow-xl group"
            >
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {questions.length === 0 ? (
            <div className="bg-[#111111] border border-white/5 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl">
              <BookOpen
                className="text-white/5 mb-6"
                size={64}
                strokeWidth={1}
              />
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                No questions found. <br /> Create your first question.
              </p>
              <Link
                to="/teacher/questions/create"
                className="mt-8 text-white font-bold text-[11px] uppercase border-b border-[#2df07b] pb-1 hover:text-[#2df07b] transition-colors"
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
                  className="group bg-[#111111] border border-white/10 hover:border-[#2df07b]/30 rounded-2xl p-4.5 flex items-center justify-between transition-all shadow-xl cursor-pointer"
                >
                  <div className="flex items-center gap-5 min-w-0 pr-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#2df07b]/10 group-hover:text-[#2df07b] transition-all border border-white/5">
                      <Database size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[15px] truncate uppercase tracking-tight">
                        {q.title}
                      </p>
                      <div className="flex items-center gap-4 text-gray-500 text-[10px] mt-1.5 font-bold uppercase tracking-widest">
                        <span>{q.marks} Pts</span>
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                        <span className="flex items-center gap-1.5">
                          <Zap size={12} className="text-amber-500" />{" "}
                          {q.expectedTimeComplexity || "O(n)"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest shrink-0 transition-all ${difficultyColor[q.difficulty] || "text-gray-500 bg-white/5 border-white/5"}`}
                  >
                    {q.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Protocols */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
                History
              </h2>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">
                Recent test activity
              </p>
            </div>
            <Link
              to="/teacher/results"
              className="p-2.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-xl transition-all shadow-xl group"
            >
              <Activity
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </Link>
          </div>

          {tests.length === 0 ? (
            <div className="bg-[#111111] border border-white/5 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl">
              <ClipboardList
                className="text-white/5 mb-6"
                size={64}
                strokeWidth={1}
              />
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                No tests created yet. <br /> Create your first test.
              </p>
              <Link
                to="/teacher/tests/create"
                className="mt-8 text-white font-bold text-[11px] uppercase border-b border-[#2df07b] pb-1 hover:text-[#2df07b] transition-colors"
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
                  className="group bg-[#111111] border border-white/10 hover:border-[#2df07b]/30 rounded-2xl p-5 flex items-center justify-between transition-all shadow-xl cursor-pointer relative overflow-hidden"
                >
                  {/* Progress Visual */}
                  <div className="absolute top-0 left-0 h-full w-1 bg-[#2df07b] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${t.status === "ACTIVE" ? "bg-[#2df07b]/10 text-[#2df07b] border-[#2df07b]/20" : "bg-white/5 text-gray-500 border-white/5"}`}
                      >
                        {t.status}
                      </span>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        ID: {t.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="font-bold text-white text-[16px] group-hover:text-[#2df07b] transition-colors uppercase tracking-tight truncate">
                      {t.name}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Clock size={14} /> {t.duration}M
                      </span>
                      <div className="w-1 h-1 rounded-full bg-white/10"></div>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />{" "}
                        {new Date(t.startTime).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-black transition-all border border-white/5 shadow-xl">
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