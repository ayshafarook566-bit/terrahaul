import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DumperTruck, DispatchRun, SafetyAlert, User, FleetStats } from '../types.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'terradb.json');

export interface StoredUser extends User {
  passwordHash: string;
}

export interface DatabaseState {
  users: StoredUser[];
  trucks: DumperTruck[];
  dispatches: DispatchRun[];
  alerts: SafetyAlert[];
  siteSettings: {
    siteName: string;
    shiftName: string;
    speedLimitKmh: number;
    maxInclinePct: number;
  };
}

const DEFAULT_TRUCKS: DumperTruck[] = [
  {
    id: 'DT-101',
    model: 'Caterpillar 797F',
    operatorName: 'Marcus Vance',
    nominalCapacityTons: 400,
    currentPayloadTons: 392,
    status: 'Hauling',
    currentLocation: 'Haul Ramp #03 (Grade +7.8%)',
    destination: 'Primary Gyratory Crusher #01',
    fuelLevelPct: 82,
    fuelBurnLph: 210,
    speedKmh: 24,
    roadGradeInclinePct: 7.8,
    hydraulicBedAngleDeg: 0,
    brakeTempCelsius: 142,
    engineHours: 4210,
    frontAxleLoadPct: 33,
    rearAxleLoadPct: 67,
    overloadWarning: false,
    lastUpdated: new Date().toISOString(),
    tires: [
      { position: 'FL', pressurePsi: 104, tempCelsius: 68, treadWearPct: 84, status: 'nominal' },
      { position: 'FR', pressurePsi: 105, tempCelsius: 70, treadWearPct: 82, status: 'nominal' },
      { position: 'RL_Out', pressurePsi: 106, tempCelsius: 73, treadWearPct: 79, status: 'nominal' },
      { position: 'RL_In', pressurePsi: 105, tempCelsius: 74, treadWearPct: 79, status: 'nominal' },
      { position: 'RR_In', pressurePsi: 106, tempCelsius: 72, treadWearPct: 80, status: 'nominal' },
      { position: 'RR_Out', pressurePsi: 104, tempCelsius: 71, treadWearPct: 81, status: 'nominal' },
    ],
  },
  {
    id: 'DT-102',
    model: 'Komatsu 930E-5',
    operatorName: 'Elena Rostova',
    nominalCapacityTons: 320,
    currentPayloadTons: 315,
    status: 'Loading',
    currentLocation: 'Excavator Shovel #02 (Pit Bench -280m)',
    destination: 'Primary Gyratory Crusher #01',
    fuelLevelPct: 65,
    fuelBurnLph: 185,
    speedKmh: 0,
    roadGradeInclinePct: 0.5,
    hydraulicBedAngleDeg: 0,
    brakeTempCelsius: 88,
    engineHours: 3180,
    frontAxleLoadPct: 34,
    rearAxleLoadPct: 66,
    overloadWarning: false,
    lastUpdated: new Date().toISOString(),
    tires: [
      { position: 'FL', pressurePsi: 102, tempCelsius: 64, treadWearPct: 88, status: 'nominal' },
      { position: 'FR', pressurePsi: 103, tempCelsius: 65, treadWearPct: 87, status: 'nominal' },
      { position: 'RL_Out', pressurePsi: 104, tempCelsius: 69, treadWearPct: 85, status: 'nominal' },
      { position: 'RL_In', pressurePsi: 103, tempCelsius: 70, treadWearPct: 85, status: 'nominal' },
      { position: 'RR_In', pressurePsi: 102, tempCelsius: 68, treadWearPct: 86, status: 'nominal' },
      { position: 'RR_Out', pressurePsi: 103, tempCelsius: 67, treadWearPct: 86, status: 'nominal' },
    ],
  },
  {
    id: 'DT-103',
    model: 'Liebherr T 284',
    operatorName: 'Tariq Al-Mansoor',
    nominalCapacityTons: 363,
    currentPayloadTons: 0,
    status: 'Empty Return',
    currentLocation: 'Bench Loop -150m (Return Road B)',
    destination: 'Electric Shovel #01 (Deep Pit Face)',
    fuelLevelPct: 78,
    fuelBurnLph: 140,
    speedKmh: 38,
    roadGradeInclinePct: -6.2,
    hydraulicBedAngleDeg: 0,
    brakeTempCelsius: 165,
    engineHours: 2950,
    frontAxleLoadPct: 48,
    rearAxleLoadPct: 52,
    overloadWarning: false,
    lastUpdated: new Date().toISOString(),
    tires: [
      { position: 'FL', pressurePsi: 101, tempCelsius: 65, treadWearPct: 91, status: 'nominal' },
      { position: 'FR', pressurePsi: 101, tempCelsius: 66, treadWearPct: 90, status: 'nominal' },
      { position: 'RL_Out', pressurePsi: 103, tempCelsius: 68, treadWearPct: 89, status: 'nominal' },
      { position: 'RL_In', pressurePsi: 102, tempCelsius: 68, treadWearPct: 89, status: 'nominal' },
      { position: 'RR_In', pressurePsi: 103, tempCelsius: 67, treadWearPct: 89, status: 'nominal' },
      { position: 'RR_Out', pressurePsi: 102, tempCelsius: 67, treadWearPct: 90, status: 'nominal' },
    ],
  },
  {
    id: 'DT-104',
    model: 'Caterpillar 797F',
    operatorName: 'Devon Miller',
    nominalCapacityTons: 400,
    currentPayloadTons: 428, // Overloaded!
    status: 'Hauling',
    currentLocation: 'Switchback Decline -90m',
    destination: 'North Waste Overburden Dump',
    fuelLevelPct: 51,
    fuelBurnLph: 245,
    speedKmh: 19,
    roadGradeInclinePct: 9.4,
    hydraulicBedAngleDeg: 0,
    brakeTempCelsius: 198,
    engineHours: 5820,
    frontAxleLoadPct: 31,
    rearAxleLoadPct: 69,
    overloadWarning: true,
    lastUpdated: new Date().toISOString(),
    tires: [
      { position: 'FL', pressurePsi: 108, tempCelsius: 79, treadWearPct: 70, status: 'warning' },
      { position: 'FR', pressurePsi: 109, tempCelsius: 81, treadWearPct: 68, status: 'warning' },
      { position: 'RL_Out', pressurePsi: 114, tempCelsius: 89, treadWearPct: 64, status: 'critical' },
      { position: 'RL_In', pressurePsi: 112, tempCelsius: 87, treadWearPct: 65, status: 'warning' },
      { position: 'RR_In', pressurePsi: 113, tempCelsius: 88, treadWearPct: 65, status: 'warning' },
      { position: 'RR_Out', pressurePsi: 115, tempCelsius: 91, treadWearPct: 63, status: 'critical' },
    ],
  },
  {
    id: 'DT-105',
    model: 'Komatsu 930E-5',
    operatorName: 'Carlos Santana',
    nominalCapacityTons: 320,
    currentPayloadTons: 310,
    status: 'Dumping',
    currentLocation: 'North Waste Overburden Dump',
    destination: 'North Waste Dump Edge Pocket #4',
    fuelLevelPct: 44,
    fuelBurnLph: 198,
    speedKmh: 0,
    roadGradeInclinePct: 1.2,
    hydraulicBedAngleDeg: 42,
    brakeTempCelsius: 110,
    engineHours: 4620,
    frontAxleLoadPct: 22,
    rearAxleLoadPct: 78,
    overloadWarning: false,
    lastUpdated: new Date().toISOString(),
    tires: [
      { position: 'FL', pressurePsi: 103, tempCelsius: 67, treadWearPct: 76, status: 'nominal' },
      { position: 'FR', pressurePsi: 104, tempCelsius: 68, treadWearPct: 75, status: 'nominal' },
      { position: 'RL_Out', pressurePsi: 106, tempCelsius: 72, treadWearPct: 73, status: 'nominal' },
      { position: 'RL_In', pressurePsi: 105, tempCelsius: 73, treadWearPct: 73, status: 'nominal' },
      { position: 'RR_In', pressurePsi: 105, tempCelsius: 72, treadWearPct: 74, status: 'nominal' },
      { position: 'RR_Out', pressurePsi: 106, tempCelsius: 71, treadWearPct: 74, status: 'nominal' },
    ],
  },
  {
    id: 'DT-106',
    model: 'BelAZ 75710',
    operatorName: 'Stanislav Morozov',
    nominalCapacityTons: 450,
    currentPayloadTons: 0,
    status: 'Maintenance',
    currentLocation: 'Heavy Workshop Bay #02',
    destination: 'Maintenance Bay',
    fuelLevelPct: 30,
    fuelBurnLph: 0,
    speedKmh: 0,
    roadGradeInclinePct: 0,
    hydraulicBedAngleDeg: 0,
    brakeTempCelsius: 45,
    engineHours: 6410,
    frontAxleLoadPct: 50,
    rearAxleLoadPct: 50,
    overloadWarning: false,
    lastUpdated: new Date().toISOString(),
    tires: [
      { position: 'FL', pressurePsi: 98, tempCelsius: 40, treadWearPct: 62, status: 'warning' },
      { position: 'FR', pressurePsi: 102, tempCelsius: 41, treadWearPct: 65, status: 'nominal' },
      { position: 'RL_Out', pressurePsi: 104, tempCelsius: 42, treadWearPct: 60, status: 'warning' },
      { position: 'RL_In', pressurePsi: 103, tempCelsius: 42, treadWearPct: 61, status: 'warning' },
      { position: 'RR_In', pressurePsi: 102, tempCelsius: 41, treadWearPct: 62, status: 'nominal' },
      { position: 'RR_Out', pressurePsi: 104, tempCelsius: 41, treadWearPct: 60, status: 'warning' },
    ],
  },
];

const DEFAULT_DISPATCHES: DispatchRun[] = [
  {
    id: 'DSP-8801',
    truckId: 'DT-101',
    operatorName: 'Marcus Vance',
    shovelId: 'Electric Shovel #01',
    dumpLocation: 'Primary Gyratory Crusher #01',
    materialType: 'High-Grade Copper Ore',
    targetTonnage: 390,
    actualTonnage: 392,
    cycleTimeMinutes: 23.4,
    loadingMinutes: 4.2,
    haulingMinutes: 11.0,
    dumpingMinutes: 2.1,
    returnMinutes: 6.1,
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    status: 'Completed',
  },
  {
    id: 'DSP-8802',
    truckId: 'DT-103',
    operatorName: 'Tariq Al-Mansoor',
    shovelId: 'Hydraulic Shovel #03',
    dumpLocation: 'Run-of-Mine Stockpile #2',
    materialType: 'Iron Ore Run-of-Mine',
    targetTonnage: 360,
    actualTonnage: 358,
    cycleTimeMinutes: 21.8,
    loadingMinutes: 3.8,
    haulingMinutes: 9.9,
    dumpingMinutes: 2.3,
    returnMinutes: 5.8,
    timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
    status: 'Completed',
  },
  {
    id: 'DSP-8803',
    truckId: 'DT-104',
    operatorName: 'Devon Miller',
    shovelId: 'Electric Shovel #01',
    dumpLocation: 'North Waste Overburden Dump',
    materialType: 'Overburden Waste',
    targetTonnage: 390,
    actualTonnage: 428,
    cycleTimeMinutes: 27.5,
    loadingMinutes: 5.1,
    haulingMinutes: 13.8,
    dumpingMinutes: 2.6,
    returnMinutes: 6.0,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'In Progress',
  },
  {
    id: 'DSP-8804',
    truckId: 'DT-102',
    operatorName: 'Elena Rostova',
    shovelId: 'Excavator Shovel #02',
    dumpLocation: 'Primary Gyratory Crusher #01',
    materialType: 'High-Grade Copper Ore',
    targetTonnage: 310,
    actualTonnage: 315,
    cycleTimeMinutes: 24.0,
    loadingMinutes: 4.5,
    haulingMinutes: 10.8,
    dumpingMinutes: 2.2,
    returnMinutes: 6.5,
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    status: 'In Progress',
  },
];

const DEFAULT_ALERTS: SafetyAlert[] = [
  {
    id: 'ALT-301',
    truckId: 'DT-104',
    severity: 'CRITICAL',
    category: 'OVERLOAD',
    title: 'Severe Payload Overload Detected (+7.0%)',
    description: 'Actual load 428 Tons exceeds structural rating of 400 Tons. High blowout risk on Rear-Left tires.',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    resolved: false,
  },
  {
    id: 'ALT-302',
    truckId: 'DT-104',
    severity: 'WARNING',
    category: 'BRAKE_HEAT',
    title: 'Brake Retarder Oil Temperature Exceeds 195°C',
    description: 'Prolonged downhill braking on Haul Ramp 03 at 9.4% grade. Operator instructed to limit speed to 18 km/h.',
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
    resolved: false,
  },
  {
    id: 'ALT-303',
    truckId: 'DT-106',
    severity: 'WARNING',
    category: 'TPMS',
    title: 'Rear Right Outer Tire Pressure Loss Alert',
    description: 'Pressure dropped 12 PSI below cold inflation target. Truck routed to Workshop Bay 02.',
    timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
    resolved: true,
  },
];

const DEMO_USERS: StoredUser[] = [
  {
    id: 'USR-001',
    name: 'Chief Dispatcher Vance',
    email: 'admin@terrahaul.com',
    role: 'Fleet Operations Manager',
    siteId: 'Apex Pit Alpha',
    passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'USR-002',
    name: 'Sarah Jenkins',
    email: 'dispatch@terrahaul.com',
    role: 'Pit Dispatch Controller',
    siteId: 'Apex Pit Alpha',
    passwordHash: crypto.createHash('sha256').update('dispatch123').digest('hex'),
    createdAt: new Date().toISOString(),
  },
];

class TerraDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseState {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read database file, initializing default seed state', err);
    }

    const initialState: DatabaseState = {
      users: DEMO_USERS,
      trucks: DEFAULT_TRUCKS,
      dispatches: DEFAULT_DISPATCHES,
      alerts: DEFAULT_ALERTS,
      siteSettings: {
        siteName: 'Apex Pit Alpha - Copper & Gold Operations',
        shiftName: 'Day Shift Alpha (06:00 - 18:00)',
        speedLimitKmh: 40,
        maxInclinePct: 10.0,
      },
    };

    this.saveToDisk(initialState);
    return initialState;
  }

  private saveToDisk(data: DatabaseState): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to database file', err);
    }
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.state.users.map(({ passwordHash, ...user }) => user);
  }

  public findUserByEmail(email: string): StoredUser | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: StoredUser['role'];
    siteId?: string;
  }): User {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const newUser: StoredUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      siteId: userData.siteId || 'Apex Pit Alpha',
      passwordHash: crypto.createHash('sha256').update(userData.password).digest('hex'),
      createdAt: new Date().toISOString(),
    };

    this.state.users.push(newUser);
    this.saveToDisk(this.state);

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  public verifyPassword(email: string, plainText: string): User | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    const hash = crypto.createHash('sha256').update(plainText).digest('hex');
    if (user.passwordHash === hash) {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  // --- Trucks ---
  public getTrucks(): DumperTruck[] {
    return this.state.trucks;
  }

  public getTruckById(id: string): DumperTruck | undefined {
    return this.state.trucks.find((t) => t.id === id);
  }

  public addTruck(truckData: Partial<DumperTruck>): DumperTruck {
    const id = truckData.id || `DT-${100 + this.state.trucks.length + 1}`;
    const newTruck: DumperTruck = {
      id,
      model: truckData.model || 'Caterpillar 797F',
      operatorName: truckData.operatorName || 'Unassigned Operator',
      nominalCapacityTons: truckData.nominalCapacityTons || 400,
      currentPayloadTons: truckData.currentPayloadTons || 0,
      status: truckData.status || 'Standby',
      currentLocation: truckData.currentLocation || 'Pit Dispatch Staging',
      destination: truckData.destination || 'Unassigned',
      fuelLevelPct: truckData.fuelLevelPct ?? 100,
      fuelBurnLph: truckData.fuelBurnLph ?? 160,
      speedKmh: truckData.speedKmh ?? 0,
      roadGradeInclinePct: truckData.roadGradeInclinePct ?? 0,
      hydraulicBedAngleDeg: truckData.hydraulicBedAngleDeg ?? 0,
      brakeTempCelsius: truckData.brakeTempCelsius ?? 60,
      engineHours: truckData.engineHours ?? 120,
      frontAxleLoadPct: 35,
      rearAxleLoadPct: 65,
      overloadWarning: Boolean(truckData.currentPayloadTons && truckData.nominalCapacityTons && truckData.currentPayloadTons > truckData.nominalCapacityTons),
      lastUpdated: new Date().toISOString(),
      tires: [
        { position: 'FL', pressurePsi: 104, tempCelsius: 65, treadWearPct: 95, status: 'nominal' },
        { position: 'FR', pressurePsi: 104, tempCelsius: 65, treadWearPct: 95, status: 'nominal' },
        { position: 'RL_Out', pressurePsi: 105, tempCelsius: 68, treadWearPct: 95, status: 'nominal' },
        { position: 'RL_In', pressurePsi: 105, tempCelsius: 68, treadWearPct: 95, status: 'nominal' },
        { position: 'RR_In', pressurePsi: 105, tempCelsius: 68, treadWearPct: 95, status: 'nominal' },
        { position: 'RR_Out', pressurePsi: 105, tempCelsius: 68, treadWearPct: 95, status: 'nominal' },
      ],
    };

    this.state.trucks.push(newTruck);
    this.saveToDisk(this.state);
    return newTruck;
  }

  public updateTruck(id: string, updates: Partial<DumperTruck>): DumperTruck {
    const index = this.state.trucks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Truck ${id} not found`);
    }

    const current = this.state.trucks[index];
    const payload = updates.currentPayloadTons !== undefined ? updates.currentPayloadTons : current.currentPayloadTons;
    const capacity = updates.nominalCapacityTons !== undefined ? updates.nominalCapacityTons : current.nominalCapacityTons;
    const isOverload = payload > capacity;

    const updated: DumperTruck = {
      ...current,
      ...updates,
      overloadWarning: isOverload,
      lastUpdated: new Date().toISOString(),
    };

    this.state.trucks[index] = updated;

    // Check if overload alert should be triggered
    if (isOverload && !this.state.alerts.some((a) => a.truckId === id && !a.resolved && a.category === 'OVERLOAD')) {
      this.addAlert({
        truckId: id,
        severity: 'CRITICAL',
        category: 'OVERLOAD',
        title: `Overload Warning on ${id} (${payload}T / ${capacity}T)`,
        description: `Payload exceeds rated nominal capacity by ${(payload - capacity).toFixed(1)} Tons.`,
      });
    }

    this.saveToDisk(this.state);
    return updated;
  }

  public deleteTruck(id: string): boolean {
    const lenBefore = this.state.trucks.length;
    this.state.trucks = this.state.trucks.filter((t) => t.id !== id);
    if (this.state.trucks.length !== lenBefore) {
      this.saveToDisk(this.state);
      return true;
    }
    return false;
  }

  // --- Dispatches ---
  public getDispatches(): DispatchRun[] {
    return this.state.dispatches;
  }

  public addDispatch(data: Partial<DispatchRun>): DispatchRun {
    const newDispatch: DispatchRun = {
      id: `DSP-${Math.floor(8800 + Math.random() * 1000)}`,
      truckId: data.truckId || 'DT-101',
      operatorName: data.operatorName || 'Assigned Driver',
      shovelId: data.shovelId || 'Electric Shovel #01',
      dumpLocation: data.dumpLocation || 'Primary Gyratory Crusher #01',
      materialType: data.materialType || 'High-Grade Copper Ore',
      targetTonnage: data.targetTonnage || 380,
      actualTonnage: data.actualTonnage || 380,
      cycleTimeMinutes: data.cycleTimeMinutes || 22.5,
      loadingMinutes: 4.0,
      haulingMinutes: 10.5,
      dumpingMinutes: 2.2,
      returnMinutes: 5.8,
      timestamp: new Date().toISOString(),
      status: data.status || 'In Progress',
    };

    this.state.dispatches.unshift(newDispatch);
    this.saveToDisk(this.state);
    return newDispatch;
  }

  // --- Alerts ---
  public getAlerts(): SafetyAlert[] {
    return this.state.alerts;
  }

  public addAlert(data: Omit<SafetyAlert, 'id' | 'timestamp' | 'resolved'>): SafetyAlert {
    const alert: SafetyAlert = {
      id: `ALT-${Math.floor(300 + Math.random() * 700)}`,
      ...data,
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    this.state.alerts.unshift(alert);
    this.saveToDisk(this.state);
    return alert;
  }

  public resolveAlert(id: string): boolean {
    const alert = this.state.alerts.find((a) => a.id === id);
    if (alert) {
      alert.resolved = true;
      this.saveToDisk(this.state);
      return true;
    }
    return false;
  }

  // --- Metrics ---
  public getStats(): FleetStats {
    const trucks = this.state.trucks;
    const dispatches = this.state.dispatches;

    const totalTrucks = trucks.length;
    const activeHauling = trucks.filter((t) => t.status === 'Hauling' || t.status === 'Empty Return').length;
    const loadingCount = trucks.filter((t) => t.status === 'Loading' || t.status === 'Queued').length;
    const maintenanceCount = trucks.filter((t) => t.status === 'Maintenance').length;

    const completedDispatches = dispatches.filter((d) => d.status === 'Completed');
    const totalShiftTonnage = completedDispatches.reduce((acc, d) => acc + d.actualTonnage, 0) +
      trucks.reduce((acc, t) => acc + (t.status === 'Hauling' || t.status === 'Dumping' ? t.currentPayloadTons : 0), 0);

    const targetShiftTonnage = 24000;

    const avgCycle = completedDispatches.length > 0
      ? Number((completedDispatches.reduce((acc, d) => acc + d.cycleTimeMinutes, 0) / completedDispatches.length).toFixed(1))
      : 23.5;

    const activeTrucksWithBurn = trucks.filter((t) => t.fuelBurnLph > 0);
    const avgFleetFuelLph = activeTrucksWithBurn.length > 0
      ? Math.round(activeTrucksWithBurn.reduce((acc, t) => acc + t.fuelBurnLph, 0) / activeTrucksWithBurn.length)
      : 195;

    const activeAlertsCount = this.state.alerts.filter((a) => !a.resolved).length;
    const haulRoadGradeWarningCount = trucks.filter((t) => t.roadGradeInclinePct > 8.0).length;

    return {
      totalTrucks,
      activeHauling,
      loadingCount,
      maintenanceCount,
      totalShiftTonnage,
      targetShiftTonnage,
      avgCycleTimeMinutes: avgCycle,
      avgFleetFuelLph,
      activeAlertsCount,
      haulRoadGradeWarningCount,
    };
  }

  public resetToDefaults(): DatabaseState {
    this.state = {
      users: DEMO_USERS,
      trucks: DEFAULT_TRUCKS,
      dispatches: DEFAULT_DISPATCHES,
      alerts: DEFAULT_ALERTS,
      siteSettings: {
        siteName: 'Apex Pit Alpha - Copper & Gold Operations',
        shiftName: 'Day Shift Alpha (06:00 - 18:00)',
        speedLimitKmh: 40,
        maxInclinePct: 10.0,
      },
    };
    this.saveToDisk(this.state);
    return this.state;
  }
}

export const db = new TerraDatabase();
