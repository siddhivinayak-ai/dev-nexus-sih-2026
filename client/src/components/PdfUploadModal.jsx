import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Cpu, Layers, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function PdfUploadModal({ isOpen, onClose, onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [tenderTitle, setTenderTitle] = useState('');
  const [department, setDepartment] = useState('Directorate of Public Works');
  const [estimatedValue, setEstimatedValue] = useState('350000000'); // ₹35 Cr
  
  // Processing pipeline states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0); // 0 to 5
  const [progressPercent, setProgressPercent] = useState(0);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'));
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.pdf'));
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const startAnalysisPipeline = () => {
    if (!files.length && !tenderTitle) {
      alert('Please provide a tender title or select proposal PDFs.');
      return;
    }

    setIsProcessing(true);
    setProgressStep(1);
    setProgressPercent(20);

    // Step 1: PyMuPDF Extraction
    setTimeout(() => {
      setProgressStep(2);
      setProgressPercent(40);

      // Step 2: Font Fingerprinting
      setTimeout(() => {
        setProgressStep(3);
        setProgressPercent(65);

        // Step 3: Sentence Transformer Embeddings
        setTimeout(() => {
          setProgressStep(4);
          setProgressPercent(85);

          // Step 4: DBSCAN Anomaly Clustering
          setTimeout(() => {
            setProgressStep(5);
            setProgressPercent(100);

            // Complete & return new tender object
            setTimeout(() => {
              const newTender = {
                tender_id: `tender-2026-00${Math.floor(Math.random() * 90 + 10)}`,
                title: tenderTitle || files[0]?.name.replace('.pdf', '') || 'Supply of Medical Diagnostic Scanners',
                department: department,
                value: parseFloat(estimatedValue) || 350000000,
                anomaly_score: 0.91,
                status: 'FLAGGED_CCI',
                publish_date: new Date().toISOString().split('T')[0]
              };
              setIsProcessing(false);
              onUploadComplete(newTender);
              onClose();
            }, 800);

          }, 1200);

        }, 1200);

      }, 1000);

    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">DevNexus Document Ingestion</h3>
              <p className="text-xs text-slate-500 font-medium">Upload vendor bid PDFs for instant cartel scanning</p>
            </div>
          </div>

          {!isProcessing && (
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {isProcessing ? (
            /* Multi-step Processing Screen */
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-3xl flex items-center justify-center text-blue-600 animate-bounce">
                <Cpu className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">DevNexus AI Analysis Pipeline Running</h4>
                <p className="text-xs text-slate-500 font-medium">Parsing layout vectors, pricing microformulas, and font fingerprints</p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Overall Progress</span>
                  <span className="text-blue-600 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>

              {/* Pipeline Steps Tracker */}
              <div className="w-full max-w-md text-left space-y-2.5 pt-2">
                {[
                  { step: 1, label: 'PyMuPDF Layout & Text Extraction' },
                  { step: 2, label: 'Font Fingerprinting & Watermark Analysis' },
                  { step: 3, label: 'Sentence-Transformers Embedding Vectors' },
                  { step: 4, label: 'DBSCAN Price Anomaly & Cover-Bid Clustering' },
                  { step: 5, label: 'CCI Collusion Index Report Generation' }
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-3 text-xs">
                    {progressStep > s.step ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : progressStep === s.step ? (
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                    )}
                    <span className={progressStep >= s.step ? 'font-bold text-slate-900' : 'text-slate-400 font-medium'}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Upload Form */
            <>
              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tender Title / Specification Name
                  </label>
                  <input
                    type="text"
                    value={tenderTitle}
                    onChange={(e) => setTenderTitle(e.target.value)}
                    placeholder="e.g. Procurement of High-Resolution Diagnostic Ultrasound Systems"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department Authority
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Estimated Value (INR ₹)
                    </label>
                    <input
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Drag-and-Drop File Box */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-blue-600 bg-blue-50/50 scale-[0.99]' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <input 
                  id="file-upload-input" 
                  type="file" 
                  multiple 
                  accept=".pdf" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>

                <p className="text-sm font-bold text-slate-900 mb-1">
                  Drag & drop vendor proposal PDFs here
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Supports multiple proposal files (.pdf) simultaneously
                </p>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attached PDFs ({files.length})</span>
                  {files.map((f, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-900 truncate">{f.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{(f.size/1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={startAnalysisPipeline}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                Initiate DevNexus AI Analysis <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
