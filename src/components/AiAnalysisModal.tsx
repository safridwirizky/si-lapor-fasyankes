import React from 'react';
import { 
  Sparkles, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { AiAnalysisResponse } from '../types';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AiAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Pakar Epidemiologi Gemini AI
              </span>
              <h3 className="text-base font-bold text-slate-100">Analisis Kesehatan Publik Rote Ndao</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Menganalisis Data Fasyankes...</p>
                <p className="text-xs text-slate-400 mt-1">
                  Gemini sedang mengolah indikator kunjungan, rasio gigi, surveilans penyakit, dan rujukan.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Gagal Membuat Analisis AI</span>
              </p>
              <p>{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-5 text-xs">
              
              {/* Title & Executive Summary */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <h4 className="text-sm font-bold text-emerald-300">{data.title}</h4>
                <p className="text-slate-300 mt-2 leading-relaxed">{data.summary}</p>
              </div>

              {/* Key Insights */}
              {data.keyInsights && data.keyInsights.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <span>Temuan Kunci Epidemiologis</span>
                  </h5>
                  <div className="space-y-1.5">
                    {data.keyInsights.map((insight, idx) => (
                      <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-start space-x-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerts & Anomalies */}
              {data.anomaliesOrAlerts && data.anomaliesOrAlerts.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Peringatan Kewaspadaan Dini & Tren</span>
                  </h5>
                  <div className="space-y-1.5">
                    {data.anomaliesOrAlerts.map((alert, idx) => (
                      <div key={idx} className="p-3 bg-amber-950/30 rounded-lg border border-amber-900/40 flex items-start space-x-2 text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {data.recommendations && data.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>Rekomendasi Tindakan Fasyankes</span>
                  </h5>
                  <div className="space-y-1.5">
                    {data.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-900/40 flex items-start space-x-2 text-emerald-200">
                        <Lightbulb className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
          >
            Tutup Hasil Analisis
          </button>
        </div>

      </div>
    </div>
  );
};
