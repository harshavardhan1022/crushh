'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  XCircle,
  Trash2,
  Instagram,
  Clock,
  User,
  Heart,
  GraduationCap,
  Calendar,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';
import type { Confession } from '@/types';

interface ConfessionDetailsModalProps {
  confession: Confession | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onOpenInstagramModal: (confession: Confession) => void;
}

export function ConfessionDetailsModal({
  confession,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  onOpenInstagramModal,
}: ConfessionDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !confession) return null;

  const dateObj = confession.created_at ? new Date(confession.created_at) : new Date();
  const isValidDate = !isNaN(dateObj.getTime());
  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown Date';
  const formattedTime = isValidDate
    ? dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onStatusChange(confession.id, 'approved');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onStatusChange(confession.id, 'rejected');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsProcessing(true);
    try {
      await onDelete(confession.id);
      onClose();
    } finally {
      setIsProcessing(false);
      setConfirmDelete(false);
    }
  };

  const isBTech = confession.department === 'B.Tech';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card-strong max-w-2xl w-full p-6 sm:p-8 rounded-3xl space-y-6 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-amore-pink/20 dark:border-amore-lavender/15">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amore-deep-purple/50 dark:text-amore-pink/60">
                CONFESSION REPORT
              </span>
              <h3 className="font-serif text-2xl font-bold text-amore-deep-purple dark:text-white">
                To: {confession.crush_name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-amore-deep-purple dark:text-white" />
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Sender
              </span>
              <span className="font-semibold text-amore-deep-purple dark:text-white">
                {confession.sender_name?.trim() || 'Anonymous'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Department
              </span>
              <span className="font-semibold text-amore-deep-purple dark:text-white">
                {confession.department}
              </span>
            </div>

            {/* Branch Field: Displayed for B.Tech, or shows "Not Applicable" for other departments */}
            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Branch
              </span>
              <span className="font-semibold text-amore-deep-purple dark:text-white">
                {isBTech ? confession.branch || 'Not Specified' : 'Not Applicable'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Academic Year
              </span>
              <span className="font-semibold text-amore-deep-purple dark:text-white">
                {confession.academic_year} Year
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Status
              </span>
              <span
                className={`font-bold capitalize ${
                  confession.status === 'approved'
                    ? 'text-green-500'
                    : confession.status === 'rejected'
                    ? 'text-red-500'
                    : 'text-amber-500'
                }`}
              >
                {confession.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Submitted
              </span>
              <span className="font-semibold text-amore-deep-purple dark:text-white">
                {formattedDate} at {formattedTime}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Instagram Consent
              </span>
              <span
                className={`font-semibold ${
                  confession.publication_consent ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {confession.publication_consent ? 'Granted ✓' : 'Not Granted ✕'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15">
              <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50 block text-[10px] uppercase">
                Instagram Posted
              </span>
              <span className="font-semibold text-amore-deep-purple dark:text-white">
                {confession.instagram_published ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Full Confession Message Box */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-amore-deep-purple/70 dark:text-amore-lavender/70 uppercase tracking-wider">
              Full Confession Message
            </span>
            <div className="p-5 rounded-2xl bg-white/60 dark:bg-amore-dark-bg/60 border border-amore-pink/20 text-sm leading-relaxed whitespace-pre-wrap text-amore-deep-purple dark:text-white max-h-60 overflow-y-auto font-light">
              {confession.confession_message}
            </div>
          </div>

          {/* Confession ID / Meta */}
          <div className="text-[11px] font-mono text-amore-deep-purple/40 dark:text-amore-lavender/40 break-all">
            ID: {confession.id}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-amore-pink/20 dark:border-amore-lavender/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Instagram Story Button */}
              {confession.publication_consent && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenInstagramModal(confession);
                  }}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Story Image</span>
                </button>
              )}

              {/* Status Actions */}
              {confession.status !== 'approved' && (
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              )}

              {confession.status !== 'rejected' && (
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  confirmDelete
                    ? 'bg-red-600 text-white'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? 'Confirm Delete?' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
