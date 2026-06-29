'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) {
    // If there are items but only 1 page, we still want to show the limit selector if onLimitChange is provided
    if (totalItems > 0 && onLimitChange) {
      const startItem = 1;
      const endItem = totalItems;
      return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/60 bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Tampilkan</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-semibold text-charcoal shadow-sm transition"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>data per halaman</span>
          </div>
          <div className="text-xs text-gray-500 font-semibold">
            Menampilkan <span className="text-charcoal">{startItem}</span> - <span className="text-charcoal">{endItem}</span> dari <span className="text-charcoal">{totalItems}</span> data
          </div>
        </div>
      );
    }
    return null;
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5;

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/60 bg-white shrink-0">
      
      {/* Limit Selector */}
      {onLimitChange ? (
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium order-2 sm:order-1">
          <span>Tampilkan</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-semibold text-charcoal shadow-sm transition"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>data per halaman</span>
        </div>
      ) : (
        <div className="order-2 sm:order-1" />
      )}

      {/* Info Label */}
      <div className="text-xs text-gray-500 font-medium order-1 sm:order-2">
        Menampilkan <span className="text-charcoal font-bold">{startItem}</span> -{' '}
        <span className="text-charcoal font-bold">{endItem}</span> dari{' '}
        <span className="text-charcoal font-bold">{totalItems}</span> data
      </div>

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 order-3">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 bg-white rounded-xl text-gray-500 hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:border-slate-200 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipses-${idx}`}
                className="px-3 py-1.5 text-xs text-gray-400 font-medium select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(Number(page))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                isCurrent
                  ? 'bg-primary text-white border border-primary shadow-primary/20'
                  : 'bg-white text-charcoal border border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-slate-200 bg-white rounded-xl text-gray-500 hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:border-slate-200 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          aria-label="Halaman selanjutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
