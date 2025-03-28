'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import ControlPanel normally since it doesn't use canvas
import ControlPanel from '@/components/ControlPanel';

// Dynamically import ImageEditor with SSR disabled
const ImageEditor = dynamic(
  () => import('@/components/ImageEditor'),
  { ssr: false }
);

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [effectSettings, setEffectSettings] = useState<Record<string, number>>({});
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Add debugging on component mount
  useEffect(() => {
    console.log("Home component mounted");
  }, []);

  const handleImageUpload = (imageDataUrl: string) => {
    // Reset error state
    setImageError(null);
    setImageLoading(true);
    
    console.log("handleImageUpload called with data length:", imageDataUrl.length);
    // Debug the data format
    console.log("Image data format:", imageDataUrl.substring(0, 50) + "...");

    // Reset active effect when a new image is uploaded
    if (activeEffect) {
      setActiveEffect(null);
      setEffectSettings({});
    }

    // Validate the image data
    if (!imageDataUrl.startsWith('data:image/')) {
      console.error("Invalid image data format:", imageDataUrl.substring(0, 50));
      setImageError("Invalid image data format");
      setImageLoading(false);
      return;
    }
    
    // Test load the image first
    const testImage = new Image();
    testImage.onload = () => {
      console.log("Test image loaded successfully in Home component, setting selectedImage");
      console.log("Dimensions:", testImage.width, "x", testImage.height);
      setSelectedImage(imageDataUrl);
      setImageLoading(false);
    };
    
    testImage.onerror = (error) => {
      console.error("Failed to load test image in Home component:", error);
      setImageError("Failed to load image. Please try another file.");
      setImageLoading(false);
    };
    
    // Set the source to trigger loading
    testImage.src = imageDataUrl;
  };

  const handleEffectChange = (effectName: string | null) => {
    console.log("Effect changed to:", effectName);
    setActiveEffect(effectName);
  };

  const handleSettingChange = (settingName: string, value: number) => {
    console.log(`Setting ${settingName} changed to:`, value);
    setEffectSettings((prev) => ({
      ...prev,
      [settingName]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background-start-rgb))] font-sans">
      {/* Header */}
      <header className="h-16 border-b border-[rgb(var(--apple-gray-200))] bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-[rgb(var(--apple-gray-800))]">
            <span className="text-[rgb(var(--primary))]">Imager</span>
          </h1>
          <div className="ml-3 text-xs font-medium bg-[rgb(var(--apple-gray-100))] text-[rgb(var(--apple-gray-600))] px-2.5 py-1 rounded-full">Real-time Effects</div>
        </div>
        <div className="flex gap-4">
          <a 
            href="https://github.com/pauljunbear/imager2" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-[rgb(var(--apple-gray-600))] hover:text-[rgb(var(--apple-gray-800))] flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex h-[calc(100vh-4rem)]">
        {/* Left sidebar */}
        <div className="w-80 border-r border-[rgb(var(--apple-gray-200))] bg-white/80 backdrop-blur-sm overflow-y-auto flex flex-col shadow-sm">
          <ControlPanel 
            activeEffect={activeEffect}
            effectSettings={effectSettings}
            onEffectChange={handleEffectChange}
            onSettingChange={handleSettingChange}
            hasImage={!!selectedImage}
          />
        </div>
        
        {/* Main editor area */}
        <div className="flex-1 canvas-bg overflow-hidden">
          <div className="w-full h-full overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full border-4 border-[rgb(var(--apple-gray-200))] border-t-[rgb(var(--primary))] animate-spin mb-3"></div>
                  <span className="text-[rgb(var(--apple-gray-600))] font-medium">Processing image...</span>
                </div>
              </div>
            )}
            {imageError && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-md text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {imageError}
              </div>
            )}
            <ImageEditor 
              selectedImage={selectedImage}
              activeEffect={activeEffect}
              effectSettings={effectSettings}
              onImageUpload={handleImageUpload}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 