import React, { useRef } from 'react';
import axios from 'axios';
import { Camera, Image as ImageIcon } from 'lucide-react';

export const JobPhotosPanel = ({ booking, onUpdated }) => {
  const preRef = useRef(null);
  const postRef = useRef(null);
  const prePhotos = booking.jobPhotos?.preService || [];
  const postPhotos = booking.jobPhotos?.postService || [];

  const upload = async (file, stage) => {
    if (!file) return;
    const data = new FormData();
    data.append('photo', file);
    data.append('stage', stage);
    try {
      const res = await axios.post(`/api/bookings/${booking._id}/photos`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success && onUpdated) onUpdated(res.data.booking);
    } catch (err) {
      alert(err.response?.data?.message || 'Photo upload failed');
    }
  };

  const Gallery = ({ photos }) => (
    <div className="flex flex-wrap gap-2">
      {photos.length === 0 && (
        <p className="text-[11px] text-slate-400 font-medium">No photos yet</p>
      )}
      {photos.map((p, idx) => (
        <a key={p.url || idx} href={p.url} target="_blank" rel="noopener noreferrer">
          <img
            src={p.url}
            alt={p.role || 'field'}
            className="w-16 h-16 object-cover rounded-xl border border-slate-200"
          />
        </a>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
        <ImageIcon className="w-3.5 h-3.5" /> Pre / Post Field Condition Photos
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700">Before work</p>
          <Gallery photos={prePhotos} />
          <button
            type="button"
            onClick={() => preRef.current?.click()}
            className="touch-action w-full bg-white border border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Camera className="w-4 h-4" /> Upload pre-work photo
          </button>
          <input
            ref={preRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0], 'pre')}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700">After work</p>
          <Gallery photos={postPhotos} />
          <button
            type="button"
            onClick={() => postRef.current?.click()}
            className="touch-action w-full bg-white border border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Camera className="w-4 h-4" /> Upload post-work photo
          </button>
          <input
            ref={postRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0], 'post')}
          />
        </div>
      </div>
    </div>
  );
};
