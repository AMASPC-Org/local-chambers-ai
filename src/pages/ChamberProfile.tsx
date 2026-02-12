import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChamberProduct, MembershipLead } from '../types';
import { useOrganization, useLeadSubmit } from '../agents/FrontendAgent';
import { Loader2, Check, CreditCard, FileText, Mail, Info, X, Phone, User, Send, MapPin, Globe } from 'lucide-react';
import { Head } from '../components/Head';
import { ChamberMap } from '../components/ChamberMap';
import { parsePrice } from '../utils/price';

export const ChamberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organization: org, loading } = useOrganization(id || '');
  const { submitLead } = useLeadSubmit();
  const [isNonProfit, setIsNonProfit] = useState(false);
  
  // Lead Modal State
  const [leadModal, setLeadModal] = useState<any | null>(null);
  const [leadFormData, setLeadFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Derive chamber + products from hook
  const chamber = org;
  const products = (org?.membership_tiers || []).map((t: any, index: number) => {
    const numericPrice = parsePrice(t.annual_cost);
    return {
      id: `tier-${index}`,
      name: t.name,
      description: t.description,
      price: numericPrice,
      pricingType: numericPrice > 0 ? 'Fixed' : 'Contact',
      benefits: [] 
    };
  });

  const getPrice = (basePrice?: number) => {
    if (!basePrice) return 0;
    return isNonProfit ? Math.round(basePrice * 0.8) : basePrice;
  };

  const handleJoin = (product: any, method: 'Card' | 'Invoice') => {
    const finalAmount = getPrice(product.price);
    navigate('/checkout', { 
      state: { 
        chamberId: chamber?.id, 
        chamberName: chamber?.org_name,
        tier: product.name, 
        amount: finalAmount,
        isNonProfit,
        paymentMethod: method 
      } 
    });
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadModal || !chamber) return;
    setSubmittingLead(true);
    
    try {
      await submitLead(
        chamber.id,
        leadFormData.name,
        leadFormData.email,
        leadFormData.message,
        `ChamberProfile: ${leadModal.name}`
      );
      setLeadSuccess(true);
      setTimeout(() => {
        setLeadModal(null);
        setLeadSuccess(false);
        setLeadFormData({ name: '', email: '', phone: '', message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to submit lead', err);
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
  if (!chamber) return <div className="text-center py-20">Chamber not found</div>;

  return (
    <div className="bg-white min-h-screen pb-24">
      <Head 
        title={`${chamber.org_name} Membership`} 
        description={`Explore membership tiers for ${chamber.org_name}. Optimized for local business growth.`}
      />

      {/* Hero Header */}
      <div className="bg-chamber-navy text-white pt-24 pb-48 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://www.transparenttextures.com/patterns/cubes.png" alt="pattern" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Mail className="w-4 h-4 text-chamber-gold" /> Member Since 2024
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 tracking-tight">{chamber.org_name}</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">{chamber.executive?.title}: {chamber.executive?.name}</p>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-chamber-gold" />
              <span className="text-sm font-medium">{chamber.region || chamber.city || 'Regional Center'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-chamber-gold" />
              <span className="text-sm font-medium">{chamber.website || 'No Website Listed'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* Top Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Discount Toggle */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-slate-100 gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isNonProfit ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                 <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Registered Non-Profit (501c3)?</p>
                <p className="text-sm text-slate-500">Toggle for a 20% discount on all tiers.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsNonProfit(!isNonProfit)}
              className={`px-8 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${isNonProfit ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isNonProfit ? 'Discount Active ✓' : 'Apply Discount'}
            </button>
          </div>

          {/* Quick Info / Verification */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${chamber.data_quality?.completeness_score > 70 ? 'bg-amber-100 text-chamber-gold' : 'bg-slate-200 text-slate-400'}`}>
               <Check className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Confidence Score</p>
               <p className="font-bold text-slate-900">{chamber.data_quality?.completeness_score || 0}% Reliable</p>
             </div>
          </div>
        </div>

        {/* Dynamic Grid: Products & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Tiers Column */}
          <div className="lg:col-span-3">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {products.map((product: any) => (
                  <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 flex flex-col hover:border-chamber-gold transition-all group">
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">{product.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed">{product.description}</p>
                    
                    <div className="mb-8">
                      {product.pricingType === 'Fixed' ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black text-slate-900 tracking-tighter">${getPrice(product.price)}</span>
                          <span className="text-slate-400 font-bold">/yr</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-chamber-gold">
                          <Info className="w-5 h-5" />
                          <span className="text-lg font-bold uppercase tracking-wider">Call for Quote</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-50">
                      {product.pricingType === 'Fixed' ? (
                        <>
                          <button 
                            onClick={() => handleJoin(product, 'Card')}
                            className="w-full py-4 bg-chamber-navy text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-5 h-5" /> Join & Pay Now
                          </button>
                          <button 
                            onClick={() => handleJoin(product, 'Invoice')}
                            className="w-full py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                          >
                            <FileText className="w-5 h-5" /> Request Invoice
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setLeadModal(product)}
                          className="w-full py-4 bg-chamber-gold text-white rounded-2xl font-bold shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Mail className="w-5 h-5" /> Request Custom Quote
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="md:col-span-2 text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Info className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Interested in joining {chamber.org_name}?</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">This chamber hasn't defined their digital tiers yet.</p>
                    <button 
                      onClick={() => setLeadModal({ id: 'general', name: 'General Membership Inquiry', chamberId: chamber.id, description: '', pricingType: 'Contact', benefits: [] })}
                      className="px-10 py-4 bg-chamber-navy text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all"
                    >
                      Send Inquiry
                    </button>
                  </div>
                )}
             </div>
          </div>

          {/* Location & Map Column */}
          <div className="lg:col-span-1 space-y-8">
             <div className="sticky top-24">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Headquarters & Directions</h4>
                <ChamberMap 
                  address={chamber.address} 
                  coordinates={chamber.coordinates}
                  name={chamber.org_name} 
                />
                
                <div className="mt-8 bg-slate-50 rounded-3xl p-6 border border-slate-200">
                   <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-chamber-gold" /> Key Services
                   </h5>
                   <ul className="space-y-3">
                      {(chamber.services || []).slice(0, 5).map((s: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                           <div className="w-1.5 h-1.5 rounded-full bg-chamber-gold" />
                           {s}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Quote Request Modal */}
      {leadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setLeadModal(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-chamber-navy p-8 text-white relative">
              <button onClick={() => setLeadModal(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <h3 className="text-2xl font-serif font-bold mb-2">Inquire: {leadModal.name}</h3>
              <p className="text-slate-400 text-sm">Send your details and the chamber will contact you within 24 hours.</p>
            </div>

            {leadSuccess ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Inquiry Sent!</h4>
                <p className="text-slate-500">The chamber has been notified of your interest.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        required 
                        value={leadFormData.name} 
                        onChange={e => setLeadFormData({...leadFormData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-chamber-gold outline-none text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Work Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        required 
                        type="tel" 
                        value={leadFormData.phone} 
                        onChange={e => setLeadFormData({...leadFormData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-chamber-gold outline-none text-sm" 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required 
                      type="email" 
                      value={leadFormData.email} 
                      onChange={e => setLeadFormData({...leadFormData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-chamber-gold outline-none text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Note (Optional)</label>
                  <textarea 
                    value={leadFormData.message} 
                    onChange={e => setLeadFormData({...leadFormData, message: e.target.value})}
                    placeholder="Tell the chamber about your business..."
                    className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-chamber-gold outline-none text-sm h-24 resize-none" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={submittingLead}
                  className="w-full py-4 bg-chamber-gold text-white rounded-2xl font-bold shadow-xl hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                >
                  {submittingLead ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                  {submittingLead ? 'Sending...' : 'Request Quote'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
