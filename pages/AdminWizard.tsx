import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrganization, useAISuggestions } from '../src/agents/FrontendAgent';
import { backendAgent } from '../src/agents/BackendAgent';
import { MembershipTier, ChamberProduct } from '../types';
import { Loader2, Sparkles, Upload, ArrowRight, Check, Info } from 'lucide-react';

export const AdminWizard: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { data: chamber } = useOrganization(state?.chamberId);
  const { generate } = useAISuggestions();
  const [step, setStep] = useState(1);
  const [parsing, setParsing] = useState(false);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [parseStatus, setParseStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setParsing(true);
    setParseStatus('Initializing OCR engine...');
    await new Promise(r => setTimeout(r, 1200));
    setParseStatus('Scanning document for currency values...');
    await new Promise(r => setTimeout(r, 1000));
    setParseStatus('Identifying benefit bullets...');
    await new Promise(r => setTimeout(r, 800));
    setParseStatus('Optimizing data for localchambers.ai...');
    
    const suggestions = await generate(chamber?.name || 'Local Chamber', chamber?.region || 'US');
    
    setTiers(suggestions);
    setParsing(false);
    setStep(2);
  };

  const handlePublish = async () => {
    setSaving(true);
    const savePromises = tiers.map(t => {
      const product: Omit<ChamberProduct, 'id'> = {
        chamberId: state.chamberId,
        name: t.name,
        description: t.description,
        pricingType: 'Fixed',
        price: t.price,
        benefits: t.benefits
      };
      return backendAgent.saveChamberProduct(product);
    });

    await Promise.all(savePromises);
    setSaving(false);
    navigate('/admin/dashboard', { state: { chamberId: state.chamberId } });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 max-w-md mx-auto">
           {[1, 2, 3].map(i => (
             <React.Fragment key={i}>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-lg shadow-sm transition-all ${step >= i ? 'bg-chamber-navy text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {i}
                </div>
                {i < 3 && <div className={`h-1 flex-1 mx-2 rounded-full ${step > i ? 'bg-chamber-navy' : 'bg-slate-200'}`} />}
             </React.Fragment>
           ))}
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl p-10 sm:p-16 border border-slate-100">
          
          {step === 1 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-6 bg-amber-50 rounded-3xl mb-8">
                <Sparkles className="h-12 w-12 text-chamber-gold" />
              </div>
              <h1 className="text-4xl font-serif font-black text-slate-900 mb-6 tracking-tight">AI Membership Architect</h1>
              <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">Upload your current membership brochure and our proprietary engine will extract your pricing structure and benefits into a searchable digital directory.</p>
              
              <div className="relative border-4 border-dashed border-slate-100 rounded-[32px] p-20 hover:border-chamber-gold transition-all bg-slate-50/50 group">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileUpload} disabled={parsing} />
                {parsing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-16 w-16 text-chamber-gold animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{parseStatus}</p>
                    <p className="text-sm text-slate-400 mt-2">Connecting to Gemini Intelligence...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6">
                      <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-900">Drag & Drop Your Brochure</p>
                    <p className="text-sm text-slate-400 mt-2">Support for PDF, DOCX, and Scanned Images</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setStep(2)} 
                className="mt-10 text-slate-400 hover:text-chamber-gold font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Skip AI Import & Enter Manually
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Review Your Digital Tiers</h2>
                  <p className="text-slate-500 mt-1">We've structured your data for the directory.</p>
                </div>
                <div className="flex items-center text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest mb-1 shadow-sm border border-green-100">
                  <Check className="h-3 w-3 mr-1" /> AI Optimization Complete
                </div>
              </div>
              
              <div className="space-y-8">
                {tiers.map((tier, idx) => (
                  <div key={idx} className="p-8 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-chamber-gold/20 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                      <div className="flex-1">
                        <input 
                          value={tier.name} 
                          onChange={(e) => {
                             const newTiers = [...tiers];
                             newTiers[idx].name = e.target.value;
                             setTiers(newTiers);
                          }}
                          className="bg-transparent text-2xl font-black text-slate-900 focus:outline-none w-full border-b-2 border-transparent focus:border-amber-100 tracking-tight mb-2"
                        />
                        <textarea 
                           value={tier.description}
                           rows={2}
                           onChange={(e) => {
                             const newTiers = [...tiers];
                             newTiers[idx].description = e.target.value;
                             setTiers(newTiers);
                           }}
                           className="bg-transparent text-base text-slate-500 w-full focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-fit self-start">
                        <span className="text-2xl font-black text-slate-300">$</span>
                        <input 
                          type="number" 
                          value={tier.price} 
                          onChange={(e) => {
                             const newTiers = [...tiers];
                             newTiers[idx].price = parseInt(e.target.value) || 0;
                             setTiers(newTiers);
                          }}
                          className="w-28 text-3xl font-black bg-transparent border-none text-chamber-navy focus:ring-0 outline-none tracking-tighter" 
                        />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/yr</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tier.benefits.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-100 group-hover:shadow-sm transition-all">
                           <div className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                             <Check className="h-3 w-3" />
                           </div>
                           <span className="text-sm font-medium text-slate-600 truncate">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 flex flex-col sm:flex-row justify-between items-center pt-10 border-t border-slate-100 gap-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <Info className="h-5 w-5 text-chamber-gold" />
                  <p className="text-sm font-medium">Click "Publish" to enable public membership signups.</p>
                </div>
                <button 
                  onClick={handlePublish} 
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center px-12 py-5 bg-chamber-navy text-white rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all hover:-translate-y-1 disabled:bg-slate-300"
                >
                  {saving ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Syncing Database...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>Publish to Profile</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};