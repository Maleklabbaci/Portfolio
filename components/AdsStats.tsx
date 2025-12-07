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
      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-xl">
        <p className="text-gray-400 text-xs mb-1 font-bold uppercase">{label}</p>
        <p className="text-brand-accent text-lg font-bold">
          ROAS: {payload[0].value}x
        </p>
        <p className="text-brand-black text-sm font-bold">
          Rev: {payload[1].value / 1000}k€
        </p>
      </div>
    );
  }
  return null;
};

export const AdsStats: React.FC = () => {
  return (
    <section id="performance" className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        
        {/* Header Section - Centered Layout */}
        <div className="flex flex-col items-center text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-brand-black mb-6">Résultats Ads</h2>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
              Nous transformons vos budgets publicitaires en revenus tangibles grâce à la data. Pas de devinettes, juste des résultats.
            </p>
            
            <div className="flex gap-8 md:gap-16 bg-gray-50 p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <p className="text-5xl font-black text-brand-accent tracking-tight">4.8x</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-2">ROAS Moyen</p>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="text-center">
                    <p className="text-5xl font-black text-brand-black tracking-tight">2M€+</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-2">Générés</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={DATA_ROAS}>
                   <defs>
                     <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                   <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} dy={10} />
                   <YAxis stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}x`} dx={-10} />
                   <Tooltip content={<CustomTooltip />} />
                   <Area type="monotone" dataKey="roas" stroke="#2563eb" strokeWidth={4} fill="url(#grad1)" activeDot={{r: 8, fill: '#2563eb', strokeWidth: 0}} />
                   <Area type="monotone" dataKey="revenue" stroke="transparent" fill="transparent" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col gap-6">
                <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/40 flex items-center gap-6 group hover:border-blue-100 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-brand-accent transition-colors flex-shrink-0">
                        <TrendingUp className="text-brand-accent w-6 h-6 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-brand-black font-bold text-lg">Scaling Vertical</h4>
                        <p className="text-sm text-gray-500 mt-1">Augmentation des budgets en maintenant le ROAS.</p>
                    </div>
                </div>
                
                 <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/40 flex items-center gap-6 group hover:border-blue-100 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-brand-accent transition-colors flex-shrink-0">
                        <Target className="text-brand-accent w-6 h-6 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-brand-black font-bold text-lg">Ciblage IA</h4>
                        <p className="text-sm text-gray-500 mt-1">Algorithmes prédictifs pour identifier vos clients.</p>
                    </div>
                </div>

                <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/40 flex items-center gap-6 group hover:border-blue-100 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-brand-accent transition-colors flex-shrink-0">
                        <DollarSign className="text-brand-accent w-6 h-6 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-brand-black font-bold text-lg">CPA Réduit</h4>
                        <p className="text-sm text-gray-500 mt-1">Diminution moyenne du coût d'acquisition de 35%.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};