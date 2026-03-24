import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, Download, AlertTriangle, RefreshCw, Loader } from 'lucide-react';
import { campusAdminService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const CSV_TEMPLATE = `name,email,phone,role\nAlice Smith,alice@univ.edu,9000000001,STUDENT\nBob Jones,bob@univ.edu,9000000002,TEACHER\nCarol Lee,carol@univ.edu,9000000003,MENTOR`;

export const BulkUpload = () => {
  const { user } = useAuthStore();
  const campusId = user?.campusId;
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | previewing | processing | done

  const handleFile = (f) => {
    setFile(f);
    setPreview(null);
    setResult(null);
    setPhase('idle');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handlePreview = async () => {
    if (!file) return;
    setPhase('previewing');
    try {
      const data = await campusAdminService.previewUpload(file);
      setPreview(data);
      setPhase('previewed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Preview failed');
      setPhase('idle');
    }
  };

  const handleProcess = async () => {
    if (!file || !campusId) return;
    setPhase('processing');
    try {
      const data = await campusAdminService.processUpload(file, campusId);
      setResult(data);
      setPhase('done');
      toast.success(`${data.successCount} users created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Processing failed');
      setPhase('previewed');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'bulk_upload_template.csv'; a.click();
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setPhase('idle'); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Upload size={22} className="text-emerald-400" /> Bulk Upload</h1>
          <p className="text-slate-400 text-sm mt-1">Import multiple users at once via CSV or Excel</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl transition-colors">
            <Download size={15} /> Download Template
          </button>
          {(file || preview || result) && (
            <button onClick={reset} className="flex items-center gap-2 text-sm text-slate-400 border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-colors">
              <RefreshCw size={15} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-600 hover:border-purple-500/50 hover:bg-purple-500/5'}`}
        onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <div className="space-y-2">
            <FileText size={36} className="mx-auto text-emerald-400" />
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={36} className="mx-auto text-slate-500" />
            <p className="text-white font-medium">Drop your CSV or Excel file here</p>
            <p className="text-slate-400 text-sm">or click to browse</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!file && (
        <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl text-sm text-slate-300">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" /> Required Columns Instructions
          </h3>
          <p className="mb-4 text-slate-400">For successful uploadation, ensure your file contains the following exact column headers:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded w-fit">name</span>
              <span className="text-slate-400 text-xs">Full legal name of the user</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded w-fit">email</span>
              <span className="text-slate-400 text-xs">Valid and unique email address</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded w-fit">phone</span>
              <span className="text-slate-400 text-xs">Contact phone number</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded w-fit">role</span>
              <span className="text-slate-400 text-xs">Must be exactly <code className="text-white font-semibold">STUDENT</code>, <code className="text-white font-semibold">TEACHER</code>, or <code className="text-white font-semibold">MENTOR</code></span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {file && phase !== 'done' && (
        <div className="flex gap-3">
          <button onClick={handlePreview} disabled={phase === 'previewing' || phase === 'processing'}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {phase === 'previewing' ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
            {phase === 'previewing' ? 'Validating…' : 'Preview & Validate'}
          </button>
          {preview && (
            <button onClick={handleProcess} disabled={phase === 'processing' || preview.validCount === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {phase === 'processing' ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
              {phase === 'processing' ? 'Uploading…' : `Upload ${preview.validCount} Users`}
            </button>
          )}
        </div>
      )}

      {/* Preview Results */}
      <AnimatePresence>
        {preview && phase !== 'done' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Rows', value: preview.totalRows, color: 'text-slate-300' },
                { label: 'Valid', value: preview.validCount, color: 'text-emerald-400' },
                { label: 'Invalid', value: preview.invalidCount, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            {preview.errors?.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Validation Errors</p>
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {preview.errors.map((e, i) => (
                    <li key={i} className="text-xs text-red-300 font-mono bg-red-500/10 px-3 py-1.5 rounded-lg">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Process Results */}
      <AnimatePresence>
        {result && phase === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
              <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-xl font-bold text-white">{result.successCount} Users Created!</p>
              {result.failCount > 0 && <p className="text-sm text-amber-400 mt-1">{result.failCount} rows skipped</p>}
            </div>
            {result.errors?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <p className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Skipped Rows</p>
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-xs text-amber-300/80 font-mono bg-amber-500/10 px-3 py-1.5 rounded-lg">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
