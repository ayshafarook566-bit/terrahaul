import React, { useState, useEffect } from 'react';
import {
  DumperTruck,
  DispatchRun,
  SafetyAlert,
  FleetStats,
  User,
  TruckStatus,
} from '../types.js';
import { ApiClient } from '../services/api.js';
import {
  Truck,
  Plus,
  Radio,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  Download,
  Gauge,
  Flame,
  Activity,
  Layers,
  MapPin,
  CheckCircle,
  XCircle,
  Sliders,
  RefreshCw,
  Wrench,
  Fuel,
  Maximize2,
  Trash2,
  Clock,
  Compass,
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onOpenGuide: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onOpenGuide }) => {
  // State
  const [trucks, setTrucks] = useState<DumperTruck[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRun[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'telematics' | 'routes' | 'safety'>(
    'roster'
  );

  // Selected Truck for Diagnostic Telematics View
  const [selectedTruckId, setSelectedTruckId] = useState<string>('DT-101');

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showAddTruckModal, setShowAddTruckModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);

  // Form states
  const [newTruckModel, setNewTruckModel] = useState<string>('Caterpillar 797F');
  const [newTruckId, setNewTruckId] = useState<string>('');
  const [newTruckOperator, setNewTruckOperator] = useState<string>('');
  const [newTruckCapacity, setNewTruckCapacity] = useState<number>(400);

  const [newDispatchTruck, setNewDispatchTruck] = useState<string>('DT-101');
  const [newDispatchShovel, setNewDispatchShovel] = useState<string>('Electric Shovel #01');
  const [newDispatchDump, setNewDispatchDump] = useState<string>('Primary Gyratory Crusher #01');
  const [newDispatchMaterial, setNewDispatchMaterial] = useState<DispatchRun['materialType']>(
    'High-Grade Copper Ore'
  );
  const [newDispatchTonnage, setNewDispatchTonnage] = useState<number>(390);

  // Load all dashboard data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [trucksData, dispatchesData, alertsData, statsData] = await Promise.all([
        ApiClient.getTrucks(),
        ApiClient.getDispatches(),
        ApiClient.getAlerts(),
        ApiClient.getStats(),
      ]);

      setTrucks(trucksData);
      setDispatches(dispatchesData);
      setAlerts(alertsData);
      setStats(statsData);

      if (trucksData.length > 0 && !trucksData.some((t) => t.id === selectedTruckId)) {
        setSelectedTruckId(trucksData[0].id);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const selectedTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];

  // Truck Status Change
  const handleUpdateStatus = async (truckId: string, status: TruckStatus) => {
    try {
      let location = undefined;
      let destination = undefined;
      let payload = undefined;
      let bedAngle = 0;

      if (status === 'Loading') {
        location = 'Electric Shovel #01';
        destination = 'Primary Gyratory Crusher #01';
        payload = 390;
      } else if (status === 'Hauling') {
        location = 'Haul Ramp #03 (Grade +7.8%)';
        destination = 'Primary Gyratory Crusher #01';
      } else if (status === 'Dumping') {
        location = 'Primary Gyratory Crusher #01';
        destination = 'Dumping Pocket';
        bedAngle = 45;
      } else if (status === 'Empty Return') {
        location = 'Haul Ramp Descent';
        destination = 'Pit Face Shovel #02';
        payload = 0;
      } else if (status === 'Maintenance') {
        location = 'Workshop Bay #01';
        destination = 'Maintenance Bay';
        payload = 0;
      }

      await ApiClient.updateTruckStatus(truckId, {
        status,
        currentLocation: location,
        destination,
        currentPayloadTons: payload,
        hydraulicBedAngleDeg: bedAngle,
      });

      await loadData(true);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Add Truck Handler
  const handleCreateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const truckId = newTruckId.trim() || `DT-${100 + trucks.length + 1}`;
      await ApiClient.createTruck({
        id: truckId,
        model: newTruckModel,
        operatorName: newTruckOperator.trim() || 'Assigned Driver',
        nominalCapacityTons: Number(newTruckCapacity),
        currentPayloadTons: 0,
        status: 'Standby',
        currentLocation: 'Pit Dispatch Staging',
        destination: 'Shovel Queue',
      });
      setShowAddTruckModal(false);
      setNewTruckId('');
      setNewTruckOperator('');
      await loadData(true);
    } catch (err) {
      console.error('Failed to create truck:', err);
    }
  };

  // Create Dispatch Handler
  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetTruck = trucks.find((t) => t.id === newDispatchTruck);
      await ApiClient.createDispatch({
        truckId: newDispatchTruck,
        operatorName: targetTruck?.operatorName || 'Assigned Driver',
        shovelId: newDispatchShovel,
        dumpLocation: newDispatchDump,
        materialType: newDispatchMaterial,
        targetTonnage: Number(newDispatchTonnage),
        actualTonnage: Number(newDispatchTonnage),
        status: 'In Progress',
      });

      // Update truck status to Hauling
      await ApiClient.updateTruckStatus(newDispatchTruck, {
        status: 'Hauling',
        currentLocation: `${newDispatchShovel} (En Route)`,
        destination: newDispatchDump,
        currentPayloadTons: Number(newDispatchTonnage),
      });

      setShowDispatchModal(false);
      await loadData(true);
    } catch (err) {
      console.error('Failed to create dispatch:', err);
    }
  };

  // Resolve Alert Handler
  const handleResolveAlert = async (alertId: string) => {
    try {
      await ApiClient.resolveAlert(alertId);
      await loadData(true);
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  // Reset Factory Seed Data
  const handleResetData = async () => {
    if (confirm('Reset fleet data back to original demonstration status?')) {
      await ApiClient.resetDatabase();
      await loadData();
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      'Truck ID',
      'Model',
      'Operator',
      'Status',
      'Payload (Tons)',
      'Capacity (Tons)',
      'Location',
      'Fuel Level (%)',
      'Speed (km/h)',
      'Brake Temp (°C)',
    ];
    const rows = trucks.map((t) => [
      t.id,
      t.model,
      t.operatorName,
      t.status,
      t.currentPayloadTons,
      t.nominalCapacityTons,
      `"${t.currentLocation}"`,
      t.fuelLevelPct,
      t.speedKmh,
      t.brakeTempCelsius,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TireGuard_AI_Shift_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter trucks list
  const filteredTrucks = trucks.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OVERLOAD' && t.overloadWarning) ||
      t.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="relative z-10 min-h-screen text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ============================================================== */}
        {/* TOP OPERATIONS CONTROL BAR                                    */}
        {/* ============================================================== */}
        <div className="bg-[#101522]/90 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-xl backdrop-blur-md mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Feed Active</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.siteId}</span>
              <span aria-hidden="true">·</span>
              <span>Shift Alpha (06:00 - 18:00)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              TireGuard <span className="text-amber-400">AI</span> Operations Console
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowAddTruckModal(true)}
              className="px-3 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Dumper</span>
            </button>

            <button
              onClick={() => setShowDispatchModal(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dispatch Run</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Export Shift CSV Data"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => loadData()}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleResetData}
              className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* KPI TELEMETRY METRIC RIBBON                                    */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-[#121824]/90 border border-slate-800 p-4 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Shift Tonnage</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {stats ? (stats.totalShiftTonnage).toLocaleString() : '18,450'}
              <span className="text-xs text-slate-400 font-normal ml-1">Tons</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    stats ? (stats.totalShiftTonnage / stats.targetShiftTonnage) * 100 : 77
                  )}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Target: 24,000 Tons (77%)
            </div>
          </div>

          <div className="bg-[#121824]/90 border border-slate-800 p-4 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Active Haulers</span>
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {stats ? `${stats.activeHauling + stats.loadingCount} / ${stats.totalTrucks}` : '5 / 6'}
              <span className="text-xs text-emerald-400 font-normal ml-1">Live</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2">
              {stats?.maintenanceCount || 1} in Maintenance Bay
            </div>
          </div>

          <div className="bg-[#121824]/90 border border-slate-800 p-4 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Avg Cycle Time</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {stats ? stats.avgCycleTimeMinutes : '23.4'}
              <span className="text-xs text-slate-400 font-normal ml-1">min</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-2">
              -1.8 min vs target (-7.1%)
            </div>
          </div>

          <div className="bg-[#121824]/90 border border-slate-800 p-4 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Fleet Fuel Burn</span>
              <Fuel className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {stats ? stats.avgFleetFuelLph : '198'}
              <span className="text-xs text-slate-400 font-normal ml-1">L/hr</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-2">
              Eco Grade Retard Active
            </div>
          </div>

          <div className="bg-[#121824]/90 border border-slate-800 p-4 rounded-lg col-span-2 lg:col-span-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Safety Alerts</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
              {stats?.activeAlertsCount || alerts.filter((a) => !a.resolved).length}
              <span className="text-xs text-slate-400 font-normal ml-1">Active</span>
            </div>
            <div className="text-[10px] text-rose-300 font-mono mt-2">
              {trucks.filter((t) => t.overloadWarning).length} Overloaded Truck(s)
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE NAVIGATION TABS                                   */}
        {/* ============================================================== */}
        <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-amber-400/15 border-b-2 border-amber-400 text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Fleet Dispatch Board ({filteredTrucks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telematics')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'telematics'
                ? 'bg-amber-400/15 border-b-2 border-amber-400 text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Telematics & Payload Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-amber-400/15 border-b-2 border-amber-400 text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Haul Road Cycles & Shovels</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-amber-400/15 border-b-2 border-amber-400 text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Safety Console ({alerts.filter((a) => !a.resolved).length})</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: FLEET DISPATCH BOARD                                   */}
        {/* ============================================================== */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101522]/90 p-3 rounded-lg border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Dumper ID (e.g. DT-101), Operator, or Model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Segmented Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'Hauling', 'Loading', 'Dumping', 'Empty Return', 'Maintenance', 'OVERLOAD'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                      statusFilter === st
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {st === 'OVERLOAD' ? '⚠️ Overloaded' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Trucks Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrucks.map((truck) => {
                const isOverloaded = truck.currentPayloadTons > truck.nominalCapacityTons;
                const isSelected = truck.id === selectedTruckId;

                return (
                  <div
                    key={truck.id}
                    className={`bg-[#101522]/95 border rounded-xl p-4 transition-all ${
                      isSelected
                        ? 'border-amber-400 shadow-lg shadow-amber-950/20'
                        : isOverloaded
                        ? 'border-rose-500/60 shadow-md shadow-rose-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Top Title Row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg font-bold text-white tracking-wide">
                            {truck.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${
                              truck.status === 'Hauling'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : truck.status === 'Loading'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : truck.status === 'Dumping'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : truck.status === 'Maintenance'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {truck.status}
                          </span>
                          {isOverloaded && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded animate-pulse">
                              OVERLOAD
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {truck.model} · Op: <strong className="text-slate-200">{truck.operatorName}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTruckId(truck.id);
                          setActiveTab('telematics');
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-900 border border-slate-800 rounded transition-colors"
                        title="Open Diagnostics"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Payload Weight Bar */}
                    <div className="mt-3 bg-slate-900/90 p-2.5 rounded border border-slate-800/80">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Payload Weight</span>
                        <span className={isOverloaded ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {truck.currentPayloadTons} / {truck.nominalCapacityTons} Tons
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverloaded
                              ? 'bg-rose-500'
                              : truck.currentPayloadTons === 0
                              ? 'bg-slate-600'
                              : 'bg-amber-400'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (truck.currentPayloadTons / truck.nominalCapacityTons) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Telemetry Micro Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-slate-900/70 p-1.5 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono">SPEED</div>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {truck.speedKmh} km/h
                        </div>
                      </div>
                      <div className="bg-slate-900/70 p-1.5 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono">BRAKE OIL</div>
                        <div
                          className={`text-xs font-mono font-bold ${
                            truck.brakeTempCelsius > 180 ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          {truck.brakeTempCelsius}°C
                        </div>
                      </div>
                      <div className="bg-slate-900/70 p-1.5 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono">FUEL</div>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {truck.fuelLevelPct}%
                        </div>
                      </div>
                    </div>

                    {/* Location & Destination */}
                    <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{truck.currentLocation}</span>
                      </div>
                    </div>

                    {/* Interactive Dispatch Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <select
                        value={truck.status}
                        onChange={(e) => handleUpdateStatus(truck.id, e.target.value as TruckStatus)}
                        className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="Hauling">Dispatch: Hauling</option>
                        <option value="Loading">Dispatch: Loading</option>
                        <option value="Dumping">Dispatch: Dumping</option>
                        <option value="Empty Return">Dispatch: Return</option>
                        <option value="Maintenance">Bay: Maintenance</option>
                        <option value="Standby">Staging: Standby</option>
                      </select>

                      <button
                        onClick={() => {
                          setSelectedTruckId(truck.id);
                          setActiveTab('telematics');
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TELEMATICS & PAYLOAD DIAGNOSTIC INSPECTOR              */}
        {/* ============================================================== */}
        {activeTab === 'telematics' && selectedTruck && (
          <div className="space-y-6">
            {/* Truck Selector Header */}
            <div className="bg-[#101522]/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase">Forensic Diagnostics</span>
                <h3 className="text-xl font-bold font-display text-white mt-0.5">
                  Telematics Inspector: {selectedTruck.id} ({selectedTruck.model})
                </h3>
                <div className="text-xs text-slate-400">
                  Assigned Operator: <strong className="text-slate-200">{selectedTruck.operatorName}</strong> ·
                  Engine Hours: <span className="font-mono text-slate-200">{selectedTruck.engineHours} hrs</span>
                </div>
              </div>

              {/* Truck Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Select Hauler:</span>
                <select
                  value={selectedTruck.id}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.model} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Diagnostics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: 6-Wheel TPMS Visualizer */}
              <div className="bg-[#101522]/90 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold font-display text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>6-Wheel TPMS Tire Telemetry</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">59/80R63 Radial</span>
                </div>

                {/* Truck Chassis Tire Placement Diagram */}
                <div className="relative bg-slate-950 p-6 rounded-lg border border-slate-800 flex flex-col items-center">
                  {/* Front Steer Axle */}
                  <div className="w-full flex justify-between px-6 mb-12">
                    {/* Front Left */}
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-400">FL (Steer)</div>
                      <div className="w-12 h-20 rounded-md bg-slate-900 border-2 border-emerald-500 flex flex-col items-center justify-center p-1 mt-1 shadow-md">
                        <span className="text-[11px] font-bold font-mono text-white">
                          {selectedTruck.tires[0]?.pressurePsi || 104}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">PSI</span>
                        <span className="text-[10px] text-emerald-400 font-mono mt-1">
                          {selectedTruck.tires[0]?.tempCelsius || 68}°C
                        </span>
                      </div>
                    </div>

                    {/* Front Chassis Axis */}
                    <div className="w-20 h-4 bg-slate-800 self-center rounded-sm" />

                    {/* Front Right */}
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-400">FR (Steer)</div>
                      <div className="w-12 h-20 rounded-md bg-slate-900 border-2 border-emerald-500 flex flex-col items-center justify-center p-1 mt-1 shadow-md">
                        <span className="text-[11px] font-bold font-mono text-white">
                          {selectedTruck.tires[1]?.pressurePsi || 105}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">PSI</span>
                        <span className="text-[10px] text-emerald-400 font-mono mt-1">
                          {selectedTruck.tires[1]?.tempCelsius || 70}°C
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rear Dual Drive Axle */}
                  <div className="w-full flex justify-between px-2">
                    {/* Rear Left Duals */}
                    <div className="flex gap-1.5 text-center">
                      <div>
                        <div className="text-[9px] font-mono text-slate-400">RL-Out</div>
                        <div
                          className={`w-11 h-20 rounded-md bg-slate-900 border-2 flex flex-col items-center justify-center p-1 mt-1 shadow-md ${
                            selectedTruck.tires[2]?.status === 'critical'
                              ? 'border-rose-500 animate-pulse'
                              : 'border-emerald-500'
                          }`}
                        >
                          <span className="text-[11px] font-bold font-mono text-white">
                            {selectedTruck.tires[2]?.pressurePsi || 106}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">PSI</span>
                          <span
                            className={`text-[10px] font-mono mt-1 ${
                              selectedTruck.tires[2]?.tempCelsius > 85
                                ? 'text-rose-400 font-bold'
                                : 'text-emerald-400'
                            }`}
                          >
                            {selectedTruck.tires[2]?.tempCelsius || 73}°C
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] font-mono text-slate-400">RL-In</div>
                        <div className="w-11 h-20 rounded-md bg-slate-900 border-2 border-emerald-500 flex flex-col items-center justify-center p-1 mt-1 shadow-md">
                          <span className="text-[11px] font-bold font-mono text-white">
                            {selectedTruck.tires[3]?.pressurePsi || 105}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">PSI</span>
                          <span className="text-[10px] text-emerald-400 font-mono mt-1">
                            {selectedTruck.tires[3]?.tempCelsius || 74}°C
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rear Drive Axle Differential */}
                    <div className="w-16 h-6 bg-slate-800 self-center rounded flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-slate-700" />
                    </div>

                    {/* Rear Right Duals */}
                    <div className="flex gap-1.5 text-center">
                      <div>
                        <div className="text-[9px] font-mono text-slate-400">RR-In</div>
                        <div className="w-11 h-20 rounded-md bg-slate-900 border-2 border-emerald-500 flex flex-col items-center justify-center p-1 mt-1 shadow-md">
                          <span className="text-[11px] font-bold font-mono text-white">
                            {selectedTruck.tires[4]?.pressurePsi || 106}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">PSI</span>
                          <span className="text-[10px] text-emerald-400 font-mono mt-1">
                            {selectedTruck.tires[4]?.tempCelsius || 72}°C
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] font-mono text-slate-400">RR-Out</div>
                        <div
                          className={`w-11 h-20 rounded-md bg-slate-900 border-2 flex flex-col items-center justify-center p-1 mt-1 shadow-md ${
                            selectedTruck.tires[5]?.status === 'critical'
                              ? 'border-rose-500 animate-pulse'
                              : 'border-emerald-500'
                          }`}
                        >
                          <span className="text-[11px] font-bold font-mono text-white">
                            {selectedTruck.tires[5]?.pressurePsi || 104}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">PSI</span>
                          <span
                            className={`text-[10px] font-mono mt-1 ${
                              selectedTruck.tires[5]?.tempCelsius > 85
                                ? 'text-rose-400 font-bold'
                                : 'text-emerald-400'
                            }`}
                          >
                            {selectedTruck.tires[5]?.tempCelsius || 71}°C
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-400 font-mono flex items-center justify-between">
                  <span>Inflation Spec: 102 - 108 PSI</span>
                  <span className="text-emerald-400">Cold Inflation Nominal</span>
                </div>
              </div>

              {/* Middle Column: Payload & Axle Load Distribution */}
              <div className="bg-[#101522]/90 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <h4 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Strut Load Cells & Axle Balance</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">ISO 21815</span>
                  </div>

                  {/* Payload Stat */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <span className="text-xs font-mono text-slate-400 uppercase">Gross Payload Weight</span>
                    <div
                      className={`text-3xl font-extrabold font-mono mt-1 ${
                        selectedTruck.overloadWarning ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {selectedTruck.currentPayloadTons} <span className="text-base font-normal text-slate-400">/ {selectedTruck.nominalCapacityTons} Tons</span>
                    </div>

                    {selectedTruck.overloadWarning && (
                      <div className="mt-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2 rounded">
                        ⚠️ EXCEEDS STRUCTURAL LIMIT BY {(selectedTruck.currentPayloadTons - selectedTruck.nominalCapacityTons).toFixed(1)} TONS
                      </div>
                    )}
                  </div>

                  {/* Axle Split Bar */}
                  <div className="mt-5 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300">
                        <span>Front Steer Axle Load:</span>
                        <span className="text-amber-300">{selectedTruck.frontAxleLoadPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded mt-1 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded"
                          style={{ width: `${selectedTruck.frontAxleLoadPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300">
                        <span>Rear Drive Axle Load:</span>
                        <span className="text-amber-300">{selectedTruck.rearAxleLoadPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded mt-1 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded"
                          style={{ width: `${selectedTruck.rearAxleLoadPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-slate-900 rounded border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <strong>10/10/20 Mining Payload Rule:</strong> No more than 10% of loads should exceed 110% of target payload, and zero loads may exceed 120%.
                </div>
              </div>

              {/* Right Column: Incline Grade, Retarder & Hoist Control */}
              <div className="bg-[#101522]/90 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <h4 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      <span>Grade Incline & Hydraulics</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">Live Sensors</span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400">HAUL ROAD GRADE</span>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">
                          {selectedTruck.roadGradeInclinePct > 0 ? `+${selectedTruck.roadGradeInclinePct}%` : `${selectedTruck.roadGradeInclinePct}%`}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-slate-400">SLOPE STATUS</span>
                        <div className="text-xs font-semibold text-amber-400 mt-0.5">
                          {Math.abs(selectedTruck.roadGradeInclinePct) > 7 ? 'Steep Ramp Alert' : 'Standard Grade'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400">BRAKE RETARDER OIL</span>
                        <div
                          className={`text-xl font-bold font-mono mt-0.5 ${
                            selectedTruck.brakeTempCelsius > 180 ? 'text-rose-400' : 'text-slate-100'
                          }`}
                        >
                          {selectedTruck.brakeTempCelsius}°C
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-slate-400">COOLING OIL</span>
                        <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                          {selectedTruck.brakeTempCelsius > 180 ? 'High Heat Risk' : 'Thermal Nominal'}
                        </div>
                      </div>
                    </div>

                    {/* Hydraulic Hoist Simulation Control */}
                    <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-mono text-slate-400">HYDRAULIC BED HOIST</span>
                        <span className="text-xs font-bold font-mono text-amber-400">
                          {selectedTruck.hydraulicBedAngleDeg}° Tilt
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            ApiClient.updateTruckStatus(selectedTruck.id, {
                              hydraulicBedAngleDeg: 0,
                              status: 'Hauling',
                            }).then(() => loadData(true))
                          }
                          className="flex-1 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200"
                        >
                          Lower Bed (0°)
                        </button>
                        <button
                          onClick={() =>
                            ApiClient.updateTruckStatus(selectedTruck.id, {
                              hydraulicBedAngleDeg: 45,
                              status: 'Dumping',
                              currentPayloadTons: 0,
                            }).then(() => loadData(true))
                          }
                          className="flex-1 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-amber-300"
                        >
                          Raise & Dump (45°)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      const nextOverload = !selectedTruck.overloadWarning;
                      ApiClient.updateTruck(selectedTruck.id, {
                        currentPayloadTons: nextOverload ? selectedTruck.nominalCapacityTons + 35 : selectedTruck.nominalCapacityTons - 10,
                      }).then(() => loadData(true));
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
                  >
                    Simulate Load Cell Sensor Tonnage Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: HAUL ROUTE CYCLES & SHOVEL ALLOCATION                  */}
        {/* ============================================================== */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Shovel 1 */}
              <div className="bg-[#101522]/90 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400">PIT BENCH -280M</span>
                    <h4 className="text-base font-bold text-white mt-0.5">Electric Shovel #01</h4>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 rounded">
                    Operating
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Material:</span>
                    <span className="text-amber-400">High-Grade Copper Ore</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Trucks:</span>
                    <span className="text-slate-100">
                      {trucks.filter((t) => t.destination.includes('Shovel #01') || t.currentLocation.includes('Shovel #01')).length} Trucks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Spot Time:</span>
                    <span className="text-slate-100">42 sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycle Rate:</span>
                    <span className="text-slate-100">1,850 T / hr</span>
                  </div>
                </div>
              </div>

              {/* Shovel 2 */}
              <div className="bg-[#101522]/90 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400">NORTH BENCH -190M</span>
                    <h4 className="text-base font-bold text-white mt-0.5">Excavator Shovel #02</h4>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 rounded">
                    Operating
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Material:</span>
                    <span className="text-amber-400">Run-of-Mine Iron Ore</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Trucks:</span>
                    <span className="text-slate-100">
                      {trucks.filter((t) => t.destination.includes('Shovel #02') || t.currentLocation.includes('Shovel #02')).length} Trucks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Spot Time:</span>
                    <span className="text-slate-100">38 sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycle Rate:</span>
                    <span className="text-slate-100">1,420 T / hr</span>
                  </div>
                </div>
              </div>

              {/* Primary Crusher */}
              <div className="bg-[#101522]/90 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono text-amber-400">SURFACE PROCESS PLANT</span>
                    <h4 className="text-base font-bold text-white mt-0.5">Primary Gyratory Crusher</h4>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 rounded">
                    Receiving
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Pocket Level:</span>
                    <span className="text-amber-400">68% Capacity</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipping Cycle:</span>
                    <span className="text-slate-100">2.1 min avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queue Length:</span>
                    <span className="text-emerald-400">1 Truck waiting</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crush Rate:</span>
                    <span className="text-slate-100">3,200 T / hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Haul Dispatches Table */}
            <div className="bg-[#101522]/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold font-display text-white">
                  Completed & Active Haul Cycles
                </h4>
                <button
                  onClick={() => setShowDispatchModal(true)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Schedule New Run
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Run ID</th>
                      <th className="py-2.5 px-3">Truck</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Material</th>
                      <th className="py-2.5 px-3 text-right">Tonnage</th>
                      <th className="py-2.5 px-3 text-right">Cycle Time</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dispatches.map((dsp) => (
                      <tr key={dsp.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3 text-amber-400 font-bold">{dsp.id}</td>
                        <td className="py-2.5 px-3 text-slate-100 font-bold">{dsp.truckId}</td>
                        <td className="py-2.5 px-3 text-slate-300">{dsp.operatorName}</td>
                        <td className="py-2.5 px-3 text-slate-300">{dsp.materialType}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                          {dsp.actualTonnage} T
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                          {dsp.cycleTimeMinutes} min
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dsp.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300 animate-pulse'
                            }`}
                          >
                            {dsp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SAFETY & INCIDENT ALERT CONSOLE                        */}
        {/* ============================================================== */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div className="bg-[#101522]/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-display text-white">
                  Active Mining & Haulage Incidents
                </h4>
                <p className="text-xs text-slate-400">
                  Telemetry anomalies detected across tire pressure, slope grade, and structural payload weight.
                </p>
              </div>

              <button
                onClick={() => {
                  ApiClient.createAlert({
                    truckId: 'DT-101',
                    severity: 'WARNING',
                    category: 'GRADE_SPEED',
                    title: 'Speed Limit Exceeded on Ramp Decline',
                    description: 'DT-101 registered 34 km/h descending 8% ramp. Speed limit is 25 km/h.',
                  }).then(() => loadData(true));
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded transition-colors"
              >
                + Simulate Safety Alert
              </button>
            </div>

            <div className="space-y-3">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    alt.resolved
                      ? 'bg-slate-900/50 border-slate-800/80 opacity-60'
                      : alt.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-950/20'
                      : 'bg-amber-950/20 border-amber-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-rose-500 text-white'
                          : alt.severity === 'WARNING'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-cyan-500 text-slate-950'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{alt.title}</span>
                        <span className="font-mono text-xs text-amber-400 font-bold">
                          [{alt.truckId}]
                        </span>
                        {alt.resolved && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            RESOLVED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alt.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Reported: {new Date(alt.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {!alt.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: REGISTER NEW DUMPER TRUCK                               */}
      {/* ============================================================== */}
      {showAddTruckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101522] border border-amber-500/40 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-1">
              Commission New Dumper Truck
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new heavy hauler to the mining fleet telemetry database.
            </p>

            <form onSubmit={handleCreateTruck} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Truck ID</label>
                <input
                  type="text"
                  placeholder="e.g. DT-107"
                  value={newTruckId}
                  onChange={(e) => setNewTruckId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model Class</label>
                <select
                  value={newTruckModel}
                  onChange={(e) => {
                    setNewTruckModel(e.target.value);
                    if (e.target.value.includes('797F')) setNewTruckCapacity(400);
                    else if (e.target.value.includes('930E')) setNewTruckCapacity(320);
                    else if (e.target.value.includes('284')) setNewTruckCapacity(363);
                    else if (e.target.value.includes('75710')) setNewTruckCapacity(450);
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Caterpillar 797F">Caterpillar 797F (400 Ton)</option>
                  <option value="Komatsu 930E-5">Komatsu 930E-5 (320 Ton)</option>
                  <option value="Liebherr T 284">Liebherr T 284 (363 Ton)</option>
                  <option value="BelAZ 75710">BelAZ 75710 (450 Ton)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Operator</label>
                <input
                  type="text"
                  placeholder="Driver Full Name"
                  required
                  value={newTruckOperator}
                  onChange={(e) => setNewTruckOperator(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nominal Capacity (Metric Tons)
                </label>
                <input
                  type="number"
                  value={newTruckCapacity}
                  onChange={(e) => setNewTruckCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTruckModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DISPATCH NEW HAUL RUN                                   */}
      {/* ============================================================== */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101522] border border-amber-500/40 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-1">
              Schedule New Haul Dispatch
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Direct a dumper truck to an excavator shovel and target dumping facility.
            </p>

            <form onSubmit={handleCreateDispatch} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Dumper Truck</label>
                <select
                  value={newDispatchTruck}
                  onChange={(e) => setNewDispatchTruck(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} ({t.model}) - Status: {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Extraction Shovel</label>
                <select
                  value={newDispatchShovel}
                  onChange={(e) => setNewDispatchShovel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Electric Shovel #01">Electric Shovel #01 (Pit Bench -280m)</option>
                  <option value="Excavator Shovel #02">Excavator Shovel #02 (North Bench -190m)</option>
                  <option value="Hydraulic Shovel #03">Hydraulic Shovel #03 (East Wall -120m)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dumping Destination</label>
                <select
                  value={newDispatchDump}
                  onChange={(e) => setNewDispatchDump(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Primary Gyratory Crusher #01">Primary Gyratory Crusher #01</option>
                  <option value="Run-of-Mine Stockpile #2">Run-of-Mine Stockpile #2</option>
                  <option value="North Waste Overburden Dump">North Waste Overburden Dump</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Material Type</label>
                <select
                  value={newDispatchMaterial}
                  onChange={(e) => setNewDispatchMaterial(e.target.value as DispatchRun['materialType'])}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="High-Grade Copper Ore">High-Grade Copper Ore</option>
                  <option value="Iron Ore Run-of-Mine">Iron Ore Run-of-Mine</option>
                  <option value="Overburden Waste">Overburden Waste</option>
                  <option value="Aggregate Gravel">Aggregate Gravel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Payload Tonnage</label>
                <input
                  type="number"
                  value={newDispatchTonnage}
                  onChange={(e) => setNewDispatchTonnage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow"
                >
                  Dispatch Hauler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
