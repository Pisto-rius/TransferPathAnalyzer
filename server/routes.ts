import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertProjectSchema, 
  insertFrfDatasetSchema, 
  insertOperationalMeasurementSchema,
  insertTpaResultSchema 
} from "@shared/schema";
import { spawn } from "child_process";

// Simple matrix operations in JavaScript for testing
function matrixInversion(matrix: number[][]): number[][] {
  // For the sake of demonstration, this is a simplified matrix inversion
  // In a real-world application, would use NumPy or similar libraries through Python child process
  const n = matrix.length;
  const result = Array(n).fill(0).map(() => Array(n).fill(0));
  
  // Identity matrix for simple matrices
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i][j] = i === j ? 1 / matrix[i][i] : 0;
    }
  }
  
  return result;
}

// Calculate SVD (simplified)
function singularValueDecomposition(matrix: number[][]): { 
  u: number[][], 
  s: number[], 
  v: number[][] 
} {
  // Simplified SVD calculation
  const n = matrix.length;
  const m = matrix[0].length;
  
  // Mock implementation - in real app would use numerical libraries
  const s = Array(Math.min(n, m)).fill(0).map((_, i) => 100 / (i + 1));
  const u = Array(n).fill(0).map(() => Array(n).fill(0));
  const v = Array(m).fill(0).map(() => Array(m).fill(0));
  
  // Set identity matrices for demo
  for (let i = 0; i < n; i++) {
    if (i < n) u[i][i] = 1;
  }
  
  for (let i = 0; i < m; i++) {
    if (i < m) v[i][i] = 1;
  }
  
  return { u, s, v };
}

// Generate dummy TPA data for demonstration
function generateDemoTpaData(frequencyBand: string, target: string) {
  // Source paths
  const paths = [
    "Engine Mount 1", 
    "Engine Mount 2", 
    "Transmission Mount", 
    "Exhaust Hanger", 
    "Subframe", 
    "Suspension", 
    "Air Intake"
  ];
  
  // Frequency bands
  const frequencies = ["125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz"];
  
  // Generate transfer function matrix
  const transferFunctions: Record<string, Record<string, number>> = {};
  paths.forEach(path => {
    transferFunctions[path] = {};
    frequencies.forEach(freq => {
      transferFunctions[path][freq] = Math.random() * 0.8 + 0.2; // Value between 0.2 and 1.0
    });
  });
  
  // Generate source contributions
  const contributions = paths.map(path => ({
    name: path,
    value: Math.random() * 80 + 20 // Value between 20 and 100
  }));
  
  // SVD analysis
  const svdValues = Array(12).fill(0).map((_, i) => 100 / (i + 1));
  const truncationLevel = 70; // Percentage
  const singularValuesUsed = 8;
  const conditionNumber = 12.4;
  
  // Prediction accuracy
  const predictionAccuracy = {
    overall: 92.4,
    lowFrequency: 95.1,
    midFrequency: 93.7,
    highFrequency: 88.2,
    errorDistribution: frequencies.map(freq => ({
      frequency: freq,
      error: Math.random() * 15 // 0-15% error
    }))
  };
  
  // Key Performance Indicators
  const kpis = {
    soundPressureLevel: 76.4,
    maxVibrationAmplitude: 0.32,
    dominantFrequency: 124,
    transferEfficiency: 84.7
  };
  
  return {
    frequencyBand,
    target,
    transferFunctions,
    contributionData: contributions,
    svdAnalysis: {
      singularValues: svdValues,
      truncationLevel,
      singularValuesUsed,
      conditionNumber,
      inversionQuality: conditionNumber < 15 ? "Good" : "Poor"
    },
    predictionAccuracy,
    kpis
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // API versioning prefix
  const apiPrefix = "/api";
  
  // Projects routes
  router.get("/projects", async (req: Request, res: Response) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const projects = await storage.getProjects(userId);
    res.json(projects);
  });
  
  router.get("/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  });
  
  router.post("/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  router.put("/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  
  router.delete("/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteProject(id);
    
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(204).send();
  });
  
  // FRF Datasets routes
  router.get("/frf-datasets", async (req: Request, res: Response) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    
    const datasets = await storage.getFrfDatasetsByProject(projectId);
    res.json(datasets);
  });
  
  router.get("/frf-datasets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const dataset = await storage.getFrfDataset(id);
    
    if (!dataset) {
      return res.status(404).json({ message: "FRF dataset not found" });
    }
    
    res.json(dataset);
  });
  
  router.post("/frf-datasets", async (req: Request, res: Response) => {
    try {
      const datasetData = insertFrfDatasetSchema.parse(req.body);
      const dataset = await storage.createFrfDataset(datasetData);
      res.status(201).json(dataset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid FRF dataset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create FRF dataset" });
    }
  });
  
  router.delete("/frf-datasets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteFrfDataset(id);
    
    if (!success) {
      return res.status(404).json({ message: "FRF dataset not found" });
    }
    
    res.status(204).send();
  });
  
  // Operational Measurements routes
  router.get("/operational-measurements", async (req: Request, res: Response) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    
    const measurements = await storage.getOperationalMeasurementsByProject(projectId);
    res.json(measurements);
  });
  
  router.get("/operational-measurements/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const measurement = await storage.getOperationalMeasurement(id);
    
    if (!measurement) {
      return res.status(404).json({ message: "Operational measurement not found" });
    }
    
    res.json(measurement);
  });
  
  router.post("/operational-measurements", async (req: Request, res: Response) => {
    try {
      const measurementData = insertOperationalMeasurementSchema.parse(req.body);
      const measurement = await storage.createOperationalMeasurement(measurementData);
      res.status(201).json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid operational measurement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create operational measurement" });
    }
  });
  
  router.delete("/operational-measurements/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteOperationalMeasurement(id);
    
    if (!success) {
      return res.status(404).json({ message: "Operational measurement not found" });
    }
    
    res.status(204).send();
  });
  
  // TPA Results routes
  router.get("/tpa-results", async (req: Request, res: Response) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    
    const results = await storage.getTpaResultsByProject(projectId);
    res.json(results);
  });
  
  router.get("/tpa-results/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await storage.getTpaResult(id);
    
    if (!result) {
      return res.status(404).json({ message: "TPA result not found" });
    }
    
    res.json(result);
  });
  
  router.post("/tpa-results", async (req: Request, res: Response) => {
    try {
      const resultData = insertTpaResultSchema.parse(req.body);
      const result = await storage.createTpaResult(resultData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid TPA result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create TPA result" });
    }
  });
  
  router.delete("/tpa-results/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTpaResult(id);
    
    if (!success) {
      return res.status(404).json({ message: "TPA result not found" });
    }
    
    res.status(204).send();
  });
  
  // TPA Computation route - simulation of computational backend
  router.post("/compute-tpa", async (req: Request, res: Response) => {
    try {
      const computeSchema = z.object({
        frfDatasetId: z.number().optional(),
        operationalMeasurementId: z.number().optional(),
        frequencyBand: z.string().optional(),
        target: z.string().optional(),
      });
      
      const computeData = computeSchema.parse(req.body);
      
      // In a real application, we would:
      // 1. Load the FRF and operational measurement data
      // 2. Call Python or another computational engine to perform the TPA calculations
      // 3. Return the results of the computation
      
      // For demo purposes, generate mock TPA data
      const tpaData = generateDemoTpaData(
        computeData.frequencyBand || "All Frequencies",
        computeData.target || "Driver's Ear"
      );
      
      res.json(tpaData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid computation parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Computation failed" });
    }
  });
  
  // SVD computation route
  router.post("/compute-svd", async (req: Request, res: Response) => {
    try {
      const svdSchema = z.object({
        matrix: z.array(z.array(z.number())),
        truncationLevel: z.number().min(0).max(100).optional()
      });
      
      const { matrix, truncationLevel = 70 } = svdSchema.parse(req.body);
      
      // Perform SVD computation
      const svdResult = singularValueDecomposition(matrix);
      
      // Calculate truncation threshold
      const totalSingularValues = svdResult.s.length;
      const usedSingularValues = Math.ceil(totalSingularValues * truncationLevel / 100);
      
      // Calculate condition number
      const conditionNumber = svdResult.s[0] / svdResult.s[usedSingularValues - 1];
      
      res.json({
        singularValues: svdResult.s,
        truncationLevel,
        singularValuesUsed: usedSingularValues,
        totalSingularValues,
        conditionNumber,
        inversionQuality: conditionNumber < 15 ? "Good" : "Poor"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid matrix data", errors: error.errors });
      }
      res.status(500).json({ message: "SVD computation failed" });
    }
  });
  
  // Register the router with the API prefix
  app.use(apiPrefix, router);
  
  const httpServer = createServer(app);
  return httpServer;
}
