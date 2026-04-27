import React, { useState, useEffect } from "react";
import {
  Book,
  Terminal,
  Shield,
  Server,
  Cloud,
  FileJson,
  Layout,
  Settings,
  Cpu,
  Database,
  ArrowRight,
  ChevronRight,
  Workflow,
  Search,
  ExternalLink,
  Code,
  Box,
  Hash,
  AlertCircle,
  FileCode,
  Lock,
  UserCheck,
  CheckCircle2,
  Folders,
  GitBranch,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import docData from "../data/ddocs.json";

const SECTIONS = [
  { id: "getting-started", title: "Getting Started", icon: Book },
  { id: "architecture", title: "Architecture", icon: Cpu },
  { id: "api-reference", title: "API Reference", icon: Terminal },
  { id: "database", title: "Database Schema", icon: Database },
  { id: "storage", title: "AWS S3 Config", icon: Cloud },
  { id: "security", title: "RBAC & Hierarchy", icon: Shield },
  { id: "devops", title: "CI/CD & DevOps", icon: Workflow },
  { id: "config", title: "Configuration", icon: Settings },
];

export default function DDocs() {
  const [active, setActive] = useState("getting-started");
  const [search, setSearch] = useState("");

  const filteredSections = SECTIONS.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
             <Box size={18} />
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-xs tracking-tight leading-none uppercase">APORAJEO ENG MANUAL</span>
             <span className="text-[9px] text-slate-500 font-mono mt-1">INTERNAL // v2.4.0-STABLE</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Filter manual..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-72 bg-slate-100 dark:bg-slate-900 border border-transparent rounded-xl pl-9 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => window.close()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            DISCONNECT
          </button>
        </div>
      </nav>

      <div className="max-w-[1500px] mx-auto flex">
        {/* Sidebar */}
        <aside className="w-72 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-slate-200 dark:border-slate-800 p-8 overflow-y-auto hidden lg:block">
          <div className="space-y-2">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = active === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActive(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    {section.title}
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>
          
          <div className="mt-12 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform">
                <FileCode size={80} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Platform Health</p>
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-500">All Systems Nominal</span>
             </div>
             <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group">
                Check AWS Metrics <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-16 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
            >
              <DocContent sectionId={active} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function DocContent({ sectionId }) {
  switch (sectionId) {
    case "getting-started":
      return (
        <div className="space-y-12">
          <header>
            <div className="flex items-center gap-3 mb-4">
               <Hash className="text-indigo-600" size={16} />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Section 01</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-6 italic lg:text-6xl uppercase">The Entry Protocol</h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-3xl font-medium">
              Official technical manual for the Aporajeo Platform. This document outlines the core logic, API structures, and cloud orchestration layers.
            </p>
          </header>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
               <Workflow size={24} className="text-indigo-600" /> Deployment Standard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(docData?.quick_start || []).map((q, i) => (
                <div key={i} className="p-6 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-500/50 transition-all group">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform italic">{q.step}</div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">{q.action}</h4>
                  <code className="text-[10px] bg-slate-950 p-3 rounded-xl block font-mono text-emerald-400 overflow-x-auto shadow-inner">
                    $ {q.cmd}
                  </code>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
               <Cpu size={140} className="absolute -right-8 -top-8 opacity-10 group-hover:scale-125 transition-transform" />
               <h3 className="text-2xl font-black italic mb-4">MERN Core Architecture</h3>
               <p className="opacity-90 leading-relaxed font-medium text-sm mb-8">
                  Aporajeo utilizes an isolated MERN stack (MongoDB, Express, React, Node) with a heavy emphasis on <strong>Asynchronous Event Handling</strong>. The system offloads expensive media processing to AWS S3 and Lambda to ensure the main event loop remains non-blocking for real-time dashboard updates.
               </p>
               <div className="flex flex-wrap gap-3">
                  {["Stateless JWT", "Role-Based Access", "S3 Lifecycle", "CDN Edge Delivery"].map(s => (
                    <span key={s} className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-[10px] font-black uppercase tracking-widest">{s}</span>
                  ))}
               </div>
            </div>
          </section>
        </div>
      );

    case "architecture":
      return (
        <div className="space-y-12">
          <header>
             <div className="flex items-center gap-3 mb-4">
                <Hash className="text-indigo-600" size={16} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Section 02</span>
             </div>
             <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase underline underline-offset-8">Architecture</h1>
             <p className="text-xl text-slate-500 font-medium italic">High-level systems design and codebase directory orchestration.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-3">
                   <Server size={14} className="text-emerald-500" /> Backend Infrastructure
                </h4>
                <div className="space-y-4">
                   {Object.entries(docData?.project_structure?.backend || {}).map(([path, desc], i) => (
                      <div key={i} className="group p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-all hover:translate-x-2">
                         <code className="text-xs font-black text-emerald-500 font-mono block mb-2">{path}</code>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
                      </div>
                   ))}
                </div>
             </div>
             <div className="space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-3">
                   <Layout size={14} className="text-blue-500" /> Frontend Client
                </h4>
                <div className="space-y-4">
                   {Object.entries(docData?.project_structure?.frontend || {}).map(([path, desc], i) => (
                      <div key={i} className="group p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all hover:translate-x-2">
                         <code className="text-xs font-black text-blue-500 font-mono block mb-2">{path}</code>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="p-10 rounded-[4rem] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden ring-4 ring-slate-800/50">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
             <div className="relative z-10 flex flex-col items-center gap-12 py-10 text-center">
                <div className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest italic">Global Data Flow Diagram</div>
                <div className="flex flex-col md:flex-row items-center gap-12 font-mono text-xs text-slate-500">
                   <div className="w-40 p-6 rounded-2xl border-2 border-slate-700 bg-slate-800/50">React Client</div>
                   <ArrowDown className="md:-rotate-90 text-indigo-500" />
                   <div className="w-48 p-8 rounded-3xl border-2 border-indigo-500 bg-indigo-500/10 text-white font-black italic shadow-2xl shadow-indigo-500/20">Express Engine</div>
                   <ArrowDown className="md:-rotate-90 text-indigo-500" />
                   <div className="w-40 p-6 rounded-2xl border-2 border-slate-700 bg-slate-800/50">MongoDB Atlas</div>
                </div>
             </div>
          </div>
        </div>
      );

    case "api-reference":
      return (
        <div className="space-y-16">
          <header>
             <div className="flex items-center gap-3 mb-4">
                <Hash className="text-indigo-600" size={16} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Section 03</span>
             </div>
             <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase">API Reference</h1>
             <p className="text-xl text-slate-500 font-medium">Granular documentation of all v1 backend endpoints. Standardized JSON-REST communication.</p>
          </header>

          <div className="space-y-20">
             {(docData?.api_documentation?.groups || []).map((group, i) => (
               <section key={i} className="space-y-8">
                 <div className="flex items-center gap-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.6em] text-slate-400 bg-slate-100 dark:bg-slate-900 px-6 py-2 rounded-2xl shrink-0 italic">{group.name}</h2>
                    <div className="h-0.5 flex-1 bg-linear-to-r from-slate-200 to-transparent dark:from-slate-800"></div>
                 </div>
                 <div className="grid grid-cols-1 gap-8">
                   {(group.endpoints || []).map((ep, j) => (
                     <div key={j} className="p-10 border border-slate-100 dark:border-slate-800 rounded-[3rem] bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-2xl transition-all duration-500 relative group overflow-hidden">
                       <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                          <Code size={120} />
                       </div>
                       <div className="flex flex-col lg:flex-row justify-between gap-10 relative z-10">
                          <div className="flex-1 space-y-6">
                             <div className="flex items-center gap-4">
                                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-xl ${
                                  ep.method === 'GET' ? 'bg-blue-600 text-white' : 
                                  ep.method === 'POST' ? 'bg-emerald-600 text-white' : 
                                  'bg-amber-600 text-white'
                                }`}>
                                  {ep.method}
                                </span>
                                <code className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tighter leading-none">{docData?.api_documentation?.base_url}{ep.path}</code>
                             </div>
                             <p className="text-xl text-slate-700 dark:text-slate-300 font-black tracking-tight italic max-w-2xl leading-none">"{ep.description}"</p>
                             <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                   <Shield size={16} className="text-indigo-600" />
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{ep.permission}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Lock size={16} className="text-emerald-500" />
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none italic font-mono">AUTH_VERIFIED</span>
                                </div>
                             </div>
                          </div>
                          <div className="w-full lg:w-[32rem]">
                             <div className="p-6 rounded-[2rem] bg-slate-950 shadow-2xl relative">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
                                   <span className="text-slate-600 uppercase font-black text-[9px] tracking-widest italic">Process Strategy</span>
                                   <Terminal size={14} className="text-slate-800" />
                                </div>
                                <p className="text-emerald-400 text-xs italic mb-6 leading-relaxed bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                   // {ep.logic}
                                </p>
                                {ep.payload && (
                                  <div className="space-y-2">
                                     <span className="uppercase font-black text-[8px] text-slate-700 tracking-widest">Demo Payload</span>
                                     <pre className="text-blue-300 text-[10px] bg-black/40 p-4 rounded-xl border border-slate-800/50 font-mono">{JSON.stringify(ep.payload, null, 2)}</pre>
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </section>
             ))}
          </div>
        </div>
      );

    case "database":
      return (
        <div className="space-y-12">
          <header>
             <div className="flex items-center gap-3 mb-4">
                <Hash className="text-indigo-600" size={16} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Section 04</span>
             </div>
             <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase">Database Schema</h1>
             <p className="text-xl text-slate-500 font-medium">Relational mapping and Mongoose interface definitions.</p>
          </header>

          <div className="space-y-8">
            {(docData?.db_schema || []).map((s, i) => (
              <div key={i} className="p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 group">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-3xl bg-indigo-600 text-white shadow-xl group-hover:rotate-12 transition-transform">
                       <Database size={28} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{s.model} Interface</h4>
                       <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">Mongoose Schema Definition</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] block mb-3 italic">Associations</span>
                       <p className="text-sm text-slate-500 font-medium border-l-4 border-indigo-500 pl-4 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-r-xl">{s.relations}</p>
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] block mb-3 italic">Technical Fields</span>
                       <div className="bg-slate-950 p-6 rounded-3xl border border-slate-900">
                          <code className="text-xs text-emerald-400 font-mono block whitespace-pre-wrap">{s.critical_fields}</code>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "storage":
      return (
        <div className="space-y-12">
          <header>
             <div className="flex items-center gap-3 mb-4">
                <Hash className="text-indigo-600" size={16} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Section 05</span>
             </div>
             <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase tracking-tighter">AWS S3 Orchestration</h1>
             <p className="text-xl text-slate-500 font-medium italic">Object lifecycle and folder categorization within Cloud Storage.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
                <Cloud size={140} className="absolute -right-8 -top-8 opacity-10" />
                <h3 className="text-2xl font-black italic mb-6">S3 Operational Config</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-white/20 pb-4">
                      <span className="text-xs font-bold opacity-60">Region</span>
                      <span className="text-sm font-black italic">{docData?.aws_s3_config?.region}</span>
                   </div>
                   <div className="flex items-center justify-between border-b border-white/20 pb-4 text-emerald-300">
                      <span className="text-xs font-bold opacity-60 text-white">Lifecycle</span>
                      <span className="text-sm font-black italic">Active Atomic Deletion</span>
                   </div>
                   <p className="text-xs opacity-80 leading-relaxed font-medium">Objects are strictly paired with MongoDB documents. The <code>deleteFromS3()</code> hook triggers immediately upon record removal to prevent orphaned storage costs.</p>
                </div>
             </div>
             <div className="space-y-4">
                {(docData?.aws_s3_config?.folders || []).map((f, i) => (
                   <div key={i} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 transition-all flex items-center gap-5 group">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                         <Folders size={20} />
                      </div>
                      <div className="space-y-1">
                         <span className="text-sm font-black text-slate-900 dark:text-white font-mono lowercase tracking-tighter">/{f?.split(" ")[0]}/</span>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{f?.split("(")[1]?.replace(")","") || "Resource Assets"}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      );

    case "security":
      return (
        <div className="space-y-12">
          <header>
             <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase tracking-tighter">RBAC Hierarchy</h1>
             <p className="text-xl text-slate-500 font-medium italic">Role-Based Access Control and Permission Resolution Logic.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-3">
                   <Shield size={14} className="text-indigo-600" /> User Authority Logic
                </h4>
                <div className="space-y-4">
                   {Object.entries(docData?.rbac_hierarchy || {}).map(([role, desc], i) => (
                      <div key={i} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex gap-6 group hover:translate-x-2 transition-all">
                         <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                            <UserCheck size={28} />
                         </div>
                         <div>
                            <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{role?.replace("_"," ")}</h5>
                            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">{desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             <div className="space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-3">
                   <Code size={14} className="text-emerald-500" /> Auth Middleware Logic
                </h4>
                <div className="p-10 rounded-[3rem] bg-slate-950 text-indigo-400 font-mono text-[11px] shadow-3xl relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform">
                      <Lock size={120} />
                   </div>
                   <div className="space-y-6 relative z-10">
                      <div className="pb-6 border-b border-slate-800">
                         <p className="text-slate-500 mb-4 tracking-widest uppercase font-black text-[9px]">// Hierarchy Check Strategy</p>
                         <p className="text-slate-300 leading-relaxed italic">
                            The system uses a recursive permission resolver. If a user possesses the <code>"*"</code> wildcard (Super Admin) or specific <code>resource.action</code> strings, the <code>rbac.middleware.ts</code> grants access.
                         </p>
                      </div>
                      <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
{`const hasPermission = 
  user.permissions?.includes(requiredPermission) || 
  user.permissions?.includes("*");

if (!hasPermission) {
  return res.status(403).json({ message: "Forbidden" });
}`}
                      </pre>
                      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                         <p className="text-[10px] font-black uppercase tracking-widest mb-1">Critical Detail</p>
                         <p className="text-xs leading-relaxed underline">Admins are prohibited from editing their own permission array to prevent self-escalation.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      );

    case "devops":
      return (
        <div className="space-y-12">
           <header>
             <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase tracking-tighter">CI/CD & DevOps</h1>
             <p className="text-xl text-slate-500 font-medium italic">Continuous Integration and CloudFormation Pipeline.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="p-12 rounded-[4rem] bg-linear-to-br from-indigo-700 to-indigo-900 text-white shadow-2xl relative group overflow-hidden">
                <Box size={200} className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black italic mb-8 uppercase tracking-tighter">Serverless Specs</h3>
                <div className="space-y-4">
                   {Object.entries(docData?.ci_cd_devops || {}).map(([key, val], i) => (
                      <div key={i} className="flex items-center justify-between border-b border-white/20 pb-4">
                         <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">{key}</span>
                         <span className="text-sm font-black italic">{val}</span>
                      </div>
                   ))}
                </div>
             </div>
             <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-3">
                   <GitBranch size={14} className="text-blue-500" /> Pipeline Workflow
                </h4>
                <div className="space-y-4">
                   {["Trigger: Push to main", "Action: dist/ build script", "Action: sls deploy command", "Target: AWS Lambda Node 20.x"].map((s, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4 group">
                         <CheckCircle2 size={16} className="text-emerald-500" />
                         <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-widest">{s}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      );

    case "config":
      return (
        <div className="space-y-12">
          <header>
            <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase tracking-tighter">Configuration</h1>
            <p className="text-xl text-slate-500 font-medium italic">Environmental injection and platform variables.</p>
          </header>

          <div className="grid grid-cols-1 gap-4">
            {docData?.environment_variables?.map((env, i) => (
              <div key={i} className="p-8 rounded-[3rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-6 hover:translate-x-1 transition-transform group">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors border border-slate-100 dark:border-slate-800">
                       <Hash size={24} />
                    </div>
                    <div>
                       <code className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{env.key}</code>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Required Core Variable</p>
                    </div>
                 </div>
                 <div className="text-sm font-medium text-slate-500 italic max-w-sm text-right">
                    {env.purpose}
                 </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="text-slate-500 italic">This section is currently under development.</div>;
  }
}
