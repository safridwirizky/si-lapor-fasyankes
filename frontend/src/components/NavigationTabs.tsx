import React from 'react';
import { 
  BarChart3, 
  Users, 
  Smile, 
  AlertCircle, 
  TestTube2, 
  Share2 
} from 'lucide-react';
import { ReportType } from '../types';

interface NavigationTabsProps {
  activeTab: ReportType;
  setActiveTab: (tab: ReportType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: ReportType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { 
      id: 'overview', 
      label: 'Ringkasan Rote Ndao', 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
    { 
      id: 'kunjungan', 
      label: '1. Rajal, Ranap & Jiwa', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'gigi', 
      label: '2. Kesehatan Gigi & Mulut', 
      icon: <Smile className="w-4 h-4" /> 
    },
    { 
      id: 'penyakit', 
      label: '3. 15 Besar Penyakit', 
      icon: <AlertCircle className="w-4 h-4" /> 
    },
    { 
      id: 'laboratorium', 
      label: '4. Laboratorium', 
      icon: <TestTube2 className="w-4 h-4" /> 
    },
    { 
      id: 'rujukan', 
      label: '5. Laporan Rujukan', 
      icon: <Share2 className="w-4 h-4" /> 
    },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
