import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyOTP } from '../agents/FrontendAgent';
import { Loader2, Key } from 'lucide-react';

export const AdminVerify: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const { verify, loading, error } = useVerifyOTP();

  if (!state) return <div>Invalid Session</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verify(code);
    if (isValid) {
      navigate('/admin/wizard', { state: { chamberId: state.chamberId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-10 shadow-xl rounded-2xl border border-slate-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
               <Key className="h-8 w-8 text-chamber-navy" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Check your inbox</h2>
            <p className="mt-2 text-slate-500">We sent a verification code to <span className="font-semibold text-slate-900">{state.email}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="block w-full text-center tracking-[1em] text-2xl font-bold py-4 border-2 border-slate-200 rounded-xl focus:border-chamber-gold focus:ring-0 outline-none"
              />
            </div>
            {error && <p className="text-center text-sm text-red-600">Incorrect code. Please try again.</p>}
            
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full flex justify-center py-4 px-4 bg-chamber-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Complete Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
