'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, ChevronLeft, ChevronRight, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAppStore, TOUR_SCENARIOS } from '@/store/app-store';

export function DemoTour() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isTourActive,
    currentTourIndex,
    nextTourStep,
    prevTourStep,
    skipTour,
    jumpToTourStep
  } = useAppStore();

  const currentScenario = TOUR_SCENARIOS[currentTourIndex];

  // Navigate automatically to route of current scenario if not on it
  useEffect(() => {
    if (isTourActive && currentScenario) {
      if (!pathname.startsWith(currentScenario.route)) {
        router.push(currentScenario.route);
      }
    }
  }, [isTourActive, currentTourIndex, currentScenario, pathname, router]);

  if (!isTourActive || !currentScenario) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[92vw] bg-white rounded-xl shadow-2xl border-2 border-[#0796E5] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Header */}
      <div className="bg-[#0796E5] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-md">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide uppercase opacity-90">
              Demo Walkthrough
            </div>
            <div className="text-sm font-bold leading-tight">
              Scenario {currentScenario.id} of {TOUR_SCENARIOS.length}
            </div>
          </div>
        </div>

        <button
          onClick={skipTour}
          className="p-1 rounded-md hover:bg-white/20 transition-colors text-white/90 hover:text-white"
          title="Exit Tour"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5">
        <h4 className="text-base font-bold text-[#182230]">
          {currentScenario.title}
        </h4>
        <p className="mt-2 text-xs text-[#667085] leading-relaxed">
          {currentScenario.description}
        </p>

        {/* Route indicator */}
        <div className="mt-3.5 flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[#0878BF]">
          <span className="font-medium">Active Module:</span>
          <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-[#0796E5] font-mono">
            {currentScenario.route}
          </code>
        </div>

        {/* Step indicators dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
          {TOUR_SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => jumpToTourStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentTourIndex
                  ? 'w-6 bg-[#0796E5]'
                  : idx < currentTourIndex
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-gray-200 hover:bg-gray-300'
              }`}
              title={`Step ${s.id}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={prevTourStep}
          disabled={currentTourIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#667085] hover:text-[#182230] hover:bg-gray-200/60 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={skipTour}
            className="text-xs text-[#667085] hover:text-[#182230] px-2 py-1"
          >
            End Tour
          </button>

          {currentTourIndex < TOUR_SCENARIOS.length - 1 ? (
            <button
              onClick={nextTourStep}
              className="flex items-center gap-1 px-4 py-1.5 bg-[#0796E5] hover:bg-[#0878BF] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Next Step
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={skipTour}
              className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <CheckCircle2 size={14} />
              Finish Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
