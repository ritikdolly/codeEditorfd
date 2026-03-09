import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherService } from '../../services/api';
import { BarChart2, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

export function TeacherResults() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherService.getTests()
      .then(setTests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-600/20">
          <BarChart2 className="text-purple-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Test Results Hub</h1>
          <p className="text-slate-400 text-sm">Select a test to view student submissions, evaluate performance, and download CSV reports.</p>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center border-dashed">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Tests Found</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            You haven't created any tests yet. Create a test to invite students and track their coding performance.
          </p>
          <Link to="/teacher/tests/create" className="btn-primary">
            Create First Test
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map(test => (
            <div key={test.id} className="glass-card p-5 flex flex-col hover:border-purple-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white truncate pr-4" title={test.name}>{test.name}</h3>
                <span className={`badge shrink-0 text-xs ${test.status === 'ACTIVE' ? 'badge-green' : 'badge-blue'}`}>
                  {test.status || 'SCHEDULED'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center text-slate-400 text-sm gap-2">
                  <Clock size={16} />
                  <span>Duration: <span className="text-slate-200">{test.duration} mins</span></span>
                </div>
                {test.startTime && (
                  <div className="flex items-center text-slate-400 text-sm gap-2">
                    <BarChart2 size={16} />
                    <span>Started: <span className="text-slate-200">{new Date(test.startTime).toLocaleDateString()}</span></span>
                  </div>
                )}
              </div>
              
              <Link 
                to={`/teacher/tests/${test.id}`}
                className="btn-secondary w-full justify-center group-hover:bg-purple-600/20 group-hover:text-purple-300 group-hover:border-purple-500/50 transition-all"
              >
                View Detailed Results <ArrowRight size={16} className="ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
