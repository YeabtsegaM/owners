'use client';

import React, { useState } from 'react';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  className = "",
  placeholder = "Select date range"
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Set default to last 30 days if no dates are selected
  React.useEffect(() => {
    if (!value.from && !value.to) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      onChange({ from: thirtyDaysAgo, to: today });
    }
  }, [value.from, value.to, onChange]);
  
  console.log('DateRangePicker render - value:', value, 'isOpen:', isOpen); // Debug log

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (type: 'from' | 'to', dateString: string) => {
    console.log(`Date change - ${type}:`, dateString); // Debug log
    const date = dateString ? new Date(dateString) : null;
    
    if (type === 'from') {
      onChange({ ...value, from: date });
    } else {
      onChange({ ...value, to: date });
    }
  };

  const clearDates = () => {
    onChange({ from: null, to: null });
  };

  const setQuickRange = (range: 'today' | '7days' | '30days' | '90days') => {
    const today = new Date();
    let from = new Date();
    
    switch (range) {
      case 'today':
        from = today;
        break;
      case '7days':
        from.setDate(today.getDate() - 7);
        break;
      case '30days':
        from.setDate(today.getDate() - 30);
        break;
      case '90days':
        from.setDate(today.getDate() - 90);
        break;
    }
    
    onChange({ from, to: today });
    setIsOpen(false);
  };

  const displayText = value.from && value.to 
    ? `${formatDate(value.from)} - ${formatDate(value.to)}`
    : placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-left cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className={value.from && value.to ? 'text-gray-900' : 'text-gray-500'}>
            {displayText}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
            {/* Quick Selection Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickRange('today')}
                  className="px-3 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRange('7days')}
                  className="px-3 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRange('30days')}
                  className="px-3 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRange('90days')}
                  className="px-3 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Last 90 Days
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={value.from ? value.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white min-h-[40px]"
                  placeholder="mm/dd/yyyy"
                  style={{ minHeight: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={value.to ? value.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white min-h-[40px]"
                  placeholder="mm/dd/yyyy"
                  style={{ minHeight: '40px' }}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={clearDates}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Apply
              </button>
            </div>
          </div>
          
          {/* Overlay to close when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}
