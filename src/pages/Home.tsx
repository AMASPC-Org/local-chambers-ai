import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Head } from '../components/Head';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { Chamber } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { query, setQuery, suggestions, isLoading, clearSuggestions } = useAutocomplete();
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show dropdown when suggestions arrive
  useEffect(() => {
    setShowDropdown(suggestions.length > 0);
    setHighlightIndex(-1);
  }, [suggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectChamber = useCallback((chamber: Chamber) => {
    clearSuggestions();
    setShowDropdown(false);
    navigate(`/chamber/${chamber.id}`);
  }, [navigate, clearSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
      handleSelectChamber(suggestions[highlightIndex]);
    } else if (query.trim()) {
      setShowDropdown(false);
      clearSuggestions();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const getInitial = (name: string) => (name?.[0] || '?').toUpperCase();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "localchambers.ai",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${window.location.origin}/#/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "description": "The central hub for finding and joining local chambers of commerce with provisional access."
  };

  return (
    <div className="relative bg-white overflow-hidden">
      <Head
        title="Find & Join Chambers"
        description="Search local chambers of commerce, compare pricing tiers, and join instantly for business networking."
        structuredData={structuredData}
      />

      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-10 sm:pt-20 px-4 sm:px-6 lg:px-8">

          <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-chamber-navy mb-6 border border-blue-100">
                <span className="w-2 h-2 bg-chamber-gold rounded-full mr-2"></span>
                Connecting 50,000+ Businesses
              </span>

              <h1 className="text-4xl tracking-tight font-extrabold text-chamber-navy sm:text-5xl md:text-6xl font-serif">
                <span className="block xl:inline">Grow your business</span>
                <span className="block text-chamber-gold">with local power.</span>
              </h1>

              <p className="mt-4 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-sans leading-relaxed">
                Stop cold calling. Start connecting. Find, compare, and join vetted Chambers of Commerce to unlock instant networking, advocacy, and local prestige.
              </p>

              <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
                <div className="relative w-full max-w-lg">
                  <form onSubmit={handleSearch} className="relative shadow-2xl rounded-lg">
                    <div className="flex bg-white rounded-lg p-1.5 border border-slate-200">
                      <div className="flex-grow flex items-center pl-3">
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 text-chamber-gold animate-spin" />
                        ) : (
                          <Search className="h-5 w-5 text-slate-400" />
                        )}
                        <input
                          ref={inputRef}
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                          className="w-full border-none focus:ring-0 text-slate-900 placeholder-slate-400 ml-2 h-10 outline-none"
                          placeholder="Try 'Austin' or 'Manufacturing'..."
                          role="combobox"
                          aria-expanded={showDropdown}
                          aria-autocomplete="list"
                          aria-activedescendant={highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined}
                          aria-controls="home-search-results"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-chamber-navy text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition"
                      >
                        Find Chambers
                      </button>
                    </div>
                  </form>

                  {/* Autocomplete dropdown */}
                  {showDropdown && suggestions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-72 overflow-y-auto"
                      style={{ animation: 'fadeIn 0.15s ease-out' }}
                      role="listbox"
                      id="home-search-results"
                    >
                      {suggestions.map((chamber, index) => (
                        <button
                          key={chamber.id}
                          id={`suggestion-${index}`}
                          role="option"
                          aria-selected={index === highlightIndex}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${index === highlightIndex
                            ? 'bg-blue-50 text-chamber-navy'
                            : 'hover:bg-slate-50 text-slate-700'
                            } ${index < suggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
                          onClick={() => handleSelectChamber(chamber)}
                          onMouseMove={() => highlightIndex !== index && setHighlightIndex(index)}
                        >
                          {/* First-letter avatar */}
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-chamber-navy text-white flex items-center justify-center text-sm font-bold font-serif">
                            {getInitial(chamber.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{chamber.name}</div>
                            <div className="text-xs text-slate-400 truncate">
                              {[chamber.city, chamber.state, chamber.region].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500 font-medium items-center">
                <span>Popular:</span>
                <button onClick={() => navigate('/search?q=Restaurants')} className="hover:text-chamber-gold underline decoration-slate-300 underline-offset-4">Restaurants</button>
                <button onClick={() => navigate('/search?q=Real Estate')} className="hover:text-chamber-gold underline decoration-slate-300 underline-offset-4">Real Estate</button>
                <button onClick={() => navigate('/search?q=Non-Profits')} className="hover:text-chamber-gold underline decoration-slate-300 underline-offset-4">Non-Profits</button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80"
          alt="People networking at a business event"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent lg:via-white/50"></div>
      </div>

      <div className="bg-slate-50 border-y border-slate-200 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Trusted by members of</p>
          <div className="flex justify-center gap-8 opacity-40 grayscale">
            <div className="h-8 w-24 bg-slate-300 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-slate-300 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-slate-300 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-slate-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Dropdown fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
