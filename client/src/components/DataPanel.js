import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Package,
  Thermometer,
  TrendingUp,
  AlertCircle,
  Plane,
  MapPin,
  RefreshCw,
  Map
} from 'lucide-react';
import FlightMap from './FlightMap';

const DataPanel = ({ role, scenario }) => {
  const [flightData, setFlightData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [demandData, setDemandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flights, inventory, demand] = await Promise.all([
        axios.get('/api/data/flights'),
        axios.get('/api/data/inventory'),
        axios.get('/api/data/demand')
      ]);
      
      setFlightData(flights.data.data);
      setInventoryData(inventory.data.data);
      setDemandData(demand.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'map', label: 'Map' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'flights', label: 'Flights' }
  ];

  // Prepare inventory chart data
  const inventoryChartData = inventoryData ? Object.entries(inventoryData).map(([id, data]) => ({
    name: id.split('-')[0],
    suzetrigine: data.suzetrigine_units / 1000,
    trikafta: data.trikafta_units / 1000,
    cryo: data.cryo_available
  })) : [];

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'GROUNDED': return 'text-critical-500';
      case 'DELAYED': return 'text-warning-500';
      case 'IN_TRANSIT': return 'text-success-500';
      default: return 'text-neutral-400';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return 'text-critical-500 bg-critical-500/10';
      case 'MEDIUM': return 'text-warning-500 bg-warning-500/10';
      case 'LOW': return 'text-success-500 bg-success-500/10';
      default: return 'text-neutral-400 bg-neutral-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
            Live Data Feed
          </h2>
          <button
            onClick={fetchData}
            className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-800/50 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-vertex-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={Plane}
                label="Active Flights"
                value={flightData ? Object.keys(flightData).length : '-'}
                color="vertex"
              />
              <StatCard
                icon={AlertCircle}
                label="Alerts"
                value={flightData ? Object.values(flightData).filter(f => f.status !== 'IN_TRANSIT').length : '-'}
                color="critical"
              />
              <StatCard
                icon={Package}
                label="Depots"
                value={inventoryData ? Object.keys(inventoryData).length : '-'}
                color="success"
              />
              <StatCard
                icon={TrendingUp}
                label="High Risk"
                value={demandData ? Object.values(demandData).filter(d => d.stockout_risk === 'HIGH').length : '-'}
                color="warning"
              />
            </div>

            {/* Demand Signals */}
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <h3 className="text-xs font-mono text-neutral-500 uppercase mb-3">
                Regional Stockout Risk
              </h3>
              <div className="space-y-2">
                {demandData && Object.entries(demandData).map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">{data.region}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(data.stockout_risk)}`}>
                      {data.stockout_risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Status Summary */}
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <h3 className="text-xs font-mono text-neutral-500 uppercase mb-3">
                Flight Status
              </h3>
              <div className="space-y-2">
                {flightData && Object.entries(flightData).map(([id, data]) => (
                  <div key={id} className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-400">{id}</span>
                    <span className={`text-xs font-medium ${getStatusColor(data.status)}`}>
                      {data.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-64">
            <FlightMap flightData={flightData} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Inventory Chart */}
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <h3 className="text-xs font-mono text-neutral-500 uppercase mb-3">
                Inventory Levels (K units)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryChartData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="suzetrigine" name="Suzetrigine" fill="#3377ff" radius={2} />
                    <Bar dataKey="trikafta" name="Trikafta" fill="#10b981" radius={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cryo Capacity */}
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <h3 className="text-xs font-mono text-neutral-500 uppercase mb-3 flex items-center gap-2">
                <Thermometer className="w-3 h-3" />
                Cryo Capacity
              </h3>
              <div className="space-y-3">
                {inventoryData && Object.entries(inventoryData).map(([id, data]) => {
                  const utilization = ((data.cryo_capacity - data.cryo_available) / data.cryo_capacity) * 100;
                  return (
                    <div key={id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-400">{data.location.split(' ')[0]}</span>
                        <span className="text-neutral-300">
                          {data.cryo_available}/{data.cryo_capacity} slots
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            utilization > 80 ? 'bg-critical-500' :
                            utilization > 60 ? 'bg-warning-500' :
                            'bg-success-500'
                          }`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Depot Details */}
            <div className="space-y-2">
              {inventoryData && Object.entries(inventoryData).map(([id, data]) => (
                <div key={id} className="bg-neutral-800/30 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-100">{id}</h4>
                      <p className="text-xs text-neutral-500">{data.location}</p>
                    </div>
                    <MapPin className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500">Suzetrigine</span>
                      <p className="text-neutral-200 font-mono">{data.suzetrigine_units.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Trikafta</span>
                      <p className="text-neutral-200 font-mono">{data.trikafta_units.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flights' && (
          <div className="space-y-3">
            {flightData && Object.entries(flightData).map(([id, data]) => (
              <div 
                key={id} 
                className={`rounded-lg p-3 border ${
                  data.status === 'GROUNDED' 
                    ? 'bg-critical-500/10 border-critical-500/30' 
                    : data.status === 'DELAYED'
                      ? 'bg-warning-500/10 border-warning-500/30'
                      : 'bg-neutral-800/30 border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Plane className={`w-4 h-4 ${getStatusColor(data.status)}`} />
                    <span className="font-mono text-sm text-neutral-100">{id}</span>
                  </div>
                  <span className={`text-xs font-medium ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Location</span>
                    <span className="text-neutral-300">{data.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Destination</span>
                    <span className="text-neutral-300">{data.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Cargo</span>
                    <span className="text-neutral-300">{data.cargo}</span>
                  </div>
                  {data.delay_reason && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Delay Reason</span>
                      <span className="text-warning-400">{data.delay_reason}</span>
                    </div>
                  )}
                  {data.cryo_expiry && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Cryo Expiry</span>
                      <span className="text-critical-400 font-mono">
                        {new Date(data.cryo_expiry).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {data.patient_id && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Patient ID</span>
                      <span className="text-vertex-400 font-mono">{data.patient_id}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    vertex: 'text-vertex-400 bg-vertex-500/10',
    critical: 'text-critical-400 bg-critical-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    success: 'text-success-400 bg-success-500/10'
  };

  return (
    <div className="bg-neutral-800/30 rounded-lg p-3">
      <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-mono font-bold text-neutral-100">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
};

export default DataPanel;
