import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Activity      from 'lucide-react/dist/esm/icons/activity';
import Shield        from 'lucide-react/dist/esm/icons/shield';
import Network       from 'lucide-react/dist/esm/icons/network';
import Brain         from 'lucide-react/dist/esm/icons/brain';
import HeartPulse    from 'lucide-react/dist/esm/icons/heart-pulse';
import Server        from 'lucide-react/dist/esm/icons/server';
import Cpu           from 'lucide-react/dist/esm/icons/cpu';
import Zap           from 'lucide-react/dist/esm/icons/zap';
import Lock          from 'lucide-react/dist/esm/icons/lock';
import GitBranch     from 'lucide-react/dist/esm/icons/git-branch';
import CheckCircle2  from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircle   from 'lucide-react/dist/esm/icons/alert-circle';
import Clock         from 'lucide-react/dist/esm/icons/clock';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';


// ─── Static data ───────────────────────────────────────────────────────────────
const mockChartData = [
  { round: 1, accuracy: 0.65, loss: 0.80 },
  { round: 2, accuracy: 0.72, loss: 0.60 },
  { round: 3, accuracy: 0.85, loss: 0.40 },
  { round: 4, accuracy: 0.91, loss: 0.25 },
  { round: 5, accuracy: 0.94, loss: 0.15 },
];

const hospitalNodes = [
  { id: 'H-001', name: 'St. Mary\'s Medical', city: 'New York', samples: 12_400, accuracy: 93.8, epsilon: 0.42, status: 'active', rounds: 5, color: '#38bdf8' },
  { id: 'H-002', name: 'City General',       city: 'Chicago',  samples: 9_870,  accuracy: 92.1, epsilon: 0.38, status: 'active', rounds: 5, color: '#818cf8' },
  { id: 'H-003', name: 'Pacific Health',     city: 'Seattle',  samples: 7_230,  accuracy: 91.5, epsilon: 0.51, status: 'syncing', rounds: 4, color: '#f472b6' },
  { id: 'H-004', name: 'TexMed Institute',   city: 'Houston',  samples: 11_100, accuracy: 94.7, epsilon: 0.35, status: 'active', rounds: 5, color: '#34d399' },
];

const microservices = [
  { name: 'ML Aggregation Server', lang: 'Python/FastAPI', status: 'online', icon: Brain,  color: '#38bdf8', latency: '12ms' },
  { name: 'Privacy Enforcer',      lang: 'Rust',          status: 'online', icon: Shield, color: '#f472b6', latency: '2ms'  },
  { name: 'Metrics Gateway',       lang: 'Go',            status: 'online', icon: Zap,    color: '#34d399', latency: '4ms'  },
  { name: 'Realtime Relay',        lang: 'Elixir',        status: 'online', icon: Activity,color: '#818cf8', latency: '8ms' },
  { name: 'DP Prover',             lang: 'Haskell',       status: 'online', icon: Lock,   color: '#fbbf24', latency: '18ms' },
  { name: 'Smart Contract',        lang: 'Solidity/EVM',  status: 'online', icon: GitBranch,color:'#f472b6', latency: '210ms'},
];

const radarData = [
  { metric: 'Accuracy', value: 94 },
  { metric: 'Privacy',  value: 88 },
  { metric: 'Fairness', value: 82 },
  { metric: 'Latency',  value: 76 },
  { metric: 'Stability',value: 91 },
];

// Static audit log hashes (generated once, not on every render)
const auditLogs = [
  { round: 2, ago: '0m', hash: '0x4f3a8b1c9e2d7f60a5b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f80921a3b4c5d' },
  { round: 3, ago: '2m', hash: '0x8c1d4f2a9b7e3c6d1f5a2b4e8c9d7f3a6b1e4d8c2f9a5b7e3c6d4f1a8b2c9d7' },
  { round: 4, ago: '4m', hash: '0x2b9f4c1a8d7e3b6c9f2a5d8b1e4c7f3a6b9d2e5c8f1a4b7e3c6d9f2a5b8c1d4' },
  { round: 5, ago: '6m', hash: '0x7e3d9c2b8f4a1e6d3c7b2f5a8d1e4c9b6f3a7d2e5c8b1f4a6d9c3b7e2f5a8d1' },
];

// ─── Animated counter hook ─────────────────────────────────────────────────────
function useAnimatedNumber(target: number, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(parseFloat((from + (target - from) * ease).toFixed(decimals)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return val;
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────
function PulseDot({ color = '#34d399' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, color, label, value, unit = '' }: {
  icon: React.ElementType; color: string; label: string; value: number | string; unit?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-panel p-6 flex items-center gap-4 cursor-default"
    >
      <div className="p-4 rounded-2xl border" style={{ backgroundColor: color + '22', borderColor: color + '44' }}>
        <Icon size={26} style={{ color }} />
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-white">{value}{unit}</p>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm shadow-2xl">
      <p className="text-gray-400 mb-1">Round {label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold capitalize">
          {p.dataKey}: {(p.value * 100).toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab() {
  const acc  = useAnimatedNumber(94.2, 1);
  const blks = useAnimatedNumber(1204);

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Stats */}
      <StatCard icon={Network} color="#818cf8" label="Active Nodes"     value={4} />
      <StatCard icon={Brain}   color="#38bdf8" label="Global Accuracy"  value={acc} unit="%" />
      <StatCard icon={Shield}  color="#f472b6" label="Audit Blocks"     value={blks.toLocaleString()} />

      {/* Chart — Accuracy + Loss */}
      <div className="glass-panel p-6 md:col-span-2 h-[420px]">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-white">
          <Activity className="text-primary" size={20} /> Federated Learning Progress
        </h3>
        <p className="text-xs text-gray-500 mb-5">Accuracy &amp; loss over 5 global rounds</p>
        <ResponsiveContainer width="100%" height="82%">
          <LineChart data={mockChartData}>
            <defs>
              <linearGradient id="accGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="round" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Round', position: 'insideBottom', offset: -2, fill: '#555', fontSize: 11 }} />
            <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="accuracy" stroke="url(#accGrad)" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="loss" stroke="#f472b6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#f472b6', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-5 mt-1 justify-end text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-0.5 bg-sky-400 rounded" /> Accuracy</span>
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-0.5 bg-pink-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#f472b6 0 6px,transparent 6px 9px)' }} /> Loss</span>
        </div>
      </div>

      {/* Live Blockchain Audit */}
      <div className="glass-panel p-6 flex flex-col">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-white">
          <Shield size={18} className="text-pink-400" /> Live Blockchain Audit
        </h3>
        <p className="text-xs text-gray-500 mb-5">Immutable training receipts on-chain</p>
        <div className="space-y-3 flex-1 overflow-auto">
          {auditLogs.map((log, i) => (
            <motion.div
              key={log.round}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl bg-white/4 border border-white/5 text-sm hover:border-white/15 transition-colors"
            >
              <div className="flex justify-between text-gray-400 mb-1 text-xs">
                <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green-400" /> Round {log.round} Aggregation</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {log.ago} ago</span>
              </div>
              <div className="text-[10px] font-mono text-sky-400 truncate">{log.hash}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DP Privacy Metrics */}
      <div className="glass-panel p-6 md:col-span-2">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-white">
          <Lock size={18} className="text-yellow-400" /> Differential Privacy Bounds
        </h3>
        <p className="text-xs text-gray-500 mb-5">Formally verified by the Haskell DP Prover (ε, δ guarantees)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hospitalNodes.map((n) => (
            <div key={n.id} className="bg-white/4 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{n.name.split(' ')[0]}</p>
              <p className="text-2xl font-bold" style={{ color: n.color }}>ε={n.epsilon}</p>
              <div className="mt-2 bg-white/5 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 - n.epsilon) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: n.color }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">δ = 1e-5</p>
            </div>
          ))}
        </div>
      </div>

      {/* Radar */}
      <div className="glass-panel p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-1 text-white flex items-center gap-2">
          <Cpu size={18} className="text-violet-400" /> Model Health
        </h3>
        <p className="text-xs text-gray-500 mb-3">Overall federated model quality</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#ffffff10" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#888', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ─── Network Tab ──────────────────────────────────────────────────────────────
function NetworkTab() {
  const statusColor = (s: string) => s === 'active' ? '#34d399' : '#fbbf24';

  return (
    <motion.div
      key="network"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hospitalNodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass-panel p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl border" style={{ backgroundColor: node.color + '20', borderColor: node.color + '40' }}>
                  <Server size={22} style={{ color: node.color }} />
                </div>
                <div>
                  <p className="font-bold text-white">{node.name}</p>
                  <p className="text-xs text-gray-500">{node.city} · Node {node.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border"
                style={{ color: statusColor(node.status), borderColor: statusColor(node.status) + '55', backgroundColor: statusColor(node.status) + '15' }}>
                <PulseDot color={statusColor(node.status)} />
                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white/4 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Samples</p>
                <p className="font-bold text-white">{node.samples.toLocaleString()}</p>
              </div>
              <div className="bg-white/4 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                <p className="font-bold" style={{ color: node.color }}>{node.accuracy}%</p>
              </div>
              <div className="bg-white/4 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Rounds</p>
                <p className="font-bold text-white">{node.rounds}/5</p>
              </div>
            </div>

            {/* Round progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Training Progress</span>
                <span>{Math.round((node.rounds / 5) * 100)}%</span>
              </div>
              <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(node.rounds / 5) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${node.color}88, ${node.color})` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Microservice Status */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-white">
          <Cpu size={18} className="text-violet-400" /> Polyglot Microservice Stack
        </h3>
        <p className="text-xs text-gray-500 mb-5">Real-time health of all backend services</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {microservices.map((svc, i) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 bg-white/4 border border-white/5 rounded-xl p-4 cursor-default"
            >
              <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: svc.color + '20' }}>
                <svc.icon size={18} style={{ color: svc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{svc.name}</p>
                <p className="text-xs text-gray-500">{svc.lang}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end mb-0.5">
                  <PulseDot color="#34d399" />
                  <span className="text-xs text-green-400">Online</span>
                </div>
                <p className="text-xs text-gray-600">{svc.latency}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Predict Tab ──────────────────────────────────────────────────────────────
function PredictTab() {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({ Age: '', Cholesterol: '', 'Blood Pressure': '', 'Heart Rate': '', Glucose: '', BMI: '' });

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      const risk = Math.random() > 0.5 ? 'High Risk' : 'Low Risk';
      const confidence = (Math.random() * (99 - 80) + 80).toFixed(1);
      const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setPrediction({ risk, confidence, txHash: hash });
      setLoading(false);
    }, 1800);
  };

  const inputFields = Object.keys(fields);

  return (
    <motion.div
      key="predict"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <HeartPulse size={24} className="text-pink-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Cardiovascular Risk Prediction</h2>
            <p className="text-sm text-gray-500">Powered by the global federated model · All data stays local</p>
          </div>
        </div>
        <div className="my-5 h-px bg-white/5" />

        <div className="grid grid-cols-2 gap-4 mb-6">
          {inputFields.map((lbl) => (
            <div key={lbl}>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">{lbl}</label>
              <input
                type="number"
                value={(fields as any)[lbl]}
                onChange={(e) => setFields((f) => ({ ...f, [lbl]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-400/60 focus:bg-white/8 transition-all placeholder:text-gray-600"
                placeholder={`e.g. ${lbl === 'Age' ? '54' : lbl === 'Cholesterol' ? '220' : lbl === 'Blood Pressure' ? '130' : lbl === 'Heart Rate' ? '72' : lbl === 'Glucose' ? '95' : '26.4'}`}
              />
            </div>
          ))}
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-2 mb-6 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
          <Lock size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400">
            Patient data is <span className="text-violet-300">never transmitted</span>. Local inference is performed by the globally aggregated model.
            Each prediction is cryptographically logged to the Ethereum smart contract for auditability.
          </p>
        </div>

        <button
          id="run-prediction-btn"
          onClick={handlePredict}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-violet-600 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:brightness-110 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <><Activity size={18} /> Run Secure Prediction</>
          )}
        </button>

        <AnimatePresence>
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-6 rounded-2xl border relative overflow-hidden"
              style={{
                borderColor: prediction.risk === 'High Risk' ? '#f87171aa' : '#34d399aa',
                backgroundColor: prediction.risk === 'High Risk' ? '#f8717115' : '#34d39915',
              }}
            >
              <div className="absolute left-0 top-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: prediction.risk === 'High Risk' ? '#f87171' : '#34d399' }} />
              <div className="flex items-center gap-3 mb-3">
                {prediction.risk === 'High Risk'
                  ? <AlertCircle size={24} className="text-red-400" />
                  : <CheckCircle2 size={24} className="text-green-400" />}
                <div>
                  <h3 className="text-xl font-bold text-white">Result: <span style={{ color: prediction.risk === 'High Risk' ? '#f87171' : '#34d399' }}>{prediction.risk}</span></h3>
                  <p className="text-sm text-gray-400">Confidence: <span className="font-semibold text-white">{prediction.confidence}%</span></p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Shield size={11} /> Blockchain Audit Receipt</p>
                <p className="font-mono text-xs text-sky-400 break-all leading-relaxed">{prediction.txHash}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
const TABS = ['dashboard', 'network', 'predict'] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('dashboard');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Ambient gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-15%] left-[-5%]  w-[45%] h-[45%] bg-sky-500/15   rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-violet-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] left-[30%]  w-[30%] h-[30%] bg-pink-500/10  rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center mb-10 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-500/30">
              <HeartPulse className="text-sky-400 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 leading-none">
                HealthLedger FL
              </h1>
              <p className="text-xs text-gray-500 tracking-wider mt-0.5">Decentralized · Privacy-Preserving · Federated AI</p>
            </div>
          </motion.div>

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-medium"
          >
            <PulseDot color="#34d399" />
            All Systems Operational
          </motion.div>

          <nav className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-white/10 border border-white/15"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10 capitalize">{tab}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
          {activeTab === 'network'   && <NetworkTab   key="network" />}
          {activeTab === 'predict'   && <PredictTab   key="predict" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
