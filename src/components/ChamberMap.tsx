import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Map, Marker, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { PREMIUM_MAP_STYLE } from '../constants/MapThemes';

interface ChamberMapProps {
  address: string;
  coordinates?: { lat: number; lng: number };
  name: string;
}

export const ChamberMap: React.FC<ChamberMapProps> = ({ address, coordinates, name }) => {
  const apiIsLoaded = useApiIsLoaded();

  if (!coordinates || !address) {
    return (
      <div className="bg-slate-100 rounded-3xl aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
        <MapPin className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm font-medium">Location Map Unavailable</p>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`;

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-slate-200 shadow-lg bg-slate-50 aspect-video">
      {!apiIsLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-chamber-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Map
        defaultCenter={coordinates}
        defaultZoom={15}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        mapTypeControl={true}
        streetViewControl={true}
        fullscreenControl={false}
        className="w-full h-full"
        styles={PREMIUM_MAP_STYLE}
      >
        <Marker
          position={coordinates}
          title={name}
        />
      </Map>

      {/* Premium UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/20 inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-chamber-gold/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-chamber-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{address}</p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/20 pointer-events-auto hover:bg-white transition-colors group/link"
        >
          <ExternalLink className="w-5 h-5 text-slate-400 group-hover/link:text-chamber-gold transition-colors" />
        </a>
      </div>
    </div>
  );
};