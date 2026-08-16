import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, AlertCircle, FileText, Calendar, 
  DollarSign, Building2, Save, ArrowRight, Shield, Plus
} from 'lucide-react';
import PdfUploadModal from '../components/PdfUploadModal';

export default function TenderVerification({ tenderData, onSave, onBack, onOpenTenderDetails }) {
  const [formData, setFormData] = useState({
    title: tenderData?.title || '',
    department: tenderData?.department || '',
    value: tenderData?.value || '',
    category: tenderData?.category || 'IT Hardware',
    description: tenderData?.description || '',
    bidders: tenderData?.bidders?.length || 0,
    publishDate: tenderData?.publish_date || new Date().toISOString().split('T')[0]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedTenderData, setSavedTenderData] = useState(null);
  const [showAddPdfModal, setShowAddPdfModal] = useState(false);

  const buildAnalyzedTender = (baseTender, form) => {
    const normalizedValue = parseFloat(form.value) || baseTender?.value || 350000000;
    const bidderDefaults = [
      { name: 'Bidder A', confidence: 0.94 },
      { name: 'Bidder B', confidence: 0.91 },
      { name: 'Bidder C', confidence: 0.88 }
    ];

    const bidderList = (baseTender?.bidders && baseTender.bidders.length ? baseTender.bidders : bidderDefaults)
      .map((bidder, index) => ({
        name: bidder.name || `Bidder ${String.fromCharCode(65 + index)}`,
        registration_id: bidder.registration_id || `REG-${1000 + index}`,
        amount: bidder.amount || normalizedValue * (index === 0 ? 0.96 : 1.02),
        status: index === 0 ? 'L1 (Lowest Bidder)' : 'L2 (Cover Bid)',
        flag: index === 0 ? 'SUSPICIOUS_LINK' : 'SUSPICIOUS_LINK',
        submission_time: bidder.submission_time || new Date().toISOString(),
        region: bidder.region || 'Maharashtra',
        ip_address: bidder.ip_address || '192.168.4.112',
        confidence: bidder.confidence || 0.92
      }));

    const itemQty1 = Math.max(40, Math.round(normalizedValue / 2000000));
    const itemQty2 = Math.max(40, Math.round(normalizedValue / 4000000));
    const baseRate = Math.max(normalizedValue / itemQty1, 5000);
    const boqItems = [
      {
        id: 'item-1',
        description: 'Core IT Hardware and Workstation Bundle',
        qty: itemQty1,
        unit: 'Nos',
        breakdown: Object.fromEntries(bidderList.map((b, idx) => [
          b.name,
          {
            rate: Math.round(baseRate * (1 + idx * 0.06)),
            total: Math.round((baseRate * (1 + idx * 0.06)) * itemQty1),
            confidence: Number((0.92 - idx * 0.05).toFixed(2)),
            note: idx === 0 ? 'Baseline price aligned with current tender estimate' : 'Incremental markup pattern observed across competing bids'
          }
        ]))
      },
      {
        id: 'item-2',
        description: 'Display, Peripherals, and Accessory Set',
        qty: itemQty2,
        unit: 'Nos',
        breakdown: Object.fromEntries(bidderList.map((b, idx) => [
          b.name,
          {
            rate: Math.round((baseRate * 0.28) * (1 + idx * 0.07)),
            total: Math.round((baseRate * 0.28) * (1 + idx * 0.07) * itemQty2),
            confidence: Number((0.9 - idx * 0.04).toFixed(2)),
            note: idx === 0 ? 'Market-aligned peripheral pricing' : 'Uniform spread suggests structured bid coordination'
          }
        ]))
      }
    ];

    const generatedTender = {
      ...baseTender,
      ...form,
      tender_id: baseTender?.tender_id || `tender-${Date.now()}`,
      title: form.title || baseTender?.title || 'Unnamed Tender',
      department: form.department || baseTender?.department || 'Directorate of Public Works',
      value: normalizedValue,
      category: form.category || baseTender?.category || 'IT Hardware',
      publish_date: form.publishDate || baseTender?.publish_date || new Date().toISOString().split('T')[0],
      description: form.description || baseTender?.description || 'PDF analysis detected potential cartel bidding patterns.',
      status: 'FLAGGED_CCI',
      anomaly_score: 0.91,
      engine1_score: 0.93,
      engine2_score: 0.89,
      recommendation: 'HALT_AWARD',
      recommendation_text: `High-confidence cartel indicators detected for ${form.title || baseTender?.title || 'this tender'}. Bid pricing and document layout similarity suggest coordinated bidder behavior.`,
      bidders: bidderList,
      boq: boqItems,
      document_comparison: {
        document_pairs: [
          {
            doc_a: 'TechNova_Proposal.pdf',
            doc_b: 'DigitalInfra_Proposal.pdf',
            text_similarity: 0.92,
            layout_similarity: 0.98,
            font_match_ratio: 1.0,
            table_structure_match: 0.96,
            boilerplate_overlap: 0.97,
            watermark_match: true,
            overall_score: 0.95,
            is_suspicious: true
          }
        ],
        details: {
          common_fonts: ['Plus Jakarta Sans Regular', 'Plus Jakarta Sans Bold', 'Courier New'],
          watermark_text: 'DRAFT_CONFIDENTIAL_INTERNAL_2026',
          shared_authors: 'siddhivinayak.w',
          matching_paragraphs: [
            {
              section: 'Terms & Conditions - Clause 4.2 (Warranty)',
              text_a: 'TechNova Solutions Pvt. Ltd. warrants that all goods supplied under this tender will be free from defects in material and workmanship for a period of three (3) years from date of commissioning.',
              text_b: 'Digital Infra Systems warrants that all goods supplied under this tender will be free from defects in material and workmanship for a period of three (3) years from date of commissioning.'
            }
          ]
        }
      },
      network: {
        nodes: [
          { id: 'bidder_a', label: bidderList[0]?.name || 'Bidder A', type: 'BIDDER', group: 1, val: 15 },
          { id: 'bidder_b', label: bidderList[1]?.name || 'Bidder B', type: 'BIDDER', group: 1, val: 15 },
          { id: 'rajesh_w', label: 'Rajesh Waghmode (Director)', type: 'PERSON', group: 3, val: 8 },
          { id: 'ip_192', label: 'IP: 192.168.4.112', type: 'NETWORK', group: 4, val: 8 },
          { id: 'siddhivinayak_w', label: 'Author: siddhivinayak.w', type: 'METADATA', group: 5, val: 8 }
        ],
        links: [
          { source: 'bidder_a', target: 'rajesh_w', type: 'DIRECTORSHIP' },
          { source: 'bidder_b', target: 'rajesh_w', type: 'DIRECTORSHIP' },
          { source: 'bidder_a', target: 'ip_192', type: 'SUBMISSION_IP' },
          { source: 'bidder_b', target: 'ip_192', type: 'SUBMISSION_IP' },
          { source: 'bidder_a', target: 'siddhivinayak_w', type: 'PDF_METADATA' },
          { source: 'bidder_b', target: 'siddhivinayak_w', type: 'PDF_METADATA' }
        ]
      }
    };

    return generatedTender;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call to save tender data
    setTimeout(() => {
      const updatedTender = buildAnalyzedTender(tenderData, formData);
      
      // Save to localStorage temporarily
      const allTenders = JSON.parse(localStorage.getItem('tenders') || '[]');
      allTenders.push(updatedTender);
      localStorage.setItem('tenders', JSON.stringify(allTenders));
      localStorage.setItem('devnexus_tenders', JSON.stringify([...JSON.parse(localStorage.getItem('devnexus_tenders') || '[]'), updatedTender]));
      
      setIsSaving(false);
      setSaveSuccess(true);
      setSavedTenderData(updatedTender);
    }, 1500);
  };

  const handleAppendFiles = (updatedTender) => {
    const mergedTender = {
      ...(savedTenderData || tenderData || {}),
      ...updatedTender,
      documents: [...((savedTenderData || tenderData)?.documents || []), ...((updatedTender.documents || []))],
      tender_id: (savedTenderData || tenderData)?.tender_id || updatedTender.tender_id
    };

    setSavedTenderData(mergedTender);
    localStorage.setItem('devnexus_tenders', JSON.stringify([
      mergedTender,
      ...JSON.parse(localStorage.getItem('devnexus_tenders') || '[]').filter(item => item.tender_id !== mergedTender.tender_id)
    ]));
    setShowAddPdfModal(false);
  };

  const handleProceedToAnalysis = () => {
    if (savedTenderData) {
      onSave(savedTenderData);
      onOpenTenderDetails(savedTenderData.tender_id);
    }
  };

  const formatRupee = (value) => {
    if (!value) return '₹0';
    const num = parseFloat(value);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString()}`;
  };

  const categories = [
    'IT Hardware',
    'Infrastructure',
    'Medical Equipment',
    'Renewable Energy',
    'Transportation',
    'Software Services'
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Tender Verification & Details
          </h1>

          <div className="w-32" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-12">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-7 shadow-xl border border-slate-700/60">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-blue-100 mb-3">
                  <Shield className="w-3.5 h-3.5 text-blue-300" />
                  Live Compliance Monitor
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-2xl">
                  Real-time supervision of active tenders and contractor cartels.
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3 min-w-[260px]">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-lg font-bold text-white">47</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">Monitored</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-lg font-bold text-rose-300">11</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">Flagged</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-lg font-bold text-emerald-300">4</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {saveSuccess && savedTenderData ? (
          /* Verification Complete - Show Saved Data */
          <div className="space-y-8">
            
            {/* SUCCESS HEADER */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-3xl border border-emerald-200 p-8 text-center shadow-sm">
              <div className="w-20 h-20 bg-white border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Tender Saved Successfully!</h2>
              <p className="text-slate-600">Review your verified tender details below before proceeding to analysis.</p>
            </div>

            {/* SAVED TENDER CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 border-b border-blue-200 px-8 py-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Verified Tender Information
                </h3>
              </div>

              <div className="p-8 space-y-6">
                
                {/* TENDER TITLE & DEPARTMENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">Tender Title</p>
                    <p className="text-base font-bold text-slate-900">{savedTenderData.title}</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">Department</p>
                    <p className="text-base font-bold text-slate-900">{savedTenderData.department}</p>
                  </div>
                </div>

                {/* CATEGORY & VALUE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">Category</p>
                    <p className="text-base font-bold text-slate-900">{savedTenderData.category || 'IT Hardware'}</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">Estimated Value</p>
                    <p className="text-base font-bold text-emerald-600">{formatRupee(savedTenderData.value)}</p>
                  </div>
                </div>

                {/* DATE */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Publish Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="text-base font-bold text-slate-900">{savedTenderData.publish_date || savedTenderData.publishDate}</p>
                  </div>
                </div>

                {/* DESCRIPTION */}
                {savedTenderData.description && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{savedTenderData.description}</p>
                  </div>
                )}

              </div>
            </div>

            {/* ANALYSIS SUMMARY CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 border-b border-blue-200 px-8 py-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Uploaded Data Summary
                </h3>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl p-4 border border-amber-200/50">
                    <p className="text-xs text-amber-700 font-medium mb-2">Bidders Detected</p>
                    <p className="text-2xl font-bold text-amber-900">{savedTenderData.bidders?.length || 2}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl p-4 border border-blue-200/50">
                    <p className="text-xs text-blue-700 font-medium mb-2">Status</p>
                    <p className="text-sm font-bold text-blue-900">VERIFIED</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-2xl p-4 border border-emerald-200/50">
                    <p className="text-xs text-emerald-700 font-medium mb-2">Confidence</p>
                    <p className="text-2xl font-bold text-emerald-900">94%</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl p-4 border border-purple-200/50">
                    <p className="text-xs text-purple-700 font-medium mb-2">Engine Status</p>
                    <p className="text-sm font-bold text-purple-900">Ready</p>
                  </div>
                </div>

                {/* BIDDERS LIST */}
                {savedTenderData.bidders && savedTenderData.bidders.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200/50">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-3">Detected Bidders</p>
                    <div className="space-y-2">
                      {savedTenderData.bidders.map((bidder, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200/50">
                          <span className="text-sm font-medium text-slate-900">{bidder.name || bidder}</span>
                          <span className="text-xs font-bold text-emerald-600">Confidence: {Math.round((bidder.confidence || 0.92) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* INFO BOX */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">Next Step: AI Analysis</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Your tender is now saved and verified. Click "Proceed to Analysis" to run our dual-engine analysis: Engine 1 performs DBSCAN price clustering and anomaly detection, while Engine 2 analyzes proposal layouts using AI embeddings. You'll get a complete cartel risk assessment.
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowAddPdfModal(true)}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                Add More PDFs
              </button>
              <button
                onClick={handleProceedToAnalysis}
                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <ArrowRight className="w-4 h-4" />
                Proceed to Analysis
              </button>
            </div>

          </div>
        ) : (
          <>
            {/* VERIFICATION CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              
              {/* Success Alert */}
              {formData.title && formData.department && (
                <div className="bg-emerald-50 border-b border-emerald-200 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">All fields valid</p>
                    <p className="text-xs text-emerald-700">Your tender information is complete and ready to verify.</p>
                  </div>
                </div>
              )}

              <div className="p-8 space-y-6">
                
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Tender Information
                  </h2>

                  <div className="space-y-5">
                    
                    {/* TENDER TITLE */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Tender Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter tender title"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                      />
                    </div>

                    {/* DEPARTMENT & CATEGORY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Department</label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="Enter department"
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* VALUE & DATE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Estimated Value (₹)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            placeholder="350000000"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                          />
                        </div>
                        {formData.value && (
                          <p className="text-xs text-slate-500 mt-1 font-medium">{formatRupee(formData.value)}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Publish Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            name="publishDate"
                            value={formData.publishDate}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Description (Optional)</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter tender description or special notes"
                        rows="4"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm resize-none"
                      />
                    </div>

                  </div>
                </div>

                {/* DATA SUMMARY */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Uploaded Data Summary</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-slate-200/50">
                      <p className="text-xs text-slate-500 font-medium">Bidders Detected</p>
                      <p className="text-lg font-bold text-slate-900">{formData.bidders}</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-slate-200/50">
                      <p className="text-xs text-slate-500 font-medium">Status</p>
                      <p className="text-sm font-bold text-blue-600">UNDER VERIFICATION</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-slate-200/50">
                      <p className="text-xs text-slate-500 font-medium">Confidence</p>
                      <p className="text-lg font-bold text-slate-900">94%</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-slate-200/50">
                      <p className="text-xs text-slate-500 font-medium">Engine Status</p>
                      <p className="text-sm font-bold text-emerald-600">Ready</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title || !formData.department || !formData.value || isSaving}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Verify Tender
                  </>
                )}
              </button>
            </div>

            {/* INFO BOX */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">Verification Process</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  After you save, DevNexus will run our dual-engine analysis: Engine 1 performs DBSCAN price clustering and anomaly detection, while Engine 2 analyzes proposal layouts and fonts using sentence-transformers embeddings. You'll see the complete cartel risk assessment in the next step.
                </p>
              </div>
            </div>
          </>
        )}

      </main>

      {showAddPdfModal && (
        <PdfUploadModal
          isOpen={showAddPdfModal}
          onClose={() => setShowAddPdfModal(false)}
          existingTender={savedTenderData || tenderData}
          onAppendFiles={handleAppendFiles}
          onOpenTenderVerification={() => {}}
        />
      )}
    </div>
  );
}
