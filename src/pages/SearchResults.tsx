import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useChambers } from '../hooks/useChambers';
import {
  MapPin,
  Search,
  Filter,
  Grid,
  Map as MapIcon,
  ChevronRight,
  Star,
  ArrowLeft,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { PREMIUM_MAP_STYLE } from '../constants/MapThemes';
import { Chamber } from '../types';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const region = searchParams.get('region') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);

  const { data: results = [], isLoading } = useChambers(query, { region });

  const map = useMap();

  // Auto-fit map to markers when results change or view mode switches to map
  useEffect(() => {
    if (!map || results.length === 0 || viewMode !== 'map') return;

    const bounds = new google.maps.LatLngBounds();
    let hasCoords = false;

    results.forEach(c => {
      if (c.coordinates) {
        bounds.extend(c.coordinates);
        hasCoords = true;
      }
    });

    if (hasCoords) {
      map.fitBounds(bounds, { padding: 80 });
    }
  }, [map, results, viewMode]);

  const handleBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-chamber-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              {query || region || 'Washington Chambers'}
            </h1>
            <p className="mt-4 text-slate-500 font-medium flex items-center gap-2">
              <span className="bg-chamber-gold/10 text-chamber-gold px-3 py-1 rounded-full text-xs font-bold">
                {results.length} results
              </span>
              found for your search criteria
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'grid'
                  ? 'bg-chamber-navy text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <Grid className="w-4 h-4" /> Cards
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'map'
                  ? 'bg-chamber-navy text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <MapIcon className="w-4 h-4" /> Map View
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {results.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-slate-100 italic font-medium text-slate-400">
              No chambers found matching your search. Try a broader term.
            </div>
          ) : (
            <>
              {/* Map View */}
              {viewMode === 'map' && (
                <div className="relative h-[700px] rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl bg-white mb-12">
                  <Map
                    defaultCenter={{ lat: 47.6062, lng: -122.3321 }}
                    defaultZoom={11}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    mapTypeControl={true}
                    className="w-full h-full"
                    styles={PREMIUM_MAP_STYLE}
                  >
                    {results.filter(c => c.coordinates).map((chamber) => (
                      <Marker
                        key={chamber.id}
                        position={chamber.coordinates!}
                        onClick={() => setSelectedChamber(chamber)}
                      />
                    ))}

                    {selectedChamber && selectedChamber.coordinates && (
                      <InfoWindow
                        position={selectedChamber.coordinates}
                        onCloseClick={() => setSelectedChamber(null)}
                      >
                        <div className="p-2 min-w-[240px]">
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-chamber-gold fill-chamber-gold" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Member</span>
                          </div>
                          <h3 className="font-black text-slate-900 text-lg leading-tight mb-2">{selectedChamber.org_name}</h3>
                          <div className="flex items-center gap-2 text-slate-500 mb-4">
                            <MapPin className="w-3.5 h-3.5 text-chamber-gold" />
                            <span className="text-xs font-bold">{selectedChamber.city}, {selectedChamber.state}</span>
                          </div>
                          <button
                            onClick={() => navigate(`/chamber/${selectedChamber.id}`)}
                            className="w-full py-3 bg-chamber-gold text-white rounded-2xl text-xs font-black shadow-lg shadow-chamber-gold/20 hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                          >
                            Explore Profile <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>

                  {/* Context Overlay */}
                  <div className="absolute top-8 left-8 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/20 inline-flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-chamber-gold">
                        <Navigation className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Regional Hubs</span>
                      </div>
                      <p className="text-2xl font-black text-slate-900 leading-tight">
                        {query || region || 'Washington State'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Layout (Visible in both or just grid, here we show grid below map optionally or just cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((chamber) => (
                  <div
                    key={chamber.id}
                    onClick={() => navigate(`/chamber/${chamber.id}`)}
                    className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-slate-100 transition-all duration-500 cursor-pointer flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center p-3 group-hover:bg-chamber-gold/10 transition-colors">
                        <Star className="w-8 h-8 text-slate-200 group-hover:text-chamber-gold transition-all duration-500 group-hover:scale-110" />
                      </div>
                      <div className="bg-slate-50 px-4 py-2 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-chamber-gold group-hover:text-white transition-all duration-500">
                        {chamber.region || 'Regional'}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-700 transition-colors duration-500 leading-tight mb-4">
                      {chamber.org_name}
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <MapPin className="w-4 h-4 group-hover:text-chamber-gold transition-colors" />
                        </div>
                        <span className="text-sm font-bold truncate">{chamber.city}, {chamber.state}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(chamber.services || []).slice(0, 3).map((service, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 group-hover:bg-slate-100 transition-colors">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Partner</span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-chamber-navy text-white flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
