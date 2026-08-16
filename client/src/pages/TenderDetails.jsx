import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import PdfUploadModal from '../components/PdfUploadModal';
import { 
  ArrowLeft, Shield, CheckCircle2, AlertTriangle, AlertCircle, FileText, 
  MessageSquare, Sparkles, ChevronRight, Eye, RefreshCw, 
  Search, GitCompare, Share2, CornerDownRight, Database, TrendingUp, Info, Plus
} from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, Legend } from 'recharts';

export default function TenderDetails({ tenderId, onBack, onOpenReport, user }) {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('engine1');
  
  const [selectedHighlightId, setSelectedHighlightId] = useState(null);
  const [pdfActiveDoc, setPdfActiveDoc] = useState('a');
  const [showAddPdfModal, setShowAddPdfModal] = useState(false);
  const pdfViewerRef = useRef(null);

  const [showCopilot, setShowCopilot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hello! I am your DevNexus Compliance Copilot. I have parsed the bidding data and proposal PDFs for this tender. Ask me anything, e.g., 'Compare terms of TechNova and Digital Infra' or 'Is there an IP address match?'" }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [hoveredCell, setHoveredCell] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function loadTender() {
      setLoading(true);
      try {
        const res = await api.getTenderDetails(tenderId);
        let nextTender = res?.data || null;

        if (!nextTender) {
          const storedTenders = JSON.parse(localStorage.getItem('devnexus_tenders') || '[]');
          nextTender = storedTenders.find(item => item.tender_id === tenderId) ||
            JSON.parse(localStorage.getItem('tenders') || '[]').find(item => item.tender_id === tenderId) ||
            null;
        }

        setTender(nextTender);
      } catch (error) {
        const storedTenders = JSON.parse(localStorage.getItem('devnexus_tenders') || '[]');
        setTender(storedTenders.find(item => item.tender_id === tenderId) || null);
      } finally {
        setLoading(false);
      }
    }
    if (tenderId) {
      loadTender();
    }
  }, [tenderId]);

  useEffect(() => {
    if (activeTab === 'graph' && canvasRef.current && tender?.network) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 450;
      
      const nodes = tender.network.nodes;
      const links = tender.network.links;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      const groupColors = {
        1: '#ef4444', 
        2: '#10b981', 
        3: '#f59e0b', 
        4: '#2563eb', 
        5: '#7c3aed', 
        6: '#db2777'  
      };

      nodes.forEach((node, idx) => {
        if (!node.x) {
          const angle = (idx / nodes.length) * 2 * Math.PI;
          const radius = Math.min(width, height) * 0.35;
          node.x = centerX + radius * Math.cos(angle);
          node.y = centerY + radius * Math.sin(angle);
        }
      });

      for (let step = 0; step < 50; step++) {
        links.forEach(link => {
          const sNode = nodes.find(n => n.id === link.source);
          const tNode = nodes.find(n => n.id === link.target);
          if (sNode && tNode) {
            const dx = tNode.x - sNode.x;
            const dy = tNode.y - sNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 120) * 0.05;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            sNode.x += fx;
            sNode.y += fy;
            tNode.x -= fx;
            tNode.y -= fy;
          }
        });

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 180) {
              const force = (180 - dist) * 0.15;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              n1.x -= fx;
              n1.y -= fy;
              n2.x += fx;
              n2.y += fy;
            }
          }
          nodes[i].x += (centerX - nodes[i].x) * 0.02;
          nodes[i].y += (centerY - nodes[i].y) * 0.02;
        }
      }

      const render = () => {
        ctx.clearRect(0, 0, width, height);

        links.forEach(link => {
          const sNode = nodes.find(n => n.id === link.source);
          const tNode = nodes.find(n => n.id === link.target);
          if (sNode && tNode) {
            ctx.beginPath();
            ctx.moveTo(sNode.x, sNode.y);
            ctx.lineTo(tNode.x, tNode.y);
            ctx.strokeStyle = link.type === 'PAYOUT' || link.type === 'RECEIPT' ? '#db2777' : '#cbd5e1';
            ctx.lineWidth = link.type === 'PAYOUT' || link.type === 'RECEIPT' ? 2 : 1.5;
            if (link.type === 'PAYOUT' || link.type === 'RECEIPT') {
              ctx.setLineDash([5, 5]);
            } else {
              ctx.setLineDash([]);
            }
            ctx.stroke();

            if (link.type === 'DIRECTORSHIP' || link.type === 'SUBMISSION_IP' || link.type === 'PAYOUT') {
              const mx = (sNode.x + tNode.x) / 2;
              const my = (sNode.y + tNode.y) / 2;
              ctx.fillStyle = '#64748b';
              ctx.font = '9px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(link.type, mx, my - 4);
            }
          }
        });

        nodes.forEach(node => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val ? node.val + 2 : 12, 0, 2 * Math.PI);
          ctx.fillStyle = groupColors[node.group] || '#64748b';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val ? node.val + 2 : 12, 0, 2 * Math.PI);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = '11px system-ui, sans-serif';
          ctx.fontWeight = '600';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y - (node.val ? node.val + 8 : 16));
        });
      };
      
      render();
    }
  }, [activeTab, tender]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold">Generating Cartel Topology & Graph structures...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No analysis data available</h2>
          <p className="text-slate-600 mb-6">The tender was saved, but data could not be loaded. Please return to the dashboard and re-upload the tender PDF.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const scatterPlotData = [
    { name: 'TechNova Solutions', amount: 15.20, timeOffset: 42, type: 'L1 Bidder (Flagged)' },
    { name: 'Digital Infra Systems', amount: 16.11, timeOffset: 43, type: 'L2 Cover Bid (Flagged)' },
    { name: 'CompuWorld Enterprises', amount: 18.50, timeOffset: 10, type: 'L3 Independent' }
  ];

  const docTextContent = {
    a: {
      title: 'TechNova Solutions Pvt. Ltd. — Proposal Summary',
      pages: [
        {
          num: 1,
          text: `SECTION 1: VENDOR PROFILE\nCompany Name: TechNova Solutions Pvt. Ltd.\nCorporate Registration: REG-90214812\nAuthorized Signatory: Rajesh Waghmode\nRegistered Office: Sector 4, Vashi, Navi Mumbai, MH.\n\nTechNova Solutions is a leading systems integrator delivering hardware solutions to public institutions for over 12 years. We submit our technical bid for Tender No. GEM/2026/IT/4521.`
        },
        {
          num: 2,
          text: `SECTION 2: TECHNICAL SPECIFICATIONS COMPLIANCE\nOur computing towers comply with all requirements.\nProcessor: Intel Core i5 (12th Gen 12400) 6-Core processor, base frequency 2.5GHz.\nMemory: 16GB Dual-Channel DDR4 RAM @ 3200MHz installed.\nStorage: 512GB NVMe PCIe M.2 SSD storage array.\nMonitor: 24" IPS LED Backlit Full HD Monitor with HDMI/DisplayPort.\n\n[HIGHLIGHT-COMPLIANCE] The computing node features a cooling system optimized for tropical ambient temperatures, running at a nominal sound profile under 28dB. Power supply units are certified 80-Plus Gold with active power factor correction.`
        },
        {
          num: 3,
          text: `SECTION 3: TERMS & CONDITIONS\n[HIGHLIGHT-WARRANTY] TechNova Solutions Pvt. Ltd. warrants that all goods supplied under this tender will be free from defects in material and workmanship for a period of three (3) years from date of commissioning. Any replacement of parts will be performed on-site within 24 hours of ticket resolution.\n\nArbitration: Any disputes arising out of this supply agreement will be resolved through arbitration under Mumbai jurisdiction.`
        }
      ]
    },
    b: {
      title: 'Digital Infra Systems — Proposal Summary',
      pages: [
        {
          num: 1,
          text: `SECTION 1: VENDOR REGISTER\nCompany Name: Digital Infra Systems\nCorporate Registration: REG-31849182\nAuthorized Director: Rajesh Waghmode\nRegistered Office: Office 109, Vashi, Navi Mumbai, MH.\n\nDigital Infra Systems provides enterprise IT infrastructure and installation projects for public education institutes across India. We present our technical proposal for Tender No. GEM/2026/IT/4521.`
        },
        {
          num: 2,
          text: `SECTION 2: COMPLIANCE SHEET\nOur hardware systems satisfy the requested parameters.\nProcessor: Intel Core i5-12400 (6 Cores, 12MB Cache) up to 4.4GHz.\nMemory: 16GB DDR4 RAM running at 3200MHz.\nStorage: 512GB NVMe M.2 Solid State Drive.\nMonitor: 24" IPS LED Backlight Full HD Monitor.\n\n[HIGHLIGHT-COMPLIANCE] The computer towers feature an internal cooling system optimized for tropical environments, running with a sound profile less than 28dB. Power supply modules are 80-Plus Gold certified with active power factor correction.`
        },
        {
          num: 3,
          text: `SECTION 3: STANDARD TERMS\n[HIGHLIGHT-WARRANTY] Digital Infra Systems warrants that all goods supplied under this tender will be free from defects in material and workmanship for a period of three (3) years from date of commissioning. Any replacement of parts will be performed onsite within 24 hours of ticket resolution.\n\nLegal dispute: Any disputes arising out of this procurement will be settled in Mumbai court jurisdictions.`
        }
      ]
    }
  };

  const handleAppendFiles = (updatedTender) => {
    const mergedTender = {
      ...(tender || {}),
      ...updatedTender,
      documents: [...((tender?.documents || [])), ...((updatedTender.documents || []))],
      tender_id: tender?.tender_id || updatedTender.tender_id
    };

    setTender(mergedTender);
    const allStored = JSON.parse(localStorage.getItem('devnexus_tenders') || '[]');
    const refreshed = [mergedTender, ...allStored.filter(item => item.tender_id !== mergedTender.tender_id)];
    localStorage.setItem('devnexus_tenders', JSON.stringify(refreshed));
    setShowAddPdfModal(false);
  };

  const handleCitationClick = (highlightId, docType) => {
    setPdfActiveDoc(docType);
    setSelectedHighlightId(highlightId);
    setActiveTab('engine2');
    
    setTimeout(() => {
      const element = document.getElementById(`highlight-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let botText = "I parsed the technical contracts. ";
      let citation = null;

      const inputLower = chatInput.toLowerCase();
      if (inputLower.includes('warranty') || inputLower.includes('terms') || inputLower.includes('technova')) {
        botText = "In the Terms & Conditions, TechNova and Digital Infra have 97% identical boilerplate clauses regarding warranty duration and response SLA. TechNova lists the clause on Page 3, and Digital Infra on Page 3 as well.";
        citation = { id: 'WARRANTY', docType: 'a', label: 'TechNova Page 3 / Digital Infra Page 3' };
      } else if (inputLower.includes('cooling') || inputLower.includes('spec') || inputLower.includes('cooling system')) {
        botText = "The technical compliance sheets show 92% rephrasing similarity concerning CPU cooling noise under 28dB and 80-Plus Gold PSU certs (TechNova Page 2, Digital Infra Page 2).";
        citation = { id: 'COMPLIANCE', docType: 'a', label: 'TechNova Page 2 / Digital Infra Page 2' };
      } else {
        botText = "My layout RAG engine indicates a strong template overlap between TechNova and Digital Infra Systems. They use the same font sizing layouts and share the same author in PDF metadata: 'siddhivinayak.w'.";
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: botText, citation }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 flex flex-col font-sans">
      
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex justify-between items-center z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Tender Ref ID</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                tender.status === 'FLAGGED_CCI'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {tender.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 m-0 truncate max-w-lg leading-tight">
              {tender.title}
            </h1>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddPdfModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl border border-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add More PDFs
          </button>
          <button
            onClick={() => setShowCopilot(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            Compliance Copilot
          </button>
          <button
            onClick={onOpenReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Compliance Report
          </button>
        </div>
      </header>

      {showAddPdfModal && (
        <PdfUploadModal
          isOpen={showAddPdfModal}
          onClose={() => setShowAddPdfModal(false)}
          existingTender={tender}
          onAppendFiles={handleAppendFiles}
          onOpenTenderVerification={() => {}}
        />
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        <div className="flex-1 flex flex-col overflow-y-auto p-6 z-10 max-w-7xl mx-auto w-full">
          
          {/* Pill Tabs Selector */}
          <div className="flex border-b border-slate-200 mb-6 gap-2 bg-slate-200/50 p-1 rounded-2xl w-fit">
            {[
              { id: 'engine1', label: 'Engine 1: BOQ Grid', icon: Database },
              { id: 'engine2', label: 'Engine 2: Split-Screen RAG', icon: Eye },
              { id: 'diff', label: 'Version Diff Visualizer', icon: GitCompare },
              { id: 'graph', label: 'Entity Relationship Graph', icon: Share2 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pill-tab flex items-center gap-2 ${activeTab === tab.id ? 'pill-tab-active' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Engine 1 (BOQ Grid & DBSCAN) */}
          {activeTab === 'engine1' && (
            <div className="space-y-6">
              
              <div className="saas-card p-5 border-l-4 border-l-rose-500 bg-rose-50/50 border-rose-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">DevNexus Cartel Recommendation</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {tender.recommendation_text}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="saas-card p-5 lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">DBSCAN Timing & Price Scatter Clusters</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Clustering bids by submission timing vs bid amount (₹ Cr)</p>
                    </div>
                  </div>
                  
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <XAxis type="number" dataKey="timeOffset" name="Submission Offset" unit=" mins" stroke="#94a3b8" fontSize={11} />
                        <YAxis type="number" dataKey="amount" name="Bid Value" unit=" Cr" stroke="#94a3b8" fontSize={11} />
                        <ZAxis type="number" range={[100, 200]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                        <Scatter name="Bid Submissions" data={scatterPlotData} fill="#3b82f6">
                          {scatterPlotData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.type.includes('Cover') 
                                  ? '#f97316' 
                                  : entry.type.includes('L1') 
                                    ? '#ef4444' 
                                    : '#22c55e'
                              } 
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="saas-card p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Risk Probability Index</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-600 font-medium">Engine 1 (DBSCAN)</span>
                          <span className="text-rose-600 font-bold">{Math.round(tender.engine1_score * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${tender.engine1_score * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-600 font-medium">Engine 2 (Layout RAG)</span>
                          <span className="text-rose-600 font-bold">{Math.round(tender.engine2_score * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${tender.engine2_score * 100}%` }} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-800 font-bold">Combined Risk Index</span>
                          <span className="text-rose-600 font-extrabold">{Math.round(tender.anomaly_score * 100)}% Match</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 leading-normal flex gap-2">
                    <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    Submissions within 50 seconds. Exact pricing ratios (6.00%) identified across items.
                  </div>
                </div>

              </div>

              {/* BOQ High Density Data Table */}
              <div className="saas-card overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider m-0">Bill of Quantities (BOQ) - Item Breakdown Grid</h4>
                  <span className="text-xs text-slate-500 font-mono">Hover cells to verify source snippet notes</span>
                </div>
                
                <div className="overflow-x-auto relative">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-4 border-r border-slate-200 w-96">Item Description</th>
                        <th className="py-3.5 px-4 border-r border-slate-200 text-center w-24">QTY</th>
                        {tender.bidders.map(b => (
                          <th key={b.name} className="py-3.5 px-4 border-r border-slate-200 text-right">
                            <span className="block text-slate-900 font-bold">{b.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">Reg: {b.registration_id}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {tender.boq.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-all">
                          <td className="py-3 px-4 border-r border-slate-200 font-sans">
                            <span className="font-bold text-slate-900 text-sm block">{item.description}</span>
                            <span className="text-xs text-slate-400">Code: BOQ-{item.id}</span>
                          </td>
                          
                          <td className="py-3 px-4 border-r border-slate-200 text-center text-sm text-slate-600">
                            {item.qty} {item.unit}
                          </td>
                          
                          {tender.bidders.map(b => {
                            const bd = item.breakdown[b.name];
                            if (!bd) return <td key={b.name} className="py-3 px-4 border-r border-slate-200 text-right text-slate-300">-</td>;
                            
                            const confidence = Math.round(bd.confidence * 100);
                            
                            return (
                              <td 
                                key={b.name} 
                                className="py-3 px-4 border-r border-slate-200 text-right relative cursor-help hover:bg-blue-50/50"
                                onMouseEnter={() => setHoveredCell({ itemId: item.id, vendor: b.name, note: bd.note })}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                <div className="text-slate-900 font-bold text-sm">₹{bd.rate.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">Tot: ₹{(bd.total/10000000).toFixed(2)} Cr</div>
                                
                                <div className="mt-1 flex justify-end">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${
                                    confidence >= 90
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200 font-extrabold'
                                  }`}>
                                    Conf: {confidence}%
                                  </span>
                                </div>

                                {hoveredCell?.itemId === item.id && hoveredCell?.vendor === b.name && (
                                  <div className="absolute bottom-full right-4 z-30 w-72 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xl text-left font-sans pointer-events-none">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Source Snippet Verification</h5>
                                    <div className="text-sm text-slate-800 leading-snug">
                                      {hoveredCell.note}
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 font-bold flex items-center gap-1">
                                      <CornerDownRight className="w-3 h-3" />
                                      DBSCAN Formula Match
                                    </div>
                                  </div>
                                )}

                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Engine 2 (Split-Screen RAG) */}
          {activeTab === 'engine2' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 overflow-hidden">
              
              <div className="saas-card flex flex-col lg:col-span-3 overflow-hidden h-[500px]">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {pdfActiveDoc === 'a' ? 'TechNova_Proposal.pdf' : 'DigitalInfra_Proposal.pdf'}
                    </span>
                  </div>
                  
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      onClick={() => setPdfActiveDoc('a')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        pdfActiveDoc === 'a' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      TechNova PDF
                    </button>
                    <button
                      onClick={() => setPdfActiveDoc('b')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        pdfActiveDoc === 'b' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Digital Infra PDF
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed space-y-6 text-slate-800 bg-white" ref={pdfViewerRef}>
                  {docTextContent[pdfActiveDoc].pages.map(page => (
                    <div key={page.num} className="border-b border-slate-100 pb-6 relative">
                      <div className="absolute top-0 right-0 text-xs text-slate-400 font-mono tracking-widest">
                        PAGE {page.num} / {docTextContent[pdfActiveDoc].pages.length}
                      </div>
                      
                      <div className="whitespace-pre-line font-mono text-slate-800 pr-12">
                        {page.text.split('\n').map((line, lIdx) => {
                          if (line.includes('[HIGHLIGHT-WARRANTY]')) {
                            const pureLine = line.replace('[HIGHLIGHT-WARRANTY] ', '');
                            return (
                              <span 
                                key={lIdx} 
                                id="highlight-WARRANTY"
                                className={`block transition-all ${
                                  selectedHighlightId === 'WARRANTY'
                                    ? 'bg-rose-100 border-l-4 border-l-rose-500 text-rose-900 px-2 py-1 rounded font-semibold'
                                    : 'bg-amber-50 border-l-2 border-l-amber-400 hover:bg-amber-100 px-2 py-1 rounded cursor-pointer'
                                }`}
                                onClick={() => setSelectedHighlightId('WARRANTY')}
                              >
                                {pureLine}
                              </span>
                            );
                          }
                          if (line.includes('[HIGHLIGHT-COMPLIANCE]')) {
                            const pureLine = line.replace('[HIGHLIGHT-COMPLIANCE] ', '');
                            return (
                              <span 
                                key={lIdx}
                                id="highlight-COMPLIANCE"
                                className={`block transition-all ${
                                  selectedHighlightId === 'COMPLIANCE'
                                    ? 'bg-rose-100 border-l-4 border-l-rose-500 text-rose-900 px-2 py-1 rounded font-semibold'
                                    : 'bg-amber-50 border-l-2 border-l-amber-400 hover:bg-amber-100 px-2 py-1 rounded cursor-pointer'
                                }`}
                                onClick={() => setSelectedHighlightId('COMPLIANCE')}
                              >
                                {pureLine}
                              </span>
                            );
                          }
                          return <span key={lIdx} className="block">{line}</span>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="saas-card p-5 lg:col-span-2 overflow-y-auto h-[500px] space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Layout RAG Similarity Pairs</h4>
                  <span className="text-[10px] text-slate-500 font-mono">1 Match Found</span>
                </div>

                {tender.document_comparison.document_pairs.map((pair, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-rose-800 font-bold">Rigging Score</span>
                        <span className="text-base text-rose-700 font-black">{Math.round(pair.overall_score * 100)}%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-rose-200/80">
                        <div className="text-slate-600">Text Similarity: <span className="text-slate-900 font-bold">{Math.round(pair.text_similarity * 100)}%</span></div>
                        <div className="text-slate-600">Layout Match: <span className="text-slate-900 font-bold">{Math.round(pair.layout_similarity * 100)}%</span></div>
                        <div className="text-slate-600">Font Fingerprint: <span className="text-slate-900 font-bold">{Math.round(pair.font_match_ratio * 100)}%</span></div>
                        <div className="text-slate-600">Boilerplate Overlap: <span className="text-slate-900 font-bold">{Math.round(pair.boilerplate_overlap * 100)}%</span></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matching Paragraph Snippets</h5>
                      
                      {tender.document_comparison.details.matching_paragraphs.map((para, pIdx) => {
                        const isWarranty = para.section.includes('Warranty');
                        const hId = isWarranty ? 'WARRANTY' : 'COMPLIANCE';
                        
                        return (
                          <div 
                            key={pIdx}
                            onClick={() => handleCitationClick(hId, 'a')}
                            className={`p-3.5 bg-slate-50 border hover:bg-blue-50/50 rounded-2xl cursor-pointer transition-all ${
                              selectedHighlightId === hId ? 'border-blue-600 shadow-xs' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-bold text-slate-900">{para.section}</span>
                              <span className="text-[9.5px] text-blue-600 font-semibold flex items-center gap-0.5">
                                View in PDF <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed italic">
                              "{para.text_a}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: Version Diff Visualizer */}
          {activeTab === 'diff' && (
            <div className="saas-card overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Side-by-Side Proposal Text Diff</h4>
                  <p className="text-xs text-slate-500">Deleted text in red strikethrough, added text in green highlight</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="inline-block w-3 h-3 bg-red-100 border-l-2 border-l-red-500 rounded-xs" /> Deletions
                  <span className="inline-block w-3 h-3 bg-green-100 border-l-2 border-l-green-500 rounded-xs ml-2" /> Additions
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-sm font-mono p-6 bg-white leading-relaxed">
                <div className="space-y-3 pr-0 md:pr-6 pb-6 md:pb-0">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">TechNova Solutions (Page 3)</h5>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 whitespace-pre-line text-slate-800">
                    {`TechNova Solutions Pvt. Ltd. warrants that all goods supplied under this tender will be free from defects in material and workmanship `}
                    <span className="diff-addition">{`for a period of three (3) years from date of commissioning.`}</span>
                    {` Any replacement of parts will be performed `}
                    <span className="diff-addition">{`on-site within 24 hours`}</span>
                    {` of ticket resolution.`}
                  </div>
                </div>

                <div className="space-y-3 pl-0 md:pl-6 pt-6 md:pt-0">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Infra Systems (Page 3)</h5>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 whitespace-pre-line text-slate-800">
                    {`Digital Infra Systems warrants that all goods supplied under this tender will be free from defects in material and workmanship `}
                    <span className="diff-deletion">{`for a period of three (3) years from date of commissioning.`}</span>
                    {` Any replacement of parts will be performed `}
                    <span className="diff-deletion">{`onsite within 24 hours`}</span>
                    {` of ticket resolution.`}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Entity Relationship Graph */}
          {activeTab === 'graph' && (
            <div className="saas-card overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Collusive Network Topology</h4>
                  <p className="text-xs text-slate-500">Mapping relationships between bidders, shared directors, gateway IPs, and transaction flows</p>
                </div>
                
                <div className="flex gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Bidder</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Director</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" /> Gateway IP</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Author</span>
                </div>
              </div>

              <div className="relative bg-white flex items-center justify-center p-4">
                <canvas 
                  ref={canvasRef} 
                  className="w-full bg-slate-50 rounded-2xl cursor-crosshair max-w-4xl"
                />
              </div>

            </div>
          )}

        </div>

        {/* AI Copilot Side Drawer */}
        {showCopilot && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col justify-between">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">DevNexus Copilot</h3>
              </div>
              <button 
                onClick={() => setShowCopilot(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                  }`}>
                    {msg.text}
                    
                    {msg.citation && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center">
                        <button
                          onClick={() => handleCitationClick(msg.citation.id, msg.citation.docType)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-blue-600 font-bold hover:bg-blue-50 transition-all"
                        >
                          <FileText className="w-3 h-3" />
                          Citation: {msg.citation.label}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask copilot about PDF compliance..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Send
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
