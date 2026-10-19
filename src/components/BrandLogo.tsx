'use client';

import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  showDescriptor?: boolean;
}

export function BrandLogo({ className = '', showDescriptor = true }: BrandLogoProps) {
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="flex items-center gap-2">
        {/* Real uploaded ManyCam Logo */}
        <div className="relative h-8 w-32 flex-shrink-0">
          <Image
            src="/manycam-logo.png"
            alt="ManyCam"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>
      {showDescriptor && (
        <div className="mt-1 flex items-center gap-1.5 pl-0.5">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-primary px-1.5 py-0.5 rounded bg-primary-muted border border-blue-200">
            Enterprise Console
          </span>
          <span className="text-[9px] font-medium text-text-secondary bg-gray-100 px-1 py-0.2 rounded">
            v3.8.2
          </span>
        </div>
      )}
    </div>
  );
}
