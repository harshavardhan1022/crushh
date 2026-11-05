'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Heart, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { confessionSchema, type ConfessionInput } from '@backend/validators/confession.validator';
import {
  DEPARTMENTS,
  BTECH_BRANCHES,
  BTECH_BRANCH_LABELS,
  DEPARTMENT_YEARS,
  MAX_CONFESSION_LENGTH,
  type Department,
  type BTechBranch,
} from '@backend/config';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export function ConfessionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConfessionInput>({
    resolver: zodResolver(confessionSchema),
    defaultValues: {
      senderName: '',
      crushName: '',
      department: undefined,
      branch: '',
      academicYear: undefined,
      confessionMessage: '',
      publicationConsent: false,
    },
  });

  const selectedDepartment = watch('department') as Department | undefined;
  const selectedBranch = watch('branch') as BTechBranch | undefined;
  const messageContent = watch('confessionMessage') || '';
  const charCount = messageContent.length;

  const isBTech = selectedDepartment === 'B.Tech';

  // Handle department change: reset branch & academic year
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Department;
    setValue('department', val, { shouldValidate: true });
    // Reset branch & academic year whenever department changes
    setValue('branch', '' as any, { shouldValidate: false });
    setValue('academicYear', '' as any, { shouldValidate: false });
  };

  // Handle branch change: reset academic year
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BTechBranch;
    setValue('branch', val, { shouldValidate: true });
    setValue('academicYear', '' as any, { shouldValidate: false });
  };

  const onSubmit = async (data: ConfessionInput) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Clean data payload: ensure branch is null for non-B.Tech
      const payload = {
        ...data,
        branch: data.department === 'B.Tech' && data.branch ? data.branch : null,
      };

      const response = await fetch('/api/confessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit confession. Please try again.');
      }

      // Success
      setSubmitSuccess(true);

      // Trigger celebratory romantic confetti
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F7B6D2', '#D9C8F2', '#FCE4EF', '#E0A899'],
        });
      } catch {
        // Confetti is purely decorative
      }
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmitSuccess(false);
    setServerError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {submitSuccess ? (
          /* Success Acknowledgement Card */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card-strong p-8 sm:p-12 text-center rounded-3xl space-y-6 border-2 border-amore-pink/40 shadow-pink-lg"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amore-pink to-amore-lavender flex items-center justify-center shadow-pink-md">
              <Heart className="w-10 h-10 text-amore-deep-purple fill-amore-deep-purple/20" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amore-deep-purple dark:text-white">
                Your confession has been sent!
              </h2>
              <p className="text-base sm:text-lg text-amore-deep-purple/75 dark:text-amore-lavender/80 font-light max-w-md mx-auto">
                Some feelings deserve to be heard. Thank you for sharing yours.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/20 text-xs text-amore-deep-purple/70 dark:text-amore-lavender/70 max-w-md mx-auto">
              Your submission will be reviewed by the administrator with total confidentiality. If approved and consented, it will be prepared for the college Instagram story!
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Submit Another Confession</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Confession Submission Form */
          <motion.form
            key="form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-strong p-6 sm:p-10 rounded-3xl shadow-pink-lg space-y-7 border border-white/80 dark:border-white/10"
          >
            {/* Form Header */}
            <div className="space-y-1.5 pb-2 border-b border-amore-pink/20 dark:border-amore-lavender/15">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amore-deep-purple dark:text-white">
                Confess Your Feelings
              </h2>
              <p className="text-sm text-amore-deep-purple/70 dark:text-amore-lavender/70 font-light">
                A little secret, a hidden feeling, or a story waiting to be told.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Field 1: Sender Name (Optional) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label
                  htmlFor="senderName"
                  className="block text-sm font-semibold text-amore-deep-purple dark:text-white"
                >
                  Your Name
                </label>
                <span className="text-xs text-amore-deep-purple/50 dark:text-amore-lavender/50 font-normal">
                  Optional — Leave blank to stay completely anonymous
                </span>
              </div>
              <input
                id="senderName"
                type="text"
                placeholder="e.g. Secret Admirer, A shy classmate... (or leave empty)"
                disabled={isSubmitting}
                {...register('senderName')}
                className="input-field"
              />
              {errors.senderName && (
                <p className="text-xs text-red-500 mt-1">{errors.senderName.message}</p>
              )}
            </div>

            {/* Department Selection */}
            <div className="space-y-1.5">
              <label
                htmlFor="department"
                className="block text-sm font-semibold text-amore-deep-purple dark:text-white"
              >
                Department <span className="text-amore-pink">*</span>
              </label>
              <select
                id="department"
                disabled={isSubmitting}
                defaultValue=""
                {...register('department')}
                onChange={handleDepartmentChange}
                className="input-field appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select Department
                </option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-white dark:bg-amore-dark-bg text-black dark:text-white">
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>
              )}
            </div>

            {/* B.Tech Branch Dropdown (Visible only when B.Tech is selected) */}
            {isBTech && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5"
              >
                <label
                  htmlFor="branch"
                  className="block text-sm font-semibold text-amore-deep-purple dark:text-white"
                >
                  Select Branch <span className="text-amore-pink">*</span>
                </label>
                <select
                  id="branch"
                  disabled={isSubmitting}
                  defaultValue=""
                  {...register('branch')}
                  onChange={handleBranchChange}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select B.Tech Branch
                  </option>
                  {BTECH_BRANCHES.map((b) => (
                    <option key={b} value={b} className="bg-white dark:bg-amore-dark-bg text-black dark:text-white">
                      {BTECH_BRANCH_LABELS[b]}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <p className="text-xs text-red-500 mt-1">{errors.branch.message}</p>
                )}
              </motion.div>
            )}

            {/* Academic Year Dropdown */}
            {/* For B.Tech: Shown after branch is selected. For others: Shown after department is selected */}
            {(isBTech ? !!selectedBranch : !!selectedDepartment) && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5"
              >
                <label
                  htmlFor="academicYear"
                  className="block text-sm font-semibold text-amore-deep-purple dark:text-white"
                >
                  Academic Year <span className="text-amore-pink">*</span>
                </label>
                <select
                  id="academicYear"
                  disabled={isSubmitting}
                  defaultValue=""
                  {...register('academicYear')}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  {DEPARTMENT_YEARS[selectedDepartment as Department]?.map((year) => (
                    <option key={year} value={year} className="bg-white dark:bg-amore-dark-bg text-black dark:text-white">
                      {year === 'Graduated' ? 'Graduated' : `${year} Year`}
                    </option>
                  ))}
                </select>
                {errors.academicYear && (
                  <p className="text-xs text-red-500 mt-1">{errors.academicYear.message}</p>
                )}
              </motion.div>
            )}

            {/* Field 4: Crush Name (Required) */}
            <div className="space-y-1.5">
              <label
                htmlFor="crushName"
                className="block text-sm font-semibold text-amore-deep-purple dark:text-white"
              >
                Who is this confession for? <span className="text-amore-pink">*</span>
              </label>
              <input
                id="crushName"
                type="text"
                placeholder="Enter your crush's name..."
                disabled={isSubmitting}
                {...register('crushName')}
                className="input-field"
              />
              {errors.crushName && (
                <p className="text-xs text-red-500 mt-1">{errors.crushName.message}</p>
              )}
            </div>

            {/* Field 5: Confession Message (Required textarea with live character counter) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label
                  htmlFor="confessionMessage"
                  className="block text-sm font-semibold text-amore-deep-purple dark:text-white"
                >
                  Write your heart out <span className="text-amore-pink">*</span>
                </label>
                <span
                  className={`text-xs font-mono ${
                    charCount > MAX_CONFESSION_LENGTH
                      ? 'text-red-500 font-bold'
                      : 'text-amore-deep-purple/50 dark:text-amore-lavender/50'
                  }`}
                >
                  {charCount} / {MAX_CONFESSION_LENGTH}
                </span>
              </div>
              <textarea
                id="confessionMessage"
                rows={5}
                placeholder="Tell your story... Some feelings are easier to express anonymously."
                disabled={isSubmitting}
                {...register('confessionMessage')}
                className="input-field resize-y min-h-[120px] max-h-[350px]"
              />
              {errors.confessionMessage && (
                <p className="text-xs text-red-500 mt-1">{errors.confessionMessage.message}</p>
              )}
            </div>

            {/* Field 6: Publication Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  {...register('publicationConsent')}
                  className="mt-1 w-4 h-4 rounded border-amore-pink/40 text-amore-pink focus:ring-amore-pink focus:ring-offset-0 cursor-pointer accent-amore-pink"
                />
                <span className="text-xs sm:text-sm text-amore-deep-purple/80 dark:text-amore-lavender/80 group-hover:text-amore-deep-purple dark:group-hover:text-white transition-colors leading-relaxed select-none">
                  I understand that my confession may be reviewed by the administrator and, if approved, published on the college Instagram page.
                </span>
              </label>
              {errors.publicationConsent && (
                <p className="text-xs text-red-500 mt-1">{errors.publicationConsent.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingAnimation size="sm" />
                    <span>Sending your confession...</span>
                  </div>
                ) : (
                  <>
                    <span>Send My Confession</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
