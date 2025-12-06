import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

const DATA_ROAS = [
  { name: 'Jan', roas: 2.1, revenue: 15000 },
  { name: 'Fév', roas: 3.2, revenue: 28000 },
  { name: 'Mar', roas: 3.8, revenue: 35000 },
  { name: 'Avr', roas: 4.5, revenue: 52000 },
  { name: 'Mai', roas: 5.9, revenue: 78000 },
  { name: 'Juin', roas: 7.2, revenue: 95000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-dark border border-gray-700 p-3 rounded shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-brand-accent text-sm font-bold">
          ROAS: {payload[0].value}x
        </p>
        <p className="text-purple-400 text-sm font-bold">
          Rev: {payload[1].value / 1000}k€
        </p>
      </div>
    );
  }
  return null;
};

export const AdsStats: React.FC = () => {
  return (
    <section id="performance" className="py-20 bg-[#050914] border-t border-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Résultats Ads</h2>
                <p className="text-gray-400">Quand la créativité rencontre la data.</p>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
                <div className="text-right">
                    <p className="text-3xl font-bold text-white">4.8x</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">ROAS Moyen</p>
                </div>
                <div className="w-px bg-gray-800 h-12"></div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-white">2M€+</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Générés</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-xl border border-gray-800 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={DATA_ROAS}>
                   <defs>
                     <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                   <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                   <YAxis stroke="#6b7280" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}x`} />
                   <Tooltip content={<CustomTooltip />} />
                   <Area type="monotone" dataKey="roas" stroke="#6366f1" strokeWidth={3} fill="url(#grad1)" />
                   <Area type="monotone" dataKey="revenue" stroke="transparent" fill="transparent" /> {/* Hidden revenue line just for tooltip */}
                 </AreaChart>
               </ResponsiveContainer>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col gap-4">
                <div className="flex-1 bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex items-center gap-4 hover:border-brand-accent/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="text-green-500 w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Scaling</h4>
                        <p className="text-sm text-gray-400">Campagnes optimisées pour le volume sans sacrifier le ROAS.</p>
                    </div>
                </div>
                
                 <div className="flex-1 bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex items-center gap-4 hover:border-brand-accent/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Target className="text-purple-500 w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Ciblage IA</h4>
                        <p className="text-sm text-gray-400">Utilisation d'algos prédictifs pour trouver vos acheteurs.</p>
                    </div>
                </div>

                <div className="flex-1 bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex items-center gap-4 hover:border-brand-accent/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <DollarSign className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">CPA Réduit</h4>
                        <p className="text-sm text-gray-400">Diminution moyenne du coût d'acquisition de 35%.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};