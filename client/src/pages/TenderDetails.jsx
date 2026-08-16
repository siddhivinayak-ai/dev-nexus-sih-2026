import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  ArrowLeft, Shield, CheckCircle2, AlertTriangle, AlertCircle, FileText, 
  MessageSquare, Sparkles, HelpCircle, ChevronRight, Eye, RefreshCw, 
  Search, GitCompare, Share2, CornerDownRight, Database, TrendingUp, Info
} from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, Legend } from 'recharts';

export default function TenderDetails({ tenderId, onBack, onOpenReport, user }) {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('engine1'); // 'engine1', 'engine2', 'diff', 'graph'
  
  // PDF split-screen navigation states
  const [selectedHighlightId, setSelectedHighlightId] = useState(null);
  const [pdfActiveDoc, setPdfActiveDoc] = useState('a'); // 'a' = TechNova, 'b' = Digital Infra
  const pdfViewerRef = useRef(null);

  // Copilot Drawer States
  const [showCopilot, setShowCopilot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hello! I am your BidShield Compliance Copilot. I have parsed the bidding data and proposal PDFs for this tender. Ask me anything, e.g., 'Compare terms of TechNova and Digital Infra' or 'Is there an IP address match?'" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // BOQ Hover state
  const [hoveredCell, setHoveredCell] = useState(null); // { itemId, vendor, note }

  // Canvas ref for Network Graph
  const canvasRef = useRef(null);

  useEffect(() => {
    async function loadTender() {
      setLoading(true);
      const res = await api.getTenderDetails(tenderId);
      setTender(res.data);
      setLoading(false);
    }
    loadTender();
  }, [tenderId]);

  // Canvas rendering of Entity Relationship Graph
  useEffect(() => {
    if (activeTab === 'graph' && canvasRef.current && tender?.network) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 450;
      
      const nodes = tender.network.nodes;
      const links = tender.network.links;

      // Assign simple physics/layout positions
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Map group numbers to colors
      const groupColors = {
        1: '#ef4444', // Red (Bidders)
        2: '#10b981', // Emerald (Independent)
        3: '#f59e0b', // Amber (Directors)
        4: '#3b82f6', // Blue (IP network)
        5: '#8b5cf6', // Violet (Metadata)
        6: '#ec4899'  // Pink (Leaked flow)
      };

      // Set initial positions in a circular layout with centers based on groups
      nodes.forEach((node, idx) => {
        if (!node.x) {
          const angle = (idx / nodes.length) * 2 * Math.PI;
          const radius = Math.min(width, height) * 0.35;
          node.x = centerX + radius * Math.cos(angle);
          node.y = centerY + radius * Math.sin(angle);
        }
      });

      // Simulation ticks to settle the graph
      for (let step = 0; step < 50; step++) {
        // Link forces (pull connected nodes together)
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

        // Repulsion force (push all nodes away from each other)
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
          // Center gravity
          nodes[i].x += (centerX - nodes[i].x) * 0.02;
          nodes[i].y += (centerY - nodes[i].y) * 0.02;
        }
      }

      // Render Loop
      const render = () => {
        ctx.clearRect(0, 0, width, height);

        // Draw Links
        links.forEach(link => {
          const sNode = nodes.find(n => n.id === link.source);
          const tNode = nodes.find(n => n.id === link.target);
          if (sNode && tNode) {
            ctx.beginPath();
            ctx.moveTo(sNode.x, sNode.y);
            ctx.lineTo(tNode.x, tNode.y);
            ctx.strokeStyle = link.type === 'PAYOUT' || link.type === 'RECEIPT' ? '#ec4899' : 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = link.type === 'PAYOUT' || link.type === 'RECEIPT' ? 2 : 1;
            if (link.type === 'PAYOUT' || link.type === 'RECEIPT') {
              ctx.setLineDash([5, 5]);
            } else {
              ctx.setLineDash([]);
            }
            ctx.stroke();

            // Link Label (optional)
            if (link.type === 'DIRECTORSHIP' || link.type === 'SUBMISSION_IP' || link.type === 'PAYOUT') {
              const mx = (sNode.x + tNode.x) / 2;
              const my = (sNode.y + tNode.y) / 2;
              ctx.fillStyle = '#71717a';
              ctx.font = '8px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(link.type, mx, my - 4);
            }
          }
        });

        // Draw Nodes
        nodes.forEach(node => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val ? node.val + 2 : 12, 0, 2 * Math.PI);
          ctx.fillStyle = groupColors[node.group] || '#71717a';
          ctx.shadowBlur = 10;
          ctx.shadowColor = groupColors[node.group] || '#71717a';
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          // White border
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val ? node.val + 2 : 12, 0, 2 * Math.PI);
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Plus Jakarta Sans, sans-serif';
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
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold">Generating Cartel Topology & Graph structures...</p>
        </div>
      </div>
    );
  }

  // Pre-configured scatter plot data representing DBSCAN bid anomalies
  const scatterPlotData = [
    { name: 'TechNova Solutions', amount: 15.20, timeOffset: 42, type: 'L1 Bidder (Flagged)' },
    { name: 'Digital Infra Systems', amount: 16.11, timeOffset: 43, type: 'L2 Cover Bid (Flagged)' },
    { name: 'CompuWorld Enterprises', amount: 18.50, timeOffset: 10, type: 'L3 Independent' }
  ];

  // PDF Text Content definitions for split-screen RAG
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
          text: `SECTION 3: TERMS & CONDITIONS\n[HIGHLIGHT-WARRANTY] TechNova Solutions Pvt. Ltd. warrants that all goods supplied under this tender will be free from defects in material and workmanship for a period of three (3) years from date of commissioning. Any replacement of parts will be performed on-site within 24 hours of ticket resolution.\n\nArbitration: Any disputes arising out of this supply agreement will be resolved through arbitration under the Mumbai jurisdiction.`
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

  const handleCitationClick = (highlightId, docType) => {
    setPdfActiveDoc(docType);
    setSelectedHighlightId(highlightId);
    setActiveTab('engine2');
    
    // Simulate scroll to target element
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

    // Simulate copilot logic
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
      } else if (inputLower.includes('ip') || inputLower.includes('ip address') || inputLower.includes('same ip')) {
        botText = "The network records show that both TechNova Solutions and Digital Infra Systems submitted their bids from the same gateway IP address: 192.168.4.112 within 50 seconds of each other. This is confirmed by GeM transaction records.";
      } else {
        botText = "My layout RAG engine indicates a strong template overlap between TechNova and Digital Infra Systems. They use the same font sizing layouts and share the same author in PDF metadata: 'siddhivinayak.w'.";
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: botText, citation }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050508] bg-dotted-pattern flex flex-col">
      
      {/* Header bar */}
      <header className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-filter backdrop-blur-md px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl border border-zinc-850 hover:border-zinc-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Tender Case File</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${
                tender.status === 'FLAGGED_CCI'
                  ? 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                  : 'bg-amber-950/20 border-amber-500/20 text-amber-400'
              }`}>
                {tender.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-base font-bold text-white m-0 truncate max-w-lg leading-tight mt-0.5">
              {tender.title}
            </h1>
          </div>
        </div>

        {/* Action Button Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCopilot(true)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Compliance Copilot
          </button>
          <button
            onClick={onOpenReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all glow-blue"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Compliance Report
          </button>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Core Analysis Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 z-10">
          
          {/* Sub Header Tab Selector */}
          <div className="flex border-b border-zinc-800 mb-6 gap-2">
            {[
              { id: 'engine1', label: 'Engine 1: pricing & BOQ grid', icon: Database },
              { id: 'engine2', label: 'Engine 2: layout RAG split-screen', icon: Eye },
              { id: 'diff', label: 'bidding PDF version comparison', icon: GitCompare },
              { id: 'graph', label: 'entity relationship graph', icon: Share2 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-2 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT: Engine 1 (Pricing & BOQ Excel Grid) */}
          {activeTab === 'engine1' && (
            <div className="space-y-6">
              
              {/* Executive Recommendation Box */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">System Cartel Intelligence Recommendation</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {tender.recommendation_text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Scatter plot cluster (DBSCAN simulation) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="glass-panel p-5 rounded-2xl lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">DBSCAN Bid Timing & Price Clusters</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Clustering bids by submission timing offset vs bid amount (₹ Cr)</p>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">Engine 1</span>
                  </div>
                  
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <XAxis type="number" dataKey="timeOffset" name="Submission Offset" unit=" mins" stroke="#52525b" fontSize={11} />
                        <YAxis type="number" dataKey="amount" name="Bid Value" unit=" Cr" stroke="#52525b" fontSize={11} />
                        <ZAxis type="number" range={[100, 200]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
                        <Scatter name="Bid Submissions" data={scatterPlotData} fill="#3b82f6">
                          {scatterPlotData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.type.includes('Cover') 
                                  ? '#f59e0b' 
                                  : entry.type.includes('L1') 
                                    ? '#ef4444' 
                                    : '#10b981'
                              } 
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Cartel Probability Scores</h4>
                    
                    <div className="space-y-4">
                      {/* DBSCAN Metric */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-zinc-400">Engine 1 (DBSCAN Anomaly)</span>
                          <span className="text-rose-400 font-bold">{Math.round(tender.engine1_score * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${tender.engine1_score * 100}%` }} />
                        </div>
                      </div>

                      {/* Layout RAG Metric */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-zinc-400">Engine 2 (Layout RAG Similarity)</span>
                          <span className="text-rose-400 font-bold">{Math.round(tender.engine2_score * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${tender.engine2_score * 100}%` }} />
                        </div>
                      </div>

                      {/* Unified Collusion Metric */}
                      <div className="pt-2 border-t border-zinc-800">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-300 font-semibold">Combined Collusion Index</span>
                          <span className="text-rose-500 font-extrabold">{Math.round(tender.anomaly_score * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 text-[10px] text-rose-300 leading-normal flex gap-2">
                    <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    Bids submitted within 50 seconds. Exact pricing ratios (6.00%) identified on all item-wise schedules.
                  </div>
                </div>

              </div>

              {/* High-density Excel-like BOQ Table with confidence scoring */}
              <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider m-0">Bill of Quantities (BOQ) - Bid Breakdown Grid</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Double check color coded confidence factors</span>
                </div>
                
                <div className="overflow-x-auto relative">
                  <table className="w-full border-collapse text-left text-xs text-zinc-300">
                    <thead>
                      <tr className="bg-zinc-900/80 border-b border-zinc-800 font-bold text-zinc-500 text-[10px] uppercase tracking-wider">
                        <th className="py-3.5 px-4 border-r border-zinc-800 w-96">Material / Item Specification</th>
                        <th className="py-3.5 px-4 border-r border-zinc-800 text-center w-24">QTY / Unit</th>
                        {tender.bidders.map(b => (
                          <th key={b.name} className="py-3.5 px-4 border-r border-zinc-800 text-right">
                            <span className="block text-white font-bold">{b.name}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">Reg: {b.registration_id}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-mono">
                      {tender.boq.map(item => (
                        <tr key={item.id} className="hover:bg-zinc-900/20 transition-all">
                          {/* Item details */}
                          <td className="py-3 px-4 border-r border-zinc-800 font-sans">
                            <span className="font-semibold text-white block">{item.description}</span>
                            <span className="text-[10px] text-zinc-500">Item Code: BOQ-{item.id}</span>
                          </td>
                          
                          {/* Quantity */}
                          <td className="py-3 px-4 border-r border-zinc-800 text-center text-zinc-400">
                            {item.qty} {item.unit}
                          </td>
                          
                          {/* Bidder breakdown cells */}
                          {tender.bidders.map(b => {
                            const bd = item.breakdown[b.name];
                            if (!bd) return <td key={b.name} className="py-3 px-4 border-r border-zinc-800 text-right text-zinc-650">-</td>;
                            
                            const confidence = Math.round(bd.confidence * 100);
                            
                            return (
                              <td 
                                key={b.name} 
                                className="py-3 px-4 border-r border-zinc-800 text-right relative cursor-help hover:bg-zinc-900/50"
                                onMouseEnter={() => setHoveredCell({ itemId: item.id, vendor: b.name, note: bd.note })}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                <div className="text-white font-semibold">₹{bd.rate.toLocaleString()}</div>
                                <div className="text-[9.5px] text-zinc-400">Tot: ₹{(bd.total/10000000).toFixed(2)} Cr</div>
                                
                                {/* Confidence indicator bubble */}
                                <div className="mt-1 flex justify-end">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                    confidence >= 90
                                      ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400'
                                      : confidence >= 50
                                        ? 'bg-amber-950/20 border border-amber-500/20 text-amber-400'
                                        : 'bg-rose-950/20 border border-rose-500/20 text-rose-400 font-extrabold animate-pulse'
                                  }`}>
                                    Conf: {confidence}%
                                  </span>
                                </div>

                                {/* POPUP POPOVER ON CELL HOVER */}
                                {hoveredCell?.itemId === item.id && hoveredCell?.vendor === b.name && (
                                  <div className="absolute bottom-full right-4 z-30 w-72 glass-panel p-3 rounded-xl border border-zinc-800 shadow-2xl text-left font-sans pointer-events-none">
                                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Verify Source Snippet</h5>
                                    <div className="text-[11px] text-white leading-normal">
                                      {hoveredCell.note}
                                    </div>
                                    <div className="mt-2 text-[9px] text-blue-400 font-semibold flex items-center gap-1">
                                      <CornerDownRight className="w-3 h-3" />
                                      DBSCAN Pricing Formula Audit Match
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

          {/* TAB CONTENT: Engine 2 (PDF Split Screen layout) */}
          {activeTab === 'engine2' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 overflow-hidden">
              
              {/* Left Column (Document text viewer with highlighted matches) */}
              <div className="glass-panel rounded-2xl border border-zinc-800 flex flex-col lg:col-span-3 overflow-hidden h-[500px]">
                {/* PDF Toolbar */}
                <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {pdfActiveDoc === 'a' ? 'TechNova_Proposal.pdf' : 'DigitalInfra_Proposal.pdf'}
                    </span>
                  </div>
                  
                  {/* Select Active PDF to view */}
                  <div className="flex bg-zinc-950 border border-zinc-850 p-0.5 rounded-lg">
                    <button
                      onClick={() => setPdfActiveDoc('a')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                        pdfActiveDoc === 'a' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      TechNova PDF
                    </button>
                    <button
                      onClick={() => setPdfActiveDoc('b')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                        pdfActiveDoc === 'b' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Digital Infra PDF
                    </button>
                  </div>
                </div>

                {/* PDF Page Reader */}
                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed space-y-6 text-zinc-300 select-text" ref={pdfViewerRef}>
                  {docTextContent[pdfActiveDoc].pages.map(page => (
                    <div key={page.num} className="border-b border-zinc-900 pb-6 relative">
                      {/* Page tag */}
                      <div className="absolute top-0 right-0 text-[9px] text-zinc-650 font-mono tracking-widest">
                        PAGE {page.num} / {docTextContent[pdfActiveDoc].pages.length}
                      </div>
                      
                      {/* Text parse blocks with custom highlights */}
                      <div className="whitespace-pre-line font-mono text-zinc-300 pr-12">
                        {page.text.split('\n').map((line, lIdx) => {
                          if (line.includes('[HIGHLIGHT-WARRANTY]')) {
                            const pureLine = line.replace('[HIGHLIGHT-WARRANTY] ', '');
                            return (
                              <span 
                                key={lIdx} 
                                id="highlight-WARRANTY"
                                className={`block transition-all ${
                                  selectedHighlightId === 'WARRANTY'
                                    ? 'bg-rose-500/25 border-l-4 border-l-rose-500 text-white px-2 py-0.5 rounded'
                                    : 'bg-amber-500/10 border-l-2 border-l-amber-500/50 hover:bg-amber-500/20 px-2 py-0.5 rounded cursor-pointer'
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
                                    ? 'bg-rose-500/25 border-l-4 border-l-rose-500 text-white px-2 py-0.5 rounded'
                                    : 'bg-amber-500/10 border-l-2 border-l-amber-500/50 hover:bg-amber-500/20 px-2 py-0.5 rounded cursor-pointer'
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

              {/* Right Column (Similarity Analysis / Engine 2 layout details) */}
              <div className="glass-panel p-5 rounded-2xl lg:col-span-2 overflow-y-auto h-[500px] space-y-5">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Layout RAG Matches</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">1 Pairwise match</span>
                </div>

                {tender.document_comparison.document_pairs.map((pair, idx) => (
                  <div key={idx} className="space-y-4">
                    {/* Similarity Summary Box */}
                    <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-rose-300 font-bold">Rigging Probability</span>
                        <span className="text-base text-rose-400 font-extrabold">{Math.round(pair.overall_score * 100)}%</span>
                      </div>
                      
                      {/* Specific Similarity ratios */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-rose-500/15">
                        <div className="text-zinc-400">Text Similarity: <span className="text-white font-bold">{Math.round(pair.text_similarity * 100)}%</span></div>
                        <div className="text-zinc-400">Layout Match: <span className="text-white font-bold">{Math.round(pair.layout_similarity * 100)}%</span></div>
                        <div className="text-zinc-400">Font Fingerprint: <span className="text-white font-bold">{Math.round(pair.font_match_ratio * 100)}%</span></div>
                        <div className="text-zinc-400">Boilerplate Overlap: <span className="text-white font-bold">{Math.round(pair.boilerplate_overlap * 100)}%</span></div>
                      </div>

                      <div className="text-[9.5px] text-rose-300 bg-rose-500/10 p-2 rounded border border-rose-500/15 leading-normal">
                        ⚠️ Shared PDF metadata: Author name <strong>{tender.document_comparison.details.shared_authors}</strong> was flagged on both document uploads.
                      </div>
                    </div>

                    {/* Flagged segments click-to-highlight list */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Flagged Copied Snippets</h5>
                      
                      {tender.document_comparison.details.matching_paragraphs.map((para, pIdx) => {
                        const isWarranty = para.section.includes('Warranty');
                        const hId = isWarranty ? 'WARRANTY' : 'COMPLIANCE';
                        
                        return (
                          <div 
                            key={pIdx}
                            onClick={() => handleCitationClick(hId, 'a')}
                            className={`p-3 bg-zinc-900 border hover:bg-zinc-850 rounded-xl cursor-pointer transition-all ${
                              selectedHighlightId === hId ? 'border-blue-500' : 'border-zinc-800'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10.5px] font-bold text-white">{para.section}</span>
                              <span className="text-[9px] text-blue-400 font-mono flex items-center gap-0.5">
                                View segment <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed italic">
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

          {/* TAB CONTENT: Version Control & Diff Comparison */}
          {activeTab === 'diff' && (
            <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
              
              {/* Diff Header */}
              <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Proposal Text Similarity Diff Visualizer</h4>
                  <p className="text-[10px] text-zinc-500">Analyzing side-by-side matching clauses. Deleted sections are strike-out red, added sections are green.</p>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <span className="inline-block w-2.5 h-2.5 bg-rose-500/25 border-l border-l-rose-500" /> Deletions
                  <span className="inline-block w-2.5 h-2.5 bg-emerald-500/25 border-l border-l-emerald-500 ml-2" /> Additions
                </div>
              </div>

              {/* Side-by-side comparison pane */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 text-xs font-mono p-6 bg-zinc-950/40 leading-relaxed overflow-x-auto">
                {/* TechNova Column */}
                <div className="space-y-4 pr-0 md:pr-6 pb-6 md:pb-0">
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TechNova Solutions (Page 3)</h5>
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60 whitespace-pre-line text-zinc-300">
                    {`TechNova Solutions Pvt. Ltd. warrants that all goods supplied under this tender will be free from defects in material and workmanship `}
                    <span className="diff-addition">{`for a period of three (3) years from date of commissioning.`}</span>
                    {` Any replacement of parts will be performed `}
                    <span className="diff-addition">{`on-site within 24 hours`}</span>
                    {` of ticket resolution.`}
                  </div>
                </div>

                {/* Digital Infra Column */}
                <div className="space-y-4 pl-0 md:pl-6 pt-6 md:pt-0">
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Digital Infra Systems (Page 3)</h5>
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60 whitespace-pre-line text-zinc-300">
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

          {/* TAB CONTENT: Entity Relationship Graph */}
          {activeTab === 'graph' && (
            <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
              
              {/* Graph metadata overlay */}
              <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Collusive Network Topology</h4>
                  <p className="text-[10px] text-zinc-500">Mapping relationships between bidding companies, shared directors, IP addresses, and metadata creators</p>
                </div>
                
                {/* Node type legends */}
                <div className="flex gap-3 text-[9px] font-mono">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Bidder</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Director</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Gateway IP</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> PDF Author</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ec4899]" /> Kickback Leak</span>
                </div>
              </div>

              {/* Canvas viewport */}
              <div className="relative bg-[#050508]/60 flex items-center justify-center p-2">
                <canvas 
                  ref={canvasRef} 
                  className="w-full bg-[#050508]/10 cursor-crosshair max-w-4xl"
                />
              </div>

            </div>
          )}

        </div>

        {/* SIDE BAR / DRAWER: AI Compliance Copilot Chat */}
        {showCopilot && (
          <div className="fixed inset-y-0 right-0 w-96 bg-[#09090b]/95 border-l border-zinc-800 shadow-2xl z-30 flex flex-col justify-between">
            {/* Drawer Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#09090b]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Compliance Copilot Chat</h3>
              </div>
              <button 
                onClick={() => setShowCopilot(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                    
                    {/* Cited Badge Link */}
                    {msg.citation && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center">
                        <button
                          onClick={() => handleCitationClick(msg.citation.id, msg.citation.docType)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-950 border border-zinc-850 rounded text-[9px] text-blue-400 font-mono hover:border-blue-500 transition-all"
                        >
                          <FileText className="w-3 h-3 text-blue-400" />
                          Badge Citation: {msg.citation.label}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Preset Query Tags */}
            <div className="px-4 py-2 border-t border-zinc-900 flex flex-wrap gap-1.5">
              {[
                "Is there an IP match?",
                "Compare warranty terms",
                "Who is the author?"
              ].map((query, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => {
                    setChatInput(query);
                  }}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-[9px] font-mono text-zinc-400 hover:text-zinc-200 transition-all"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-[#09090b] flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask copilot about PDF compliance..."
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold glow-blue"
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
