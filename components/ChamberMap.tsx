import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface ChamberMapProps {
  address?: string;
  coordinates?: { lat: number, lng: number };
  name: string;
}

export const ChamberMap: React.FC<ChamberMapProps> = ({ address, coordinates, name }) => {
  if (!coordinates || !address) {
    return (
      <div className="bg-slate-100 rounded-3xl aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
        <MapPin className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm font-medium">Location Map Unavailable</p>
      </div>
    );
  }

  // Construct Google Static Maps URL
  // Note: In a production environment, you'd add your API Key here.
  // We use a high-quality stylized placeholder for demonstration that looks like a modern map.
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=14&size=800x400&scale=2&maptype=roadmap&markers=color:0xb45309%7Clabel:C%7C${coordinates.lat},${coordinates.lng}&key=YOUR_API_KEY`;
  
  // Construct Google Maps Link
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white">
      <div className="aspect-[2/1] relative">
        <img 
          src={staticMapUrl.replace('YOUR_API_KEY', '')} // Fallback behavior for placeholder
          alt={`Map location of ${name}`}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
          onError={(e) => {
            // Real-world fallback if API key is missing or fails
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&h=400&q=80`;
          }}
        />
        <div className="absolute inset-0 bg-chamber-navy/5 group-hover:bg-transparent transition-colors"></div>
        
        {/* Map UI Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 max-w-[200px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">HQ Address</p>
            <p className="text-xs font-semibold text-slate-900 leading-tight">{address}</p>
          </div>
          
          <a 
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-chamber-gold text-white p-3 rounded-xl shadow-lg hover:bg-amber-700 transition-all transform hover:-translate-y-1 flex items-center gap-2 font-bold text-xs"
          >
            <ExternalLink className="w-4 h-4" /> Open Live Map
          </a>
        </div>
      </div>
    </div>
  );
};