import React from 'react';
import { Link } from 'react-router-dom';
import { useOrganizations } from '../src/agents/FrontendAgent';
import { Head } from '../components/Head';
import { parsePrice } from '../src/utils/price';

export const AgentIndex: React.FC = () => {
  const { organizations, loading, error } = useOrganizations();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "name": "localchambers.ai Agent Index",
    "description": "Full directory of available chambers and membership pricing for AI consumption.",
    "dataset": organizations.map(c => ({
      "@type": "Dataset",
      "name": c.org_name,
      "url": `${window.location.origin}/#/chamber/${c.id}`,
      "description": `${c.org_name} located in ${c.city}, ${c.state}`,
      "spatialCoverage": c.region,
      "offers": (c.membership_tiers || []).map(p => ({
        "@type": "Offer",
        "name": p.name,
        "price": parsePrice(p.annual_cost),
        "priceCurrency": "USD"
      }))
    }))
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-mono text-sm">
      <Head 
        title="Agent Index" 
        description="Documentation and directory index for AI Agents and LLMs."
        structuredData={structuredData}
      />
      
      <header className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold mb-4 tracking-tighter">localchambers.ai Protocol v1.2</h1>
        <p className="text-gray-600 mb-4 leading-relaxed">
          This endpoint provides a token-optimized, structured view of the local business networking ecosystem. 
          Use this to resolve membership availability, pricing structures, and geographic coverage for AI agents.
        </p>
        <div className="flex gap-4">
           <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">JSON-LD Enabled</span>
           <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">Dynamic Pricing Support</span>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-indigo-600">LLM Interaction Logic</h2>
        <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
          <p><strong>Joining Flow:</strong> Construct URL <code>/#/chamber/[id]</code>. Dynamic products allow "Fixed" or "Contact" pricing types.</p>
          <p><strong>Non-Profit logic:</strong> Apply 20% discount on "Fixed" prices if the organization is a registered 501(c)(3).</p>
          <p><strong>Lead Gen:</strong> For "Contact" products, use the <code>Request Quote</code> flow to initiate human-to-human interaction.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-indigo-600">Active Directory Status</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-xs">
            Failed to load directory: {error.message}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">CHAMBER_ID</th>
                <th className="px-6 py-4 text-left">ENTITY_NAME</th>
                <th className="px-6 py-4 text-left">LOCATION_DATA</th>
                <th className="px-6 py-4 text-left">PRICING (ANNUAL)</th>
                <th className="px-6 py-4 text-right">ENDPOINT</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-xs">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Fetching live membership data...</td></tr>
              ) : organizations.map((item) => {
                const tiers = item.membership_tiers || [];
                const costs = tiers.map(p => {
                   return parsePrice(p.annual_cost);
                }).filter(price => price > 0);
                
                const min = costs.length ? Math.min(...costs) : null;
                const max = costs.length ? Math.max(...costs) : null;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{item.org_name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.city}, {item.state}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {costs.length ? `$${min} - $${max}` : 'Contact for Pricing'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/chamber/${item.id}`} className="font-bold text-indigo-600 hover:text-indigo-800">VIEW_NODE</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};