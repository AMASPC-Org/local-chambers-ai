import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Head } from '../components/Head';
import { useClaimListing } from '../src/agents/FrontendAgent';
import { Loader2, ShieldCheck, Mail, Building2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { chambers, claim, loading, error } = useClaimListing();
  const [selectedChamber, setSelectedChamber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await claim(selectedChamber, email);
    if (result.status === 'success') {
      navigate('/admin/verify', { state: { chamberId: selectedChamber, email } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Head title="Admin Portal" description="Claim and manage your Chamber of Commerce profile." />
      
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-chamber-gold rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-slate-500">Claim your listing or manage your chamber</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Your Chamber</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  value={selectedChamber}
                  onChange={e => setSelectedChamber(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-chamber-gold focus:border-chamber-gold bg-white text-slate-900"
                >
                  <option value="">Select a Chamber...</option>
                  {chambers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Work Email Address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@chamber.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-chamber-gold focus:border-chamber-gold"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Must match your chamber's official website domain.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedChamber}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-chamber-navy hover:bg-slate-800 focus:outline-none transition-all disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Claim & Verify Identity'}
          </button>
          
          <div className="text-center">
             <Link to="/" className="text-sm font-medium text-chamber-gold hover:text-chamber-navy">Return to Home</Link>
          </div>
        </form>
      </div>
    </div>
  );
};