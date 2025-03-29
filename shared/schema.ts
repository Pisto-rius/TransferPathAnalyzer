import { pgTable, text, serial, integer, boolean, json, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// TPA Projects table
export const tpaProjects = pgTable("tpa_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(tpaProjects).pick({
  name: true,
  description: true,
  userId: true,
});

// FRF (Frequency Response Function) Datasets
export const frfDatasets = pgTable("frf_datasets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => tpaProjects.id),
  name: text("name").notNull(),
  description: text("description"),
  data: json("data").notNull(), // Store the frequency response data as JSON
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFrfDatasetSchema = createInsertSchema(frfDatasets).pick({
  projectId: true,
  name: true,
  description: true,
  data: true,
});

// Operational Measurements
export const operationalMeasurements = pgTable("operational_measurements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => tpaProjects.id),
  name: text("name").notNull(),
  description: text("description"),
  data: json("data").notNull(), // Store the operational measurements as JSON
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOperationalMeasurementSchema = createInsertSchema(operationalMeasurements).pick({
  projectId: true,
  name: true,
  description: true,
  data: true,
});

// TPA Analysis Results
export const tpaResults = pgTable("tpa_results", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => tpaProjects.id),
  frfDatasetId: integer("frf_dataset_id").references(() => frfDatasets.id),
  operationalMeasurementId: integer("operational_measurement_id").references(() => operationalMeasurements.id),
  name: text("name").notNull(),
  description: text("description"),
  frequencyBand: text("frequency_band"),
  target: text("target"),
  contributionData: json("contribution_data"), // Source contributions results
  svdAnalysis: json("svd_analysis"), // SVD analysis results
  transferFunctions: json("transfer_functions"), // Transfer functions data
  predictionAccuracy: json("prediction_accuracy"), // Prediction accuracy metrics
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTpaResultSchema = createInsertSchema(tpaResults).pick({
  projectId: true,
  frfDatasetId: true,
  operationalMeasurementId: true,
  name: true,
  description: true,
  frequencyBand: true,
  target: true,
  contributionData: true,
  svdAnalysis: true, 
  transferFunctions: true,
  predictionAccuracy: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof tpaProjects.$inferSelect;

export type InsertFrfDataset = z.infer<typeof insertFrfDatasetSchema>;
export type FrfDataset = typeof frfDatasets.$inferSelect;

export type InsertOperationalMeasurement = z.infer<typeof insertOperationalMeasurementSchema>;
export type OperationalMeasurement = typeof operationalMeasurements.$inferSelect;

export type InsertTpaResult = z.infer<typeof insertTpaResultSchema>;
export type TpaResult = typeof tpaResults.$inferSelect;
