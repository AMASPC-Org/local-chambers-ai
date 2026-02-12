import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCheckout } from '../agents/FrontendAgent';
import { MembershipPayload, TransactionResult } from '../types';
import { CreditCard, FileText, Lock, Loader2, CheckCircle, ChevronLeft } from 'lucide-react';

export const Checkout: React.FC = () => {
  const location = useLocation();
  const state = location.state as { 
    chamberId: string; 
    chamberName: string;
    tier: string; 
    amount: number; 
    isNonProfit: boolean;
    paymentMethod?: 'Card' | 'Invoice';
  } | undefined;

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    cardName: '',
    cardNumber: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Invoice'>(state?.paymentMethod || 'Card');
  const { process, processing, result } = useCheckout();

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No membership selection found.</p>
          <Link to="/" className="text-chamber-gold font-medium hover:underline">Return to Directory</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: MembershipPayload = {
      chamberId: state.chamberId,
      user: {
        email: formData.email,
        companyName: formData.companyName,
        isNonProfit: state.isNonProfit
      },
      tier: state.tier,
      amount: state.amount,
      paymentMethod
    };

    await process(payload);
  };

  if (result?.status === 'success') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8 shadow-2xl ring-8 ring-green-50">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <h2 className="text-4xl font-serif font-black text-chamber-navy mb-4 tracking-tight">Welcome to {state.chamberName}!</h2>
        <p className="text-slate-500 text-lg mb-12 font-medium">Your application for the <span className="text-slate-900 font-bold">{state.tier}</span> tier has been processed.</p>
        
        {result.membership_status === 'Provisional' ? (
          <div className="bg-white border border-slate-200 rounded-[32px] p-10 mb-12 shadow-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              Immediate Access Enabled
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Provisional Status Granted</h3>
            <p className="text-slate-600 leading-relaxed">
              While your membership is subject to final board review, you can immediately access the local directory, member-only perks, and upcoming networking events.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[32px] p-10 mb-12 shadow-xl">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              Invoice Issued
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Awaiting Payment</h3>
            <p className="text-slate-600 leading-relaxed">
              Your invoice request has been submitted successfully. An electronic copy has been sent to <span className="font-bold text-slate-900">{formData.email}</span>. Your membership benefits will activate automatically once payment is received.
            </p>
          </div>
        )}

        <Link to="/" className="inline-flex items-center px-10 py-4 border border-transparent text-lg font-bold rounded-2xl shadow-xl text-white bg-chamber-navy hover:bg-slate-800 transition-all hover:-translate-y-1">
          Enter Member Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <Link to={`/chamber/${state.chamberId}`} className="text-slate-400 hover:text-slate-600 flex items-center text-sm font-bold mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Change Plan
          </Link>
          <h1 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Review & Pay</h1>
          <p className="text-slate-500">Secure checkout for {state.chamberName} membership.</p>
        </header>
        
        <div className="bg-white shadow-2xl rounded-[32px] overflow-hidden mb-10 border border-slate-100">
          <div className="px-8 py-6 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Membership Summary</h3>
            <span className="text-xs font-black text-chamber-gold bg-amber-50 px-3 py-1 rounded-full uppercase tracking-tighter">Annual Billing</span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Plan</dt>
                <dd className="text-xl font-bold text-slate-900">{state.tier}</dd>
                <p className="text-sm text-slate-500 mt-1">{state.chamberName}</p>
              </div>
              <div className="text-right">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Due</dt>
                <dd className="text-3xl font-black text-chamber-navy tracking-tighter">
                  ${(state.amount || 0).toLocaleString()}
                  <span className="text-base font-bold text-slate-400 ml-1">/yr</span>
                </dd>
                {state.isNonProfit && <p className="text-xs font-bold text-green-600 mt-1 uppercase tracking-wider">20% Non-Profit Discount Applied</p>}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-[32px] p-10 space-y-8 border border-slate-100">
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-chamber-gold rounded-full" /> Organization Identity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="ACME Corp"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-1 focus:ring-chamber-gold outline-none text-slate-900 placeholder-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Billing Email</label>
                <input
                  type="email"
                  required
                  placeholder="billing@acme.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-1 focus:ring-chamber-gold outline-none text-slate-900 placeholder-slate-300"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-6">Payment Method</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex-1 flex items-center justify-center p-5 border-2 rounded-2xl font-bold transition-all ${paymentMethod === 'Card' ? 'border-chamber-gold bg-amber-50 text-chamber-gold ring-4 ring-amber-50' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                Credit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Invoice')}
                className={`flex-1 flex items-center justify-center p-5 border-2 rounded-2xl font-bold transition-all ${paymentMethod === 'Invoice' ? 'border-chamber-gold bg-amber-50 text-chamber-gold ring-4 ring-amber-50' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
              >
                <FileText className="w-5 h-5 mr-3" />
                Request Invoice
              </button>
            </div>
          </div>

          {paymentMethod === 'Card' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 p-6 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.cardName}
                    onChange={e => setFormData({...formData, cardName: e.target.value})}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 focus:ring-1 focus:ring-chamber-gold outline-none text-slate-900 placeholder-slate-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={formData.cardNumber}
                    onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 focus:ring-1 focus:ring-chamber-gold outline-none text-slate-900 placeholder-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-white border-none rounded-xl py-3 px-4 focus:ring-1 focus:ring-chamber-gold outline-none text-slate-900 placeholder-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-slate-100">
            <button
              type="submit"
              disabled={processing}
              className="w-full flex justify-center items-center py-5 bg-chamber-navy text-white rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition-all transform hover:-translate-y-1 disabled:bg-slate-300"
            >
              {processing ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin h-6 w-6" />
                  <span>Finalizing Transaction...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {paymentMethod === 'Card' ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  <span>{paymentMethod === 'Card' ? `Pay $${state.amount.toLocaleString()} & Join` : 'Complete Registration via Invoice'}</span>
                </div>
              )}
            </button>
            <p className="mt-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              {paymentMethod === 'Card' 
                ? "Secure SSL Encryption Enabled. Automatic Renewal Annualy." 
                : "Payment due within 30 days of invoice receipt."}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
