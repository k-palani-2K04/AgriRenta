import React from 'react';

export const MarketplaceSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="h-48 bg-slate-200 animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
          <div className="h-8 bg-slate-100 rounded-xl w-full animate-pulse" />
          <div className="h-12 bg-slate-200 rounded-2xl w-full animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export const BookingListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-12 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    ))}
  </div>
);
