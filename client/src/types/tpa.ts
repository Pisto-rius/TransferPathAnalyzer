// Types for the TPA application

// Frequency band types
export type FrequencyBand = 
  | "All Frequencies" 
  | "20-100 Hz" 
  | "100-500 Hz" 
  | "500-2000 Hz";

// Target positions
export type Target = 
  | "Driver's Ear" 
  | "Passenger Seat" 
  | "Rear Cabin";

// Source path types
export type SourcePath = 
  | "Engine Mount 1" 
  | "Engine Mount 2" 
  | "Exhaust Hanger" 
  | "Subframe" 
  | "Transmission Mount" 
  | "Suspension" 
  | "Air Intake" 
  | "Other";

// Frequency labels
export type FrequencyLabel = 
  | "125Hz" 
  | "250Hz" 
  | "500Hz" 
  | "1kHz" 
  | "2kHz" 
  | "4kHz" 
  | "8kHz";

// KPI types
export interface KpiData {
  soundPressureLevel: number;
  maxVibrationAmplitude: number;
  dominantFrequency: number;
  transferEfficiency: number;
}

// Source contribution
export interface SourceContribution {
  name: string;
  value: number;
  color?: string;
}

// SVD Analysis data
export interface SvdAnalysisData {
  singularValues: number[];
  truncationLevel: number;
  singularValuesUsed: number;
  conditionNumber: number;
  inversionQuality: "Good" | "Poor";
}

// Transfer Function data
export interface TransferFunctionData {
  [path: string]: {
    [frequency: string]: number;
  };
}

// Error distribution data
export interface ErrorDistributionPoint {
  frequency: string;
  error: number;
}

// Prediction accuracy data
export interface PredictionAccuracyData {
  overall: number;
  lowFrequency: number;
  midFrequency: number;
  highFrequency: number;
  errorDistribution: ErrorDistributionPoint[];
}

// Complete TPA data structure
export interface TpaData {
  frequencyBand: string;
  target: string;
  kpis: KpiData;
  contributionData: SourceContribution[];
  svdAnalysis: SvdAnalysisData;
  transferFunctions: TransferFunctionData;
  predictionAccuracy: PredictionAccuracyData;
}

// Project type
export interface Project {
  id: number;
  name: string;
  description?: string;
  userId?: number;
  createdAt: Date;
  lastUpdated: Date;
}

// FRF Dataset type
export interface FrfDataset {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  data: any; // Replace with specific data structure if known
  createdAt: Date;
}

// Operational Measurement type
export interface OperationalMeasurement {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  data: any; // Replace with specific data structure if known
  createdAt: Date;
}

// TPA Computation parameters
export interface TpaComputationParams {
  frfDatasetId?: number;
  operationalMeasurementId?: number;
  frequencyBand?: string;
  target?: string;
}
