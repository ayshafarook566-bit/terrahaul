export type UserRole =
  | 'Fleet Operations Manager'
  | 'Pit Dispatch Controller'
  | 'Haul Truck Operator'
  | 'Mine Safety Officer'
  | 'Equipment Superintendent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  siteId: string;
  createdAt: string;
}

export type TruckStatus =
  | 'Hauling'
  | 'Loading'
  | 'Dumping'
  | 'Queued'
  | 'Empty Return'
  | 'Maintenance'
  | 'Standby';

export interface TireTelemetry {
  position: 'FL' | 'FR' | 'RL_Out' | 'RL_In' | 'RR_In' | 'RR_Out';
  pressurePsi: number;
  tempCelsius: number;
  treadWearPct: number;
  status: 'nominal' | 'warning' | 'critical';
}

export interface DumperTruck {
  id: string; // e.g. "DT-101"
  model: string; // e.g. "Caterpillar 797F", "Komatsu 930E-5"
  operatorName: string;
  nominalCapacityTons: number;
  currentPayloadTons: number;
  status: TruckStatus;
  currentLocation: string; // e.g. "Pit Bench -300m", "Shovel #02", "Primary Crusher"
  destination: string;
  fuelLevelPct: number;
  fuelBurnLph: number; // liters per hour
  speedKmh: number;
  roadGradeInclinePct: number; // e.g. 8.5%
  hydraulicBedAngleDeg: number; // 0 to 45 deg
  brakeTempCelsius: number;
  engineHours: number;
  frontAxleLoadPct: number;
  rearAxleLoadPct: number;
  tires: TireTelemetry[];
  lastUpdated: string;
  overloadWarning: boolean;
}

export interface DispatchRun {
  id: string;
  truckId: string;
  operatorName: string;
  shovelId: string;
  dumpLocation: string;
  materialType: 'High-Grade Copper Ore' | 'Iron Ore Run-of-Mine' | 'Overburden Waste' | 'Aggregate Gravel';
  targetTonnage: number;
  actualTonnage: number;
  cycleTimeMinutes: number;
  loadingMinutes: number;
  haulingMinutes: number;
  dumpingMinutes: number;
  returnMinutes: number;
  timestamp: string;
  status: 'In Progress' | 'Completed' | 'Delayed';
}

export interface SafetyAlert {
  id: string;
  truckId: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'OVERLOAD' | 'TPMS' | 'GRADE_SPEED' | 'FATIGUE' | 'BRAKE_HEAT';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface FleetStats {
  totalTrucks: number;
  activeHauling: number;
  loadingCount: number;
  maintenanceCount: number;
  totalShiftTonnage: number;
  targetShiftTonnage: number;
  avgCycleTimeMinutes: number;
  avgFleetFuelLph: number;
  activeAlertsCount: number;
  haulRoadGradeWarningCount: number;
}
