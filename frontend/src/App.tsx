import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Network, Database, Brain, HeartPulse } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { round: 1, accuracy: 0.65, loss: 0.8 },
  { round: 2, accuracy: 0.72, loss: 0.6 },
  { round: 3, accuracy: 0.85, loss: 0.4 },
  { round: 4, accuracy: 0.91, loss: 0.25 },
  { round: 5, accuracy: 0.94, loss: 0.15 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setPrediction({
        risk: Math.random() > 0.5 ? 'High Risk' : 'Low Risk',
        confidence: (Math.random() * (99 - 80) + 80).toFixed(1),
        txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 py-8 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
              <HeartPulse className="text-primary w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                HealthLedger FL
              </h1>
              <p className="text-sm text-gray-400">Decentralized Privacy-Preserving AI</p>
            </div>
          </motion.div>

          <nav className="flex gap-4">
            {['dashboard', 'network', 'predict'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Stats Cards */}
              <div className="glass-panel p-6 flex items-center gap-4">
                <div className="p-4 rounded-full bg-secondary/20 text-secondary"><Network size={28} /></div>
                <div>
                  <p className="text-gray-400 text-sm">Active Nodes</p>
                  <p className="text-3xl font-bold">4</p>
                </div>
              </div>
              <div className="glass-panel p-6 flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary/20 text-primary"><Brain size={28} /></div>
                <div>
                  <p className="text-gray-400 text-sm">Global Accuracy</p>
                  <p className="text-3xl font-bold">94.2%</p>
                </div>
              </div>
              <div className="glass-panel p-6 flex items-center gap-4">
                <div className="p-4 rounded-full bg-accent/20 text-accent"><Shield size={28} /></div>
                <div>
                  <p className="text-gray-400 text-sm">Audit Blocks</p>
                  <p className="text-3xl font-bold">1,204</p>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel p-6 md:col-span-2 h-[400px]">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Activity className="text-primary" /> Federated Learning Progress
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="round" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#38bdf8" strokeWidth={3} dot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Audit Logs */}
              <div className="glass-panel p-6">
                <h3 className="text-xl font-semibold mb-6">Live Blockchain Audit</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                      <div className="flex justify-between text-gray-400 mb-1">
                        <span>Round {i+1} Aggregation</span>
                        <span>{i*2}m ago</span>
                      </div>
                      <div className="text-xs font-mono text-primary truncate">
                        Hash: 0x{Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'predict' && (
            <motion.div
              key="predict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-panel p-8">
                <h2 className="text-2xl font-bold mb-2">Cardiovascular Risk Prediction</h2>
                <p className="text-gray-400 mb-8">Enter patient clinical metrics securely. The prediction will be performed by the global model and logged to the blockchain.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['Age', 'Cholesterol', 'Blood Pressure', 'Heart Rate'].map(lbl => (
                    <div key={lbl}>
                      <label className="block text-sm text-gray-400 mb-1">{lbl}</label>
                      <input 
                        type="number" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder={`Enter ${lbl.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <><Activity size={20} /> Run Secure Prediction</>
                  )}
                </button>

                <AnimatePresence>
                  {prediction && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-8 p-6 rounded-xl border border-accent/30 bg-accent/10 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        Result: <span className={prediction.risk === 'High Risk' ? 'text-red-400' : 'text-green-400'}>{prediction.risk}</span>
                      </h3>
                      <p className="text-gray-300">Confidence: <span className="font-bold">{prediction.confidence}%</span></p>
                      
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Shield size={12}/> Blockchain Audit Receipt:</p>
                        <p className="font-mono text-xs text-primary break-all">{prediction.txHash}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
