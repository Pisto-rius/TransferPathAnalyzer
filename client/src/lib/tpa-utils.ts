import { TransferFunctionData } from "@/types/tpa";

// Utility function to generate frequency response data
export const generateFrequencyResponseData = (
  minFreq: number = 20,
  maxFreq: number = 10000,
  points: number = 100
) => {
  const frequencies: number[] = [];
  const measuredValues: number[] = [];
  const predictedValues: number[] = [];
  const thresholdValues: number[] = [];
  
  // Generate logarithmically spaced frequencies
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const step = (logMax - logMin) / (points - 1);
  
  for (let i = 0; i < points; i++) {
    const logFreq = logMin + i * step;
    const freq = Math.pow(10, logFreq);
    frequencies.push(freq);
    
    // Generate response curves
    const baseValue = 60 + 20 * Math.sin(2 * Math.PI * (logFreq - logMin) / (logMax - logMin));
    
    // Add some natural looking fluctuations
    const measuredNoise = 5 * Math.sin(10 * logFreq) + 3 * Math.random();
    const predictedNoise = 3 * Math.sin(10 * logFreq);
    
    measuredValues.push(baseValue + measuredNoise);
    predictedValues.push(baseValue + predictedNoise);
    thresholdValues.push(baseValue + 10); // Threshold is 10dB above baseline
  }
  
  return {
    frequencies,
    measured: measuredValues,
    predicted: predictedValues,
    threshold: thresholdValues
  };
};

// Utility function to calculate color intensity for heatmap
export const getColorIntensity = (value: number, min: number, max: number): string => {
  const normalizedValue = (value - min) / (max - min);
  const intensity = Math.floor(normalizedValue * 600);
  
  if (intensity <= 100) return `bg-blue-100`;
  if (intensity <= 200) return `bg-blue-200`;
  if (intensity <= 300) return `bg-blue-300`;
  if (intensity <= 400) return `bg-blue-400`;
  if (intensity <= 500) return `bg-blue-500`;
  return `bg-blue-600`;
};

// Get all paths from transfer function data
export const getPathsFromTransferFunction = (transferFunctions: TransferFunctionData): string[] => {
  return Object.keys(transferFunctions);
};

// Get all frequencies from transfer function data
export const getFrequenciesFromTransferFunction = (transferFunctions: TransferFunctionData): string[] => {
  if (!transferFunctions || Object.keys(transferFunctions).length === 0) {
    return [];
  }
  
  const firstPath = Object.keys(transferFunctions)[0];
  return Object.keys(transferFunctions[firstPath]);
};

// Get min and max values from transfer function data for normalization
export const getTransferFunctionRange = (transferFunctions: TransferFunctionData): { min: number, max: number } => {
  let min = Infinity;
  let max = -Infinity;
  
  Object.keys(transferFunctions).forEach(path => {
    Object.keys(transferFunctions[path]).forEach(freq => {
      const value = transferFunctions[path][freq];
      min = Math.min(min, value);
      max = Math.max(max, value);
    });
  });
  
  return { min, max };
};

// Source contribution colors
export const sourceColors: Record<string, string> = {
  "Engine Mount 1": "#3b82f6", // blue-500
  "Engine Mount 2": "#60a5fa", // blue-400
  "Exhaust Hanger": "#34d399", // green-400
  "Subframe": "#fbbf24", // yellow-400
  "Transmission Mount": "#ef4444", // red-400
  "Suspension": "#a855f7", // purple-400
  "Air Intake": "#ec4899", // pink-400
  "Other": "#6366f1", // indigo-400
};

// Format number as dB(A)
export const formatSoundLevel = (value: number): string => {
  return `${value.toFixed(1)} dB(A)`;
};

// Format number as m/s²
export const formatAcceleration = (value: number): string => {
  return `${value.toFixed(2)} m/s²`;
};

// Format number as percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format frequency in Hz
export const formatFrequency = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} kHz`;
  }
  return `${value} Hz`;
};
