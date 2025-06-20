"use client";
import React from 'react';
import { Heart } from 'lucide-react';
import { ImageTooltip } from './ui/Tooltip';

export function Footer() {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <span className="text-sm">© {new Date().getFullYear()} YouEducation</span>
            <span className="mx-2">•</span>
            <ImageTooltip 
              imageUrl="/support.png"
              alt="Support Us"
              width={500}
              height={400}
            >
              <span className="flex items-center hover:text-rose-500 transition-colors duration-300 cursor-pointer">
                Support Us 
                <Heart className="ml-1 h-4 w-4 fill-current" />
              </span>
            </ImageTooltip>
          </div>
        </div>
      </div>
    </footer>
  );
}
