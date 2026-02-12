import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChamberProducts } from '../agents/FrontendAgent';
import { ChamberProduct } from '../types';
import { Loader2, Plus, Trash2, Save, ChevronLeft, LayoutGrid, Info, Check } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { chamber, products, setProducts, loading, saving, save, remove } = useChamberProducts(state?.chamberId);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddProduct = () => {
    const newProduct: ChamberProduct = {
      id: 'temp_' + Date.now(),
      chamberId: state.chamberId,
      name: 'New Membership Tier',
      description: 'Describe what this tier offers...',
      pricingType: 'Fixed',
      price: 500,
      benefits: ['Directory Listing']
    };
    setProducts([...products, newProduct]);
    setEditingId(newProduct.id);
  };

  const handleSave = async (product: ChamberProduct) => {
    await save(product);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tier?')) return;
    await remove(id);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-chamber-gold" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Partial reuse) */}
      <aside className="w-64 bg-chamber-navy text-white hidden lg:flex flex-col">
        <div className="p-8">
           <button onClick={() => navigate('/admin/dashboard', { state: { chamberId: state.chamberId } })} className="flex items-center text-slate-400 hover:text-white mb-10 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
           </button>
           <nav className="space-y-4">
             <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-chamber-gold text-white font-bold">
               <LayoutGrid className="w-5 h-5"/>
               <span className="text-sm">Membership Tiers</span>
             </div>
           </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 sm:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Dynamic Product Builder</h1>
            <p className="text-slate-500">Design custom membership levels for your chamber.</p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="flex items-center px-6 py-3 bg-chamber-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Tier
          </button>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {products.map((product) => (
            <div key={product.id} className={`bg-white rounded-2xl shadow-sm border p-8 transition-all ${editingId === product.id ? 'border-chamber-gold ring-2 ring-amber-50' : 'border-slate-200'}`}>
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tier Name</label>
                      <input 
                        value={product.name}
                        onChange={(e) => setProducts(products.map(p => p.id === product.id ? { ...p, name: e.target.value } : p))}
                        className="w-full text-xl font-bold text-slate-900 bg-slate-50 border-none rounded-lg p-3 focus:ring-1 focus:ring-chamber-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pricing Type</label>
                      <select
                        value={product.pricingType}
                        onChange={(e) => setProducts(products.map(p => p.id === product.id ? { ...p, pricingType: e.target.value as any } : p))}
                        className="w-full text-sm font-bold text-slate-700 bg-slate-50 border-none rounded-lg p-3.5 focus:ring-1 focus:ring-chamber-gold outline-none"
                      >
                        <option value="Fixed">Fixed Annual Price</option>
                        <option value="Contact">Call for Quote / Custom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                      value={product.description}
                      onChange={(e) => setProducts(products.map(p => p.id === product.id ? { ...p, description: e.target.value } : p))}
                      className="w-full text-slate-600 bg-slate-50 border-none rounded-lg p-3 focus:ring-1 focus:ring-chamber-gold outline-none resize-none h-24"
                    />
                  </div>

                  {product.pricingType === 'Fixed' && (
                    <div className="w-48">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price (Annual)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                        <input 
                          type="number"
                          value={product.price}
                          onChange={(e) => setProducts(products.map(p => p.id === product.id ? { ...p, price: parseInt(e.target.value) || 0 } : p))}
                          className="w-full pl-8 pr-3 py-3 font-bold text-slate-900 bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-chamber-gold outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:w-80 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Benefits & Features</label>
                    <div className="space-y-2">
                      {product.benefits.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input 
                            value={b}
                            onChange={(e) => {
                              const newBenefits = [...product.benefits];
                              newBenefits[bIdx] = e.target.value;
                              setProducts(products.map(p => p.id === product.id ? { ...p, benefits: newBenefits } : p));
                            }}
                            className="flex-1 text-sm bg-slate-50 border-none rounded-lg p-2 focus:ring-1 focus:ring-chamber-gold outline-none"
                          />
                          <button 
                            onClick={() => {
                              const newBenefits = product.benefits.filter((_, i) => i !== bIdx);
                              setProducts(products.map(p => p.id === product.id ? { ...p, benefits: newBenefits } : p));
                            }}
                            className="text-slate-300 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          setProducts(products.map(p => p.id === product.id ? { ...p, benefits: [...p.benefits, 'New Benefit'] } : p));
                        }}
                        className="w-full py-2 text-xs font-bold text-chamber-gold border border-dashed border-chamber-gold rounded-lg hover:bg-amber-50 transition-colors"
                      >
                        + Add Benefit
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <button 
                      onClick={() => handleSave(product)}
                      disabled={saving}
                      className="flex-1 flex justify-center items-center py-3 bg-chamber-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md disabled:bg-slate-300"
                    >
                      {saving && editingId === product.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                      {saving && editingId === product.id ? 'Saving...' : 'Save Tier'}
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
               <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500">No membership tiers created yet.</p>
               <button onClick={handleAddProduct} className="mt-4 text-chamber-gold font-bold hover:underline">Create your first product</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
