import React from 'react';
import { SearchIcon, XIcon } from './Icons';

interface TabSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

const TabSearch: React.FC<TabSearchProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search cases...",
  resultCount,
  totalCount
}) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="mb-4 px-4">
      <div className="relative">
        {/* Search Input */}
        <div className="relative flex items-center">
          <SearchIcon 
            className="absolute left-3 text-gray-400" 
            width={20} 
            height={20} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <XIcon width={16} height={16} />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              {resultCount !== undefined && totalCount !== undefined ? (
                <>
                  {resultCount === 0 ? (
                    <span className="text-red-400">No results found</span>
                  ) : (
                    <span>
                      Showing {resultCount} of {totalCount} cases
                    </span>
                  )}
                </>
              ) : null}
            </div>
            
            {searchQuery && (
              <div className="text-xs text-gray-500">
                Search active: "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Tips */}
      {searchQuery && resultCount === 0 && (
        <div className="mt-3 p-3 bg-gray-800/30 border border-gray-600 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Search Tips:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Try searching by case ID (e.g., "CASE-001")</li>
            <li>• Search by customer name (e.g., "Priya Sharma")</li>
            <li>• Search by address or location (e.g., "Mumbai", "Marine Drive")</li>
            <li>• Search by bank name (e.g., "HDFC", "ICICI")</li>
            <li>• Search by verification type (e.g., "Residence", "Office")</li>
            <li>• Search is case-insensitive</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TabSearch;
