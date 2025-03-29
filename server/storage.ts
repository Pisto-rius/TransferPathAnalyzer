import { 
  users, type User, type InsertUser,
  tpaProjects, type Project, type InsertProject,
  frfDatasets, type FrfDataset, type InsertFrfDataset,
  operationalMeasurements, type OperationalMeasurement, type InsertOperationalMeasurement,
  tpaResults, type TpaResult, type InsertTpaResult
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjects(userId?: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // FRF Dataset methods
  getFrfDataset(id: number): Promise<FrfDataset | undefined>;
  getFrfDatasetsByProject(projectId: number): Promise<FrfDataset[]>;
  createFrfDataset(dataset: InsertFrfDataset): Promise<FrfDataset>;
  deleteFrfDataset(id: number): Promise<boolean>;
  
  // Operational Measurement methods
  getOperationalMeasurement(id: number): Promise<OperationalMeasurement | undefined>;
  getOperationalMeasurementsByProject(projectId: number): Promise<OperationalMeasurement[]>;
  createOperationalMeasurement(measurement: InsertOperationalMeasurement): Promise<OperationalMeasurement>;
  deleteOperationalMeasurement(id: number): Promise<boolean>;
  
  // TPA Result methods
  getTpaResult(id: number): Promise<TpaResult | undefined>;
  getTpaResultsByProject(projectId: number): Promise<TpaResult[]>;
  createTpaResult(result: InsertTpaResult): Promise<TpaResult>;
  deleteTpaResult(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private frfDatasets: Map<number, FrfDataset>;
  private operationalMeasurements: Map<number, OperationalMeasurement>;
  private tpaResults: Map<number, TpaResult>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentFrfDatasetId: number;
  private currentOperationalMeasurementId: number;
  private currentTpaResultId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.frfDatasets = new Map();
    this.operationalMeasurements = new Map();
    this.tpaResults = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentFrfDatasetId = 1;
    this.currentOperationalMeasurementId = 1;
    this.currentTpaResultId = 1;
    
    // Add a default user and project for testing
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "demo",
      password: "password"
    };
    this.users.set(defaultUser.id, defaultUser);
    
    const defaultProject: Project = {
      id: this.currentProjectId++,
      name: "Engine Vibration Study",
      description: "Analysis of vehicle XYZ engine vibration and noise transfer paths",
      userId: defaultUser.id,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    this.projects.set(defaultProject.id, defaultProject);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjects(userId?: number): Promise<Project[]> {
    let projects = Array.from(this.projects.values());
    if (userId !== undefined) {
      projects = projects.filter(project => project.userId === userId);
    }
    return projects;
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt: now,
      lastUpdated: now
    };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = {
      ...existingProject,
      ...project,
      lastUpdated: new Date()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // FRF Dataset methods
  async getFrfDataset(id: number): Promise<FrfDataset | undefined> {
    return this.frfDatasets.get(id);
  }
  
  async getFrfDatasetsByProject(projectId: number): Promise<FrfDataset[]> {
    return Array.from(this.frfDatasets.values())
      .filter(dataset => dataset.projectId === projectId);
  }
  
  async createFrfDataset(dataset: InsertFrfDataset): Promise<FrfDataset> {
    const id = this.currentFrfDatasetId++;
    const newDataset: FrfDataset = {
      ...dataset,
      id,
      createdAt: new Date()
    };
    this.frfDatasets.set(id, newDataset);
    return newDataset;
  }
  
  async deleteFrfDataset(id: number): Promise<boolean> {
    return this.frfDatasets.delete(id);
  }
  
  // Operational Measurement methods
  async getOperationalMeasurement(id: number): Promise<OperationalMeasurement | undefined> {
    return this.operationalMeasurements.get(id);
  }
  
  async getOperationalMeasurementsByProject(projectId: number): Promise<OperationalMeasurement[]> {
    return Array.from(this.operationalMeasurements.values())
      .filter(measurement => measurement.projectId === projectId);
  }
  
  async createOperationalMeasurement(measurement: InsertOperationalMeasurement): Promise<OperationalMeasurement> {
    const id = this.currentOperationalMeasurementId++;
    const newMeasurement: OperationalMeasurement = {
      ...measurement,
      id,
      createdAt: new Date()
    };
    this.operationalMeasurements.set(id, newMeasurement);
    return newMeasurement;
  }
  
  async deleteOperationalMeasurement(id: number): Promise<boolean> {
    return this.operationalMeasurements.delete(id);
  }
  
  // TPA Result methods
  async getTpaResult(id: number): Promise<TpaResult | undefined> {
    return this.tpaResults.get(id);
  }
  
  async getTpaResultsByProject(projectId: number): Promise<TpaResult[]> {
    return Array.from(this.tpaResults.values())
      .filter(result => result.projectId === projectId);
  }
  
  async createTpaResult(result: InsertTpaResult): Promise<TpaResult> {
    const id = this.currentTpaResultId++;
    const newResult: TpaResult = {
      ...result,
      id,
      createdAt: new Date()
    };
    this.tpaResults.set(id, newResult);
    return newResult;
  }
  
  async deleteTpaResult(id: number): Promise<boolean> {
    return this.tpaResults.delete(id);
  }
}

export const storage = new MemStorage();
