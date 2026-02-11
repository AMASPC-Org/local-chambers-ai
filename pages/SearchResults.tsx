import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Chamber } from '../types';
import { useSearch } from '../src/agents/FrontendAgent';
import { Loader2, MapPin, Tag, LayoutGrid, Map as MapIcon, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { results, loading, search } = useSearch();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    if (query) search(query);
  }, [query, search]);

  // Generate markers for the Static Maps API
  const chambersWithCoords = results.filter(c => c.coordinates);
  const centerChamber = chambersWithCoords[0];
  
  const markersString = chambersWithCoords
    .slice(0, 15) // Limit to avoid URL length issues
    .map((c, i) => {
      const label = (c.org_name?.[0] || 'C').toUpperCase();
      return `markers=color:0xb45309%7Clabel:${label}%7C${c.coordinates!.lat},${c.coordinates!.lng}`;
    })
    .join('&');
  
  // Use the API key from import.meta.env
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const searchMapUrl = centerChamber?.coordinates 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${centerChamber.coordinates.lat},${centerChamber.coordinates.lng}&zoom=11&size=1200x600&scale=2&${markersString}&key=${apiKey}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & View Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">
            Results for <span className="text-chamber-gold">"{query}"</span>
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Found {results.length} regional chambers matching your search.</p>
        </div>

        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-200">
           <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-chamber-navy shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <LayoutGrid className="w-4 h-4" /> Grid
           </button>
           <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-chamber-navy shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <MapIcon className="w-4 h-4" /> Map
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-chamber-gold" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Directory...</p>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[40px] shadow-sm border border-slate-100 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <MapPin className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">No Chambers Found</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">We couldn't find any chambers matching your query in this region.</p>
          <Link to="/" className="inline-flex items-center px-8 py-3 bg-chamber-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
            Return to Search
          </Link>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {viewMode === 'grid' ? (
            <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
              {results.map((chamber) => (
                <div key={chamber.id} className="bg-white rounded-[32px] shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all border border-slate-100 flex flex-col group">
                  <div className="p-8 flex-1">
                    <div className="flex items-center space-x-5 mb-8">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-[20px] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                           <span className="text-chamber-gold font-bold text-2xl">{chamber.org_name?.[0]}</span>
                        </div>
                        {(chamber as any).verificationStatus === 'Verified' && (
                          <div className="absolute -bottom-1 -right-1 bg-chamber-gold text-white p-1 rounded-full border-2 border-white">
                            <ChevronRight className="w-3 h-3 rotate-[-45deg]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-black text-slate-900 group-hover:text-chamber-gold transition-colors leading-tight">{chamber.org_name}</h3>
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1.5">
                          <MapPin className="h-3 w-3 mr-1.5 text-chamber-gold" />
                          {chamber.city}, {chamber.state}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">
                      {chamber.org_type} - {chamber.region}
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {(chamber.services || []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-amber-50 group-hover:text-chamber-gold group-hover:border-amber-100 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <Link 
                      to={`/chamber/${chamber.id}`}
                      className="w-full flex justify-center items-center px-6 py-4 rounded-[20px] shadow-lg shadow-amber-900/5 text-sm font-black uppercase tracking-widest text-white bg-chamber-navy hover:bg-slate-800 transition-all gap-3"
                    >
                      Explore Tiers <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in zoom-in duration-700">
               {/* Search Result Map Container */}
               <div className="relative rounded-[48px] overflow-hidden border-8 border-white shadow-2xl bg-slate-100 group">
                  {searchMapUrl ? (
                    <img 
                      src={searchMapUrl}
                      alt="Regional map overview"
                      className="w-full aspect-[2/1] object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&h=600&q=80`;
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-[2/1] bg-slate-200 flex items-center justify-center">
                      <div className="text-center">
                        <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Map unavailable for these coordinates</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-chamber-navy/10 group-hover:bg-transparent transition-colors duration-700"></div>
                  
                  {/* Floating Link Carousel */}
                  <div className="absolute bottom-8 left-0 right-0 px-8 flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
                     {results.map(c => (
                        <Link 
                          key={c.id} 
                          to={`/chamber/${c.id}`}
                          className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-6 rounded-[28px] shadow-2xl border border-white/40 w-80 hover:scale-105 transition-all transform hover:-translate-y-3 group/card"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black text-chamber-gold bg-amber-50 px-3 py-1 rounded-full uppercase tracking-[0.2em]">{c.region}</span>
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                           </div>
                           <h4 className="font-serif font-black text-slate-900 truncate mb-1 text-lg group-hover/card:text-chamber-gold transition-colors">{c.org_name}</h4>
                           <p className="text-xs text-slate-500 line-clamp-1 font-bold mb-6">{c.address || 'Central Headquarters'}</p>
                           
                           <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-chamber-navy">
                             View Official Profile <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover/card:translate-x-1 transition-transform" />
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
               
               {/* Directory Grid below Map for reference */}
               <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm">
                  <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-8 border-b border-slate-50 gap-4">
                    <div>
                      <h3 className="font-serif font-black text-3xl text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100"><MapIcon className="w-7 h-7 text-chamber-gold" /></div>
                        Location Directory
                      </h3>
                      <p className="text-slate-400 mt-1 font-medium italic">Verified physical entities in the current search radius.</p>
                    </div>
                    <span className="text-xs font-black text-slate-300 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-[0.2em]">{results.length} results indexed</span>
                  </header>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(c => (
                      <Link 
                        key={c.id} 
                        to={`/chamber/${c.id}`}
                        className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 flex items-center justify-between hover:bg-white hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all group/item"
                      >
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-xl text-chamber-gold border border-slate-100 shadow-sm group-hover/item:bg-amber-50 transition-colors">
                              {c.org_name?.[0]}
                           </div>
                           <div className="max-w-[180px]">
                              <p className="font-black text-slate-900 text-sm truncate leading-tight mb-1 group-hover/item:text-chamber-gold transition-colors">{c.org_name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.region}</p>
                           </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover/item:bg-chamber-navy group-hover/item:text-white transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </Link>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};