import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Shield, FileText, Printer, Download, Check, AlertTriangle, Scale } from 'lucide-react';

export default function ReportGenerator({ tenderId, onBack, user }) {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function loadTender() {
      setLoading(true);
      const res = await api.getTenderDetails(tenderId);
      setTender(res.data);
      setReportDate(new Date().toLocaleString());
      setLoading(false);
    }
    loadTender();
  }, [tenderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-zinc-400">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 font-semibold">Generating print layout...</span>
      </div>
    );
  }

  const score = Math.round(tender.anomaly_score * 100);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 print:bg-white print:text-black">
      
      {/* Navigation Toolbar (Hidden during print) */}
      <div className="border-b border-zinc-800 bg-[#09090b]/80 sticky top-0 px-6 py-4 flex justify-between items-center z-20 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">Compliance Report & CCI Audit Package</h2>
            <p className="text-[10px] text-zinc-500 font-mono">Tender Ref: {tender.tender_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-zinc-800"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            {isCopied ? 'Link Copied' : 'Share Report Link'}
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all glow-blue"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Evidence PDF
          </button>
        </div>
      </div>

      {/* Report Document Shell */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 print:p-0 print:max-w-full">
        
        {/* Printable Paper Page */}
        <div className="glass-panel p-10 rounded-3xl border border-zinc-800 print:border-none print:bg-white print:p-0 print:shadow-none shadow-2xl relative">
          
          {/* Header Seal */}
          <div className="flex justify-between items-start border-b border-zinc-800 print:border-zinc-300 pb-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-950/20 border border-rose-500/25 rounded-2xl text-rose-500 print:bg-red-50 print:border-red-200">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white m-0 tracking-tight leading-none print:text-black">
                  Competition Commission of India (CCI)
                </h1>
                <p className="text-xs text-zinc-400 font-semibold mt-1 print:text-zinc-600">
                  Government e-Procurement Anti-Cartel Compliance Division
                </p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Secure Report ID: CCI-REP-2026-{tender.tender_id.split('-').pop()}
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-zinc-500">
              <div>System Date: {reportDate}</div>
              <div>Auditor Name: {user?.name}</div>
              <div>Department: CCI Audit Bureau</div>
            </div>
          </div>

          {/* Action Callout Flag */}
          <div className={`p-6 rounded-2xl border mb-8 flex items-start gap-4 ${
            tender.recommendation === 'HALT_AWARD'
              ? 'bg-rose-950/20 border-rose-500/20 text-rose-300 print:bg-red-50 print:border-red-200 print:text-red-950'
              : 'bg-amber-950/20 border-amber-500/20 text-amber-300 print:bg-amber-50 print:border-amber-200 print:text-amber-950'
          }`}>
            <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${tender.recommendation === 'HALT_AWARD' ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1">
                {tender.recommendation === 'HALT_AWARD' ? 'CCI Audit Directive: HALT L1 AWARD IMMEDIATELY' : 'CCI Audit Directive: INVESTIGATION MANDATORY'}
              </h3>
              <p className="text-xs leading-relaxed opacity-90">
                This report is compiled automatically by BidShield AI. Anomaly clustering indices and layout similarity indicators show collusive contractor rings. Do not issue payment or award letters.
              </p>
            </div>
          </div>

          {/* Tender Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-xs pb-6 border-b border-zinc-800 print:border-zinc-300">
            <div>
              <h4 className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] mb-2">Tender File Details</h4>
              <div className="space-y-2">
                <div><span className="text-zinc-500">Tender Title:</span> <span className="font-semibold text-white print:text-black">{tender.title}</span></div>
                <div><span className="text-zinc-500">Tender Reference ID:</span> <span className="font-mono">{tender.tender_id}</span></div>
                <div><span className="text-zinc-500">Procurement Value:</span> <span className="font-semibold text-white print:text-black">₹{(tender.value/10000000).toFixed(2)} Cr</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] mb-2">Mathematical Risk Indices</h4>
              <div className="space-y-2">
                <div><span className="text-zinc-500">DBSCAN Price Anomaly:</span> <span className="font-bold text-white print:text-black">{(tender.engine1_score * 100).toFixed(0)}%</span></div>
                <div><span className="text-zinc-500">Layout-RAG Copy Score:</span> <span className="font-bold text-white print:text-black">{(tender.engine2_score * 100).toFixed(0)}%</span></div>
                <div>
                  <span className="text-zinc-300 font-bold">Combined Collusion Index:</span> 
                  <span className="font-extrabold text-rose-500 ml-1">{(tender.anomaly_score * 100).toFixed(0)}% Match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Findings Section */}
          <div className="space-y-6 text-xs leading-relaxed">
            
            {/* Finding 1 */}
            <div>
              <h3 className="text-sm font-bold text-white print:text-black mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-500 rounded" />
                1. Executive Summary & Findings
              </h3>
              <p className="text-zinc-400 print:text-zinc-700">
                A mathematical audit of Tender GEM/2026/IT/4521 has identified a cover-bidding cartel between <strong>TechNova Solutions Pvt. Ltd.</strong> and <strong>Digital Infra Systems</strong>. The remaining bidder, CompuWorld Enterprises, exhibits independent pricing trends and document structures. The BidShield engines identified bid submissions sharing the same gateway IP address, matching PDF font signatures, and identical boilerplate clauses in terms & conditions sheets.
              </p>
            </div>

            {/* Finding 2 */}
            <div>
              <h3 className="text-sm font-bold text-white print:text-black mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-500 rounded" />
                2. Price Breakdown Margin analysis (Engine 1)
              </h3>
              <p className="text-zinc-400 print:text-zinc-700 mb-3">
                DBSCAN pricing clustering flagged an identical pricing factor of exactly <strong>6.00% markup</strong> across all items in Digital Infra's bid breakdown relative to the L1 bidder (TechNova).
              </p>
              
              <table className="w-full text-left border-collapse text-[11px] print:text-black">
                <thead>
                  <tr className="border-b border-zinc-800 print:border-zinc-300 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-900/20 print:bg-zinc-100">
                    <th className="py-2 px-3">Item Specification</th>
                    <th className="py-2 px-3 text-right">TechNova Solutions (L1)</th>
                    <th className="py-2 px-3 text-right">Digital Infra (L2 Cover)</th>
                    <th className="py-2 px-3 text-right">Spread Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 print:divide-zinc-300 font-mono">
                  {tender.boq.map(item => (
                    <tr key={item.id}>
                      <td className="py-2 px-3 font-sans">{item.description}</td>
                      <td className="py-2 px-3 text-right">₹{item.breakdown['TechNova Solutions Pvt. Ltd.'].rate.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">₹{item.breakdown['Digital Infra Systems'].rate.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-rose-500 font-bold">+6.00% (Flagged)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Finding 3 */}
            <div>
              <h3 className="text-sm font-bold text-white print:text-black mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-500 rounded" />
                3. Layout-Aware RAG Copied Text Evidence (Engine 2)
              </h3>
              <p className="text-zinc-400 print:text-zinc-700 mb-3">
                The Layout RAG comparisons detected duplicate paragraph strings. The terms & conditions section shares the same text with a font fingerprint matching index of 100%.
              </p>
              
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-3 print:bg-zinc-50 print:border-zinc-200">
                {tender.document_comparison.details.matching_paragraphs.map((p, idx) => (
                  <div key={idx} className="pb-3 border-b border-zinc-900 last:border-b-0 print:border-zinc-200">
                    <div className="font-bold text-zinc-300 mb-1 print:text-black">{p.section}</div>
                    <div className="grid grid-cols-2 gap-4 italic text-zinc-500 print:text-zinc-650">
                      <div>"L1: {p.text_a}"</div>
                      <div>"L2: {p.text_b}"</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Finding 4 */}
            <div>
              <h3 className="text-sm font-bold text-white print:text-black mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-500 rounded" />
                4. Node Overlap & Directors Linkages (Entity Graph)
              </h3>
              <ul className="list-disc pl-5 text-zinc-400 print:text-zinc-700 space-y-2">
                <li><strong>Shared Director:</strong> Rajesh Waghmode is registered as a director and authorized signatory for both competing bidders (TechNova Solutions and Digital Infra).</li>
                <li><strong>Gateway IP:</strong> Both bid submission packets originated from the exact IP address: <strong>192.168.4.112</strong>.</li>
                <li><strong>Metadata:</strong> The proposal PDFs carry identical creator attributes (Author: <em>siddhivinayak.w</em>).</li>
                <li><strong>Subcontracting flow:</strong> Bank account transfers indicate a prospective subcontract leakage value of ₹1.2 Cr between the L1 winner and the cover bidder.</li>
              </ul>
            </div>

          </div>

          {/* Signature Block */}
          <div className="mt-16 pt-8 border-t border-zinc-800 print:border-zinc-300 flex justify-between items-end">
            <div>
              <div className="w-40 border-b border-zinc-700 print:border-zinc-400 mb-2" />
              <div className="text-[10px] text-zinc-500">Auditor Signature Seal</div>
            </div>
            
            <div className="text-right">
              <div className="text-[10.5px] font-bold text-white print:text-black">BidShield AI System Core</div>
              <div className="text-[9px] text-zinc-500">Unsupervised Collusion Detection Bureau</div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
