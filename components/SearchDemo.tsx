import React, { useState } from 'react';
import { SearchIcon, InfoIcon } from './Icons';

const SearchDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const searchExamples = [
    { query: 'CASE-001', description: 'Search by Case ID' },
    { query: 'Priya Sharma', description: 'Search by Customer Name' },
    { query: 'Mumbai', description: 'Search by Location/Address' },
    { query: 'HDFC', description: 'Search by Bank Name' },
    { query: 'Residence', description: 'Search by Verification Type' },
    { query: 'Personal Loan', description: 'Search by Product Type' },
    { query: 'Marine Drive', description: 'Search by Specific Address' },
    { query: 'priya.sharma@email.com', description: 'Search by Contact Email' }
  ];

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-brand-primary hover:bg-brand-secondary text-white p-3 rounded-full shadow-lg transition-colors"
          title="Search Demo"
        >
          <SearchIcon width={24} height={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SearchIcon width={24} height={24} className="text-brand-primary" />
              <h3 className="text-xl font-semibold text-white">Search Demo</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <InfoIcon width={20} height={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Tab-Specific Search</p>
                <p>Each tab (Assigned, In Progress, Complete, Saved) has its own independent search that only searches within that tab's data.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Try These Search Examples:</h4>
            
            <div className="space-y-2">
              {searchExamples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <code className="text-brand-primary font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                        {example.query}
                      </code>
                      <p className="text-gray-400 text-xs mt-1">{example.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-800/30 border border-gray-600 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-2">Search Features:</h5>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Real-time filtering as you type</li>
              <li>• Case-insensitive search</li>
              <li>• Search across multiple fields (ID, name, address, bank, etc.)</li>
              <li>• Each tab maintains its own search state</li>
              <li>• Clear search with X button</li>
              <li>• Shows result count and "No results" message</li>
              <li>• Search tips when no results found</li>
            </ul>
          </div>

          <div className="mt-6">
            <h5 className="text-sm font-medium text-white mb-2">How to Test:</h5>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. Navigate to any tab (Assigned, In Progress, Complete, Saved)</li>
              <li>2. Use the search input at the top of the tab</li>
              <li>3. Try different search terms from the examples above</li>
              <li>4. Switch between tabs to see independent search states</li>
              <li>5. Clear search to see all cases in that tab</li>
            </ol>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsVisible(false)}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;
