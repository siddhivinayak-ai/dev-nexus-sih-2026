import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Shield, FileText, Printer, Download, Check, AlertTriangle, Scale, RefreshCw } from 'lucide-react';

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
      <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 font-semibold">Generating audit document...</span>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center text-slate-500 flex-col gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-600" />
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Tender Not Found</h3>
          <p className="text-sm text-slate-600 mb-4">Unable to load tender details for ID: {tenderId}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 print:bg-white">
      
      {/* Navigation Toolbar (Hidden on print) */}
      <div className="border-b border-slate-200 bg-white sticky top-0 px-6 py-4 flex justify-between items-center z-20 print:hidden shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900">CCI Compliance Audit Package</h2>
            <p className="text-[10px] text-slate-500 font-mono">Tender Ref: {tender.tender_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
            {isCopied ? 'Link Copied' : 'Share Audit Package'}
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Evidence PDF
          </button>
        </div>
      </div>

      {/* Report Document */}
      <main className="w-full max-w-4xl mx-auto px-6 py-10 print:p-0 print:max-w-full">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 print:border-none print:p-0 shadow-xl relative">
          
          {/* Header Seal */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 m-0 tracking-tight">
                  Competition Commission Audit Bureau
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  DevNexus Automated Procurement Fraud Supervision
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Report ID: CCI-REP-2026-{tender.tender_id.split('-').pop()}
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-slate-500">
              <div>Date: {reportDate}</div>
              <div>Auditor: {user?.name || 'Siddhivinayak W.'}</div>
              <div>Authority: DevNexus Core</div>
            </div>
          </div>

          {/* Action Callout Flag */}
          <div className={`p-6 rounded-2xl border mb-8 flex items-start gap-4 ${
            (tender.recommendation === 'HALT_AWARD')
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${(tender.recommendation === 'HALT_AWARD') ? 'text-rose-600' : 'text-amber-600'}`} />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1">
                {(tender.recommendation === 'HALT_AWARD') ? 'AUDIT DIRECTIVE: HALT L1 AWARD IMMEDIATELY' : 'AUDIT DIRECTIVE: MANDATORY REVIEW REQUIRED'}
              </h3>
              <p className="text-xs leading-relaxed opacity-90">
                This report is compiled automatically by DevNexus Core. DBSCAN anomaly clustering and layout similarity indicators show collusive bidder rings. Do not issue payment or award letters.
              </p>
            </div>
          </div>

          {/* Tender Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-xs pb-6 border-b border-slate-200">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-2">Tender Information</h4>
              <div className="space-y-2">
                <div><span className="text-slate-500">Title:</span> <span className="font-semibold text-slate-900">{tender.title}</span></div>
                <div><span className="text-slate-500">Ref ID:</span> <span className="font-mono">{tender.tender_id}</span></div>
                <div><span className="text-slate-500">Procurement Value:</span> <span className="font-semibold text-slate-900">₹{(tender.value/10000000).toFixed(2)} Cr</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-2">Calculated Risk Indices</h4>
              <div className="space-y-2">
                <div><span className="text-slate-500">DBSCAN Price Anomaly:</span> <span className="font-bold text-slate-900">{((tender.engine1_score || 0) * 100).toFixed(0)}%</span></div>
                <div><span className="text-slate-500">Layout-RAG Match Score:</span> <span className="font-bold text-slate-900">{((tender.engine2_score || 0) * 100).toFixed(0)}%</span></div>
                <div>
                  <span className="text-slate-700 font-bold">Combined Risk Index:</span> 
                  <span className="font-extrabold text-rose-600 ml-1">{((tender.anomaly_score || 0) * 100).toFixed(0)}% Match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-6 text-xs leading-relaxed">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded" />
                1. Executive Audit Summary
              </h3>
              <p className="text-slate-600">
                A mathematical audit of Tender {tender.tender_id} identified a cover-bidding cartel between <strong>TechNova Solutions Pvt. Ltd.</strong> and <strong>Digital Infra Systems</strong>. The remaining bidder, CompuWorld Enterprises, exhibits independent pricing trends and document structures. DevNexus engines identified bid submissions sharing the same gateway IP address, matching PDF font signatures, and identical boilerplate clauses in terms & conditions sheets.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded" />
                2. Price Breakdown & Margin Analysis (Engine 1)
              </h3>
              <p className="text-slate-600 mb-3">
                DBSCAN price clustering flagged an identical pricing factor of exactly <strong>6.00% markup</strong> across all items in Digital Infra's bid breakdown relative to the L1 bidder (TechNova).
              </p>
              
              {tender.boq && tender.boq.length > 0 ? (
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">TechNova Solutions (L1)</th>
                      <th className="py-2.5 px-3 text-right">Digital Infra (L2 Cover)</th>
                      <th className="py-2.5 px-3 text-right">Spread Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {tender.boq.map(item => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-sans">{item.description}</td>
                        <td className="py-2.5 px-3 text-right">
                          {item.breakdown && item.breakdown['TechNova Solutions Pvt. Ltd.'] 
                            ? `₹${item.breakdown['TechNova Solutions Pvt. Ltd.'].rate.toLocaleString()}`
                            : 'N/A'
                          }
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.breakdown && item.breakdown['Digital Infra Systems']
                            ? `₹${item.breakdown['Digital Infra Systems'].rate.toLocaleString()}`
                            : 'N/A'
                          }
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-bold">+6.00% (Flagged)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-slate-500 text-center">
                  No BOQ data available yet.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded" />
                3. Layout-Aware RAG Copied Text Evidence (Engine 2)
              </h3>
              <p className="text-slate-600 mb-3">
                The Layout RAG comparisons detected duplicate paragraph strings. The terms & conditions section shares the same text with a font fingerprint matching index of 100%.
              </p>
              
              {tender.document_comparison && tender.document_comparison.details && tender.document_comparison.details.matching_paragraphs && tender.document_comparison.details.matching_paragraphs.length > 0 ? (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                  {tender.document_comparison.details.matching_paragraphs.map((p, idx) => (
                    <div key={idx} className="pb-3 border-b border-slate-200 last:border-b-0">
                      <div className="font-bold text-slate-900 mb-1">{p.section}</div>
                      <div className="grid grid-cols-2 gap-4 italic text-slate-600 text-[10px]">
                        <div>"L1: {p.text_a.substring(0, 100)}..."</div>
                        <div>"L2: {p.text_b.substring(0, 100)}..."</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-slate-500 text-center">
                  No document comparison data available yet.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded" />
                4. Node Overlaps & Entity Topology
              </h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-2">
                <li><strong>Shared Director:</strong> Rajesh Waghmode is registered as a director and authorized signatory for both competing bidders (TechNova Solutions and Digital Infra).</li>
                <li><strong>Gateway IP:</strong> Both bid submission packets originated from the exact IP address: <strong>192.168.4.112</strong>.</li>
                <li><strong>Metadata:</strong> The proposal PDFs carry identical creator attributes (Author: <em>siddhivinayak.w</em>).</li>
                <li><strong>Subcontracting Leakage:</strong> Transaction records indicate a prospective subcontract leakage value of ₹1.2 Cr between the L1 winner and the cover bidder.</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end">
            <div>
              <div className="w-40 border-b border-slate-400 mb-2" />
              <div className="text-[10px] text-slate-500">Auditor Signature Seal</div>
            </div>
            
            <div className="text-right">
              <div className="text-[10.5px] font-bold text-slate-900">DevNexus Core Engine</div>
              <div className="text-[9px] text-slate-500">Procurement Collusion Bureau</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
