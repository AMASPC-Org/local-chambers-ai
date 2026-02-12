import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminMembers } from '../agents/FrontendAgent';
import { Loader2, Users, CreditCard, TrendingUp, Search, CheckCircle, ExternalLink, ShieldCheck, UserCheck, Mail, LayoutGrid } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { chamber, members, loading, approve, processingId } = useAdminMembers(state?.chamberId);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    const member = members.find(m => m.id === id);
    await approve(id);
    
    // Show success notification
    setShowNotification(`${member?.companyName} approved & welcome email sent.`);
    setTimeout(() => setShowNotification(null), 4000);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-chamber-gold" /></div>;

  const activeMembersCount = members.filter(m => m.status === 'Active').length;
  const pendingMembersCount = members.filter(m => m.status !== 'Active').length;

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
          <div className="bg-white border border-green-200 shadow-2xl rounded-xl p-4 flex items-center gap-3 pr-8">
            <div className="bg-green-100 p-2 rounded-full">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Action Successful</p>
              <p className="text-xs text-slate-500">{showNotification}</p>
            </div>
            <button onClick={() => setShowNotification(null)} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500">&times;</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-chamber-navy text-white hidden lg:flex flex-col">
        <div className="p-8">
           <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-chamber-gold rounded flex items-center justify-center text-xs font-bold">LC</div>
              <span className="font-serif font-bold text-lg">localchambers<span className="text-chamber-gold">.ai</span></span>
           </div>
           <nav className="space-y-4">
             <SidebarItem icon={<TrendingUp className="w-5 h-5"/>} label="Dashboard" active />
             <SidebarItem 
              icon={<LayoutGrid className="w-5 h-5"/>} 
              label="Membership Builder" 
              onClick={() => navigate('/admin/products', { state: { chamberId: state.chamberId } })}
             />
             <SidebarItem icon={<Users className="w-5 h-5"/>} label="Members" />
             <SidebarItem icon={<CreditCard className="w-5 h-5"/>} label="Payouts" />
             <div className="pt-10">
               <SidebarItem icon={<ExternalLink className="w-5 h-5"/>} label="View Profile" />
             </div>
           </nav>
        </div>
        <div className="mt-auto p-8">
           <div className="bg-slate-800 rounded-xl p-4">
             <div className="flex items-center gap-2 text-xs font-bold text-chamber-gold mb-1 uppercase tracking-widest">Support</div>
             <p className="text-xs text-slate-400">Need help with your listing? Talk to an expert.</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 sm:p-12 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
           <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">Welcome, {chamber?.name}</h1>
              <p className="text-slate-500">Here's what's happening today at your chamber.</p>
           </div>
           <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">Settings</button>
              <button 
                onClick={() => navigate('/admin/products', { state: { chamberId: state.chamberId } })}
                className="px-4 py-2 bg-chamber-gold text-white rounded-lg text-sm font-bold shadow-md shadow-amber-900/10 hover:bg-amber-700"
              >
                Build Tiers
              </button>
           </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <StatCard label="Active Members" value={activeMembersCount} icon={<UserCheck className="text-green-600"/>} />
           <StatCard label="Pending Approvals" value={pendingMembersCount} icon={<Users className="text-indigo-600"/>} />
           <StatCard label="Monthly Recurring" value="$4,250" icon={<TrendingUp className="text-blue-600"/>} />
           <StatCard label="Stripe Status" value={chamber?.stripeConnected ? 'Connected' : 'Pending'} icon={<CreditCard className="text-amber-600"/>} />
        </div>

        {/* Membership Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-chamber-navy" /> Member Verification Queue
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search members..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-chamber-gold outline-none" />
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                 <tr>
                   <th className="px-6 py-4">Company</th>
                   <th className="px-6 py-4">Contact</th>
                   <th className="px-6 py-4">Tier</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Joined</th>
                   <th className="px-6 py-4 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                 {members.map(m => (
                   <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-6 py-4 font-bold text-slate-900">{m.companyName}</td>
                     <td className="px-6 py-4 text-slate-500">{m.email}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${m.tier === 'Gold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                         {m.tier}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 font-medium ${m.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-green-600' : 'bg-amber-600 animate-pulse'}`} />
                           {m.status.replace('_', ' ')}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-slate-400">{m.joinedDate}</td>
                     <td className="px-6 py-4 text-right">
                       {m.status === 'Active' ? (
                          <div className="flex items-center justify-end text-green-600 gap-1 font-bold text-xs"><CheckCircle className="w-4 h-4" /> Approved</div>
                       ) : (
                          <button 
                            onClick={() => handleApprove(m.id)}
                            disabled={processingId === m.id}
                            className="bg-chamber-navy text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:bg-slate-300"
                          >
                            {processingId === m.id ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin w-3 h-3" />
                                <span>Processing...</span>
                              </div>
                            ) : 'Approve & Send Welcome'}
                          </button>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {!chamber?.stripeConnected && (
           <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                 <CreditCard className="w-8 h-8" />
              </div>
              <div className="flex-1">
                 <h3 className="text-lg font-bold text-amber-900 mb-1">Set up automated payouts</h3>
                 <p className="text-amber-700 text-sm">Connect your Stripe account to receive membership fees directly. We take 0% of transaction fees.</p>
              </div>
              <button className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/20 whitespace-nowrap">
                 Connect Stripe Account
              </button>
           </div>
        )}
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-chamber-gold text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
     <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
     </div>
     <div className="text-3xl font-bold text-slate-900">{value}</div>
  </div>
);
