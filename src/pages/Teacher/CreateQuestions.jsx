import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, List } from 'lucide-react';

export default function CreateQuestions() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  
  const [newQuestion, setNewQuestion] = useState({
    title: '', description: '', difficulty: 'MEDIUM', marks: 10
  });
  const [addingQuestion, setAddingQuestion] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  const fetchQuestions = () => {
    // Requires a new backend endpoint to fetch questions by testId for Teacher 
    // Wait, we assume student endpoint is active, but teacher can re-use it or similar
    api.get(`/student/tests/${testId}/questions`)
      .then(res => setQuestions(res.data))
      .catch(err => console.log("Ignore initial fetch if no questions exist", err));
  };

  const saveQuestion = () => {
    if (!newQuestion.title || !newQuestion.description) return toast.error("Title and description required");
    setAddingQuestion(true);
    api.post(`/teacher/tests/${testId}/questions`, newQuestion)
      .then(() => {
        toast.success("Question Added!");
        setNewQuestion({ title: '', description: '', difficulty: 'MEDIUM', marks: 10 });
        fetchQuestions();
      })
      .catch(err => toast.error("Error adding question"))
      .finally(() => setAddingQuestion(false));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold">Manage Test Questions</h1>
           <button onClick={() => navigate('/teacher')} className="text-blue-600 font-medium hover:underline">Back to Dashboard</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-1 space-y-4">
               <h2 className="text-lg font-semibold flex items-center gap-2"><List size={18}/> Existing Questions ({questions.length})</h2>
               {questions.map((q, i) => (
                   <div key={q.id || i} className="bg-white p-4 rounded shadow border border-gray-200">
                       <h3 className="font-bold text-gray-800">{q.title}</h3>
                       <p className="text-xs text-gray-500 mt-1">{q.difficulty} • {q.marks} Marsks</p>
                       <p className="text-sm mt-2 font-mono text-gray-600 truncate">{q.description}</p>
                       {/* Note: Test Cases logic should go here, simplifying for MVP */}
                   </div>
               ))}
           </div>
           
           <div className="md:col-span-2">
              <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                 <h2 className="text-xl font-bold mb-4">Add New Question</h2>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Problem Title</label>
                        <input type="text" value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                            <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Marks</label>
                            <input type="number" value={newQuestion.marks} onChange={e => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Problem Statement & Constraints</label>
                        <textarea rows={6} value={newQuestion.description} onChange={e => setNewQuestion({...newQuestion, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 font-mono text-sm"></textarea>
                    </div>
                    <button onClick={saveQuestion} disabled={addingQuestion} className="w-full mt-4 flex justify-center items-center gap-2 bg-slate-800 text-white p-2 rounded hover:bg-slate-900">
                        <Plus size={18}/> {addingQuestion ? 'Saving...' : 'Save Question to Test'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
