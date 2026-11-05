'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Instagram, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { Confession } from '@/types';

interface InstagramStoryModalProps {
  confession: Confession | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkPublished: (id: string) => Promise<void>;
}

export function InstagramStoryModal({
  confession,
  isOpen,
  onClose,
  onMarkPublished,
}: InstagramStoryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !confession) return null;

  const senderDisplay = confession.sender_name?.trim() || 'Anonymous';
  const hasConsent = confession.publication_consent;

  // Render high-res 1080x1920 Instagram Story on canvas and download
  const handleDownload = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      // 1. Background gradient (#151022 -> #321442 -> #151022)
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#151022');
      grad.addColorStop(0.3, '#2a1238');
      grad.addColorStop(0.6, '#38164b');
      grad.addColorStop(1, '#151022');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Ambient radial glow circles
      const glow1 = ctx.createRadialGradient(250, 300, 50, 250, 300, 600);
      glow1.addColorStop(0, 'rgba(247, 182, 210, 0.18)');
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1080, 1920);

      const glow2 = ctx.createRadialGradient(850, 1500, 50, 850, 1500, 650);
      glow2.addColorStop(0, 'rgba(217, 200, 242, 0.14)');
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1080, 1920);

      // 3. Top Branding
      ctx.fillStyle = 'rgba(247, 182, 210, 0.7)';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '8px';
      ctx.fillText('✦ ANONYMOUS CONFESSION ✦', 540, 220);

      ctx.fillStyle = '#F7B6D2';
      ctx.font = 'bold 88px Georgia, serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('Confessions', 540, 320);

      // Decorative divider
      const lineGrad = ctx.createLinearGradient(340, 0, 740, 0);
      lineGrad.addColorStop(0, 'transparent');
      lineGrad.addColorStop(0.5, '#F7B6D2');
      lineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(340, 360);
      ctx.lineTo(740, 360);
      ctx.stroke();

      // 4. Center Glass Card
      const cardX = 90;
      const cardY = 440;
      const cardW = 900;
      const cardH = 1100;
      const radius = 48;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(247, 182, 210, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 5. Card Header ("Dear Crush")
      ctx.fillStyle = 'rgba(247, 182, 210, 0.7)';
      ctx.font = '28px sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('DEAR', 540, 540);

      ctx.fillStyle = '#F7B6D2';
      ctx.font = 'bold 64px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(confession.crush_name, 540, 620);

      // 6. Confession message text formatting (word wrapping)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = confession.confession_message.length > 300 ? '34px Georgia, serif' : '42px Georgia, serif';
      const lineHeight = confession.confession_message.length > 300 ? 56 : 68;
      const maxWidth = 760;

      const words = confession.confession_message.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Centered block of message lines
      const totalTextHeight = lines.length * lineHeight;
      const startY = Math.max(720, 1000 - totalTextHeight / 2);

      // Quote marks
      ctx.fillStyle = 'rgba(217, 200, 242, 0.3)';
      ctx.font = 'italic 80px Georgia, serif';
      ctx.fillText('“', 540, startY - 20);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = confession.confession_message.length > 300 ? '34px Georgia, serif' : '42px Georgia, serif';
      for (let j = 0; j < lines.length; j++) {
        ctx.fillText(lines[j], 540, startY + j * lineHeight);
      }

      ctx.fillStyle = 'rgba(217, 200, 242, 0.3)';
      ctx.font = 'italic 80px Georgia, serif';
      ctx.fillText('”', 540, startY + lines.length * lineHeight + 40);

      // 7. Sender & Department info
      ctx.fillStyle = 'rgba(217, 200, 242, 0.85)';
      ctx.font = '32px sans-serif';
      ctx.fillText(`— ${senderDisplay} —`, 540, 1420);

      ctx.fillStyle = 'rgba(247, 182, 210, 0.65)';
      ctx.font = 'bold 26px sans-serif';
      ctx.letterSpacing = '3px';
      const deptDisplay =
        confession.department === 'B.Tech' && confession.branch
          ? `B.TECH (${confession.branch.toUpperCase()}) • ${confession.academic_year.toUpperCase()} YEAR`
          : `${confession.department.toUpperCase()} • ${confession.academic_year.toUpperCase()} YEAR`;
      ctx.fillText(deptDisplay, 540, 1470);

      // 8. Bottom Footer
      ctx.fillStyle = 'rgba(247, 182, 210, 0.4)';
      ctx.font = '24px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('College Confessions • Share your feelings', 540, 1720);

      // Export as PNG
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `confession-${confession.crush_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();

      setDownloadSuccess(true);
    } catch (err) {
      console.error('Failed to generate Instagram Story:', err);
      alert('Could not render story image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onMarkPublished(confession.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card-strong max-w-4xl w-full p-6 sm:p-8 rounded-3xl space-y-6 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-amore-pink/20 dark:border-amore-lavender/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-amore-deep-purple dark:text-white">
                  Instagram Story Generator
                </h3>
                <p className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">
                  Export ready 1080 × 1920 story card for college Instagram
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-amore-deep-purple dark:text-white" />
            </button>
          </div>

          {/* Consent Check Warning */}
          {!hasConsent && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Publication Consent Not Granted</strong>
                The student did not check the publication consent box. This confession is for private admin review only and must NOT be posted publicly.
              </div>
            </div>
          )}

          {/* Main Grid: Story Preview + Action Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Story Card Visual Preview (9:16 Aspect Ratio) */}
            <div className="flex justify-center">
              <div className="w-64 h-[455px] rounded-3xl overflow-hidden shadow-2xl border-2 border-amore-pink/40 bg-gradient-to-br from-[#151022] via-[#2d123d] to-[#151022] p-5 flex flex-col justify-between text-center relative select-none">
                {/* Header */}
                <div className="space-y-1 pt-2">
                  <div className="text-[7px] tracking-widest uppercase text-amore-pink/70">
                    ✦ Anonymous Confession ✦
                  </div>
                  <div className="font-serif text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amore-pink to-amore-lavender">
                    Confessions
                  </div>
                  <div className="w-16 h-[1px] bg-amore-pink/40 mx-auto" />
                </div>

                {/* Body */}
                <div className="space-y-3 py-2">
                  <div className="text-[9px] uppercase tracking-wider text-amore-pink/70">Dear</div>
                  <div className="font-serif text-lg font-bold text-amore-pink truncate">
                    {confession.crush_name}
                  </div>
                  <p className="text-[11px] text-white/90 font-serif italic line-clamp-6 leading-relaxed px-1">
                    &ldquo;{confession.confession_message}&rdquo;
                  </p>
                </div>

                {/* Footer */}
                <div className="space-y-1 pb-2 border-t border-white/10 pt-2">
                  <div className="text-[10px] text-amore-lavender/80 font-medium">
                    — {senderDisplay} —
                  </div>
                  <div className="text-[8px] uppercase tracking-wider text-amore-pink/60">
                    {confession.department}
                    {confession.branch ? ` (${confession.branch})` : ''} • {confession.academic_year} Year
                  </div>
                  <div className="text-[7px] text-white/30 tracking-widest pt-1">
                    College Confessions
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-amore-deep-purple dark:text-white">
                  Story Details
                </h4>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-amore-dark-bg/40 border border-amore-pink/20 space-y-2 text-xs">
                  <div>
                    <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50">Recipient: </span>
                    <span className="font-bold text-amore-deep-purple dark:text-white">{confession.crush_name}</span>
                  </div>
                  <div>
                    <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50">Sender: </span>
                    <span className="font-bold text-amore-deep-purple dark:text-white">{senderDisplay}</span>
                  </div>
                  <div>
                    <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50">Department: </span>
                    <span className="font-bold text-amore-deep-purple dark:text-white">
                      {confession.department}
                      {confession.branch ? ` (${confession.branch})` : ''} ({confession.academic_year} Year)
                    </span>
                  </div>
                  <div>
                    <span className="text-amore-deep-purple/50 dark:text-amore-lavender/50">Instagram Status: </span>
                    <span className={`font-bold ${confession.instagram_published ? 'text-green-500' : 'text-amber-500'}`}>
                      {confession.instagram_published ? 'Published' : 'Not Published'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={isGenerating || !hasConsent}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span>Generating Story Image...</span>
                  ) : downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Story Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Instagram Story (1080×1920)</span>
                    </>
                  )}
                </button>

                {!confession.instagram_published && (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || !hasConsent}
                    className="btn-secondary w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>{isPublishing ? 'Marking...' : 'Mark as Published to Instagram'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

