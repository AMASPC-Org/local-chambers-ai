import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle2, Building2, MapPin, ArrowLeft } from 'lucide-react';
import { useSearch } from '../src/agents/FrontendAgent';
import { Chamber } from '../types';
import { Head } from '../components/Head';

export const GetStarted: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [query, setQuery] = useState('');
  const { results, loading, search } = useSearch();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await search(query);
    setStep(2);
  };

  const resetSearch = () => {
    setStep(1);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Join a Local Chamber of Commerce",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Find your local chamber",
        "text": "Search by city or region to find the chamber that represents your business area."
      },
      {
        "@type": "HowToStep",
        "name": "Select a membership tier",
        "text": "Choose between Bronze, Silver, or Gold tiers based on your business needs."
      },
      {
        "@type": "HowToStep",
        "name": "Receive provisional access",
        "text": "Pay via card for instant provisional access while board approval is pending."
      }
    ]
  };

  return (
    <div className="bg-chamber-light min-h-screen">
      <Head 
        title="Get Started - Join Your Local Chamber" 
        description="Start your membership application. Find your local chamber and get provisional access today."
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <div className="bg-chamber-navy pb-32 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-serif font-bold text-white sm:text-5xl">
            Let's find your <span className="text-chamber-gold">community.</span>
          </h1>
          <p className="mt-4 text-xl text-slate-300 max-w-2xl">
            Membership is local. Search for your city or region to connect with the specific chamber that serves your business.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 mb-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
          
          {/* Progress Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 1 ? 'bg-chamber-navy text-white' : 'bg-green-100 text-green-700'}`}>
                {step === 1 ? '1' : <CheckCircle2 className="w-5 h-5"/>}
              </span>
              <span className={`text-sm font-medium ${step === 1 ? 'text-chamber-navy' : 'text-slate-500'}`}>Find Location</span>
            </div>
            <div className="h-px bg-slate-200 flex-grow mx-4 max-w-[100px]"></div>
            <div className="flex items-center space-x-2">
              <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 2 ? 'bg-chamber-navy text-white' : 'bg-slate-100 text-slate-400'}`}>
                2
              </span>
              <span className={`text-sm font-medium ${step === 2 ? 'text-chamber-navy' : 'text-slate-400'}`}>Select Chamber</span>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label htmlFor="onboarding-search" className="block text-2xl font-serif font-bold text-slate-800 mb-6 text-center">
                  Where is your business located?
                </label>
                
                <form onSubmit={handleSearch} className="max-w-lg mx-auto">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-6 w-6 text-slate-400 group-focus-within:text-chamber-gold transition-colors" />
                    </div>
                    <input
                      id="onboarding-search"
                      type="text"
                      className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-lg text-lg placeholder-slate-400 focus:border-chamber-gold focus:ring-0 transition-colors outline-none"
                      placeholder="e.g. Austin, Seattle, Miami..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!query.trim() || loading}
                    className="mt-6 w-full flex items-center justify-center bg-chamber-navy text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-indigo-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">Searching...</span>
                    ) : (
                      <span className="flex items-center">
                        Continue <ArrowRight className="ml-2 w-5 h-5" />
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Local Directory</h3>
                    <p className="text-sm text-slate-500 mt-1">Get listed immediately</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Instant Status</h3>
                    <p className="text-sm text-slate-500 mt-1">Provisional access on sign up</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800">AI Discoverable</h3>
                    <p className="text-sm text-slate-500 mt-1">Optimized for agents</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button 
                  onClick={resetSearch}
                  className="mb-6 flex items-center text-sm text-slate-500 hover:text-chamber-navy transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
                </button>

                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                  We found {results.length} chambers near "{query}"
                </h2>
                <p className="text-slate-500 mb-8">Select the chamber you wish to join.</p>

                {results.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-600 mb-4">No specific chambers found for this query.</p>
                    <button 
                      onClick={resetSearch}
                      className="text-chamber-gold font-medium hover:underline"
                    >
                      Try a broader search term
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {results.map((chamber) => (
                      <div 
                        key={chamber.id} 
                        className="group relative bg-white border border-slate-200 rounded-lg p-6 hover:border-chamber-gold hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        onClick={() => navigate(`/chamber/${chamber.id}`)}
                      >
                        <div className="flex items-start space-x-4">
                          <img 
                            src={chamber.logoUrl} 
                            alt={chamber.name} 
                            className="h-16 w-16 rounded-lg bg-slate-100 object-cover" 
                          />
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-chamber-navy transition-colors">
                              {chamber.name}
                            </h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {chamber.region}
                            </div>
                            <p className="text-sm text-slate-600 mt-2 line-clamp-1">
                              {chamber.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button className="w-full sm:w-auto px-6 py-2 bg-slate-50 text-chamber-navy border border-slate-200 rounded-md font-medium text-sm group-hover:bg-chamber-navy group-hover:text-white group-hover:border-transparent transition-colors">
                            Select This Chamber
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};