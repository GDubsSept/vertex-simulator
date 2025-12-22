import React, { useState } from 'react';
import { 
  Plane, 
  FlaskConical, 
  Pill, 
  ChevronRight, 
  Zap, 
  Target,
  Shield,
  Clock,
  ArrowLeft
} from 'lucide-react';

const LandingPage = ({ onStartSimulation, onBack }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const roles = [
    {
      id: 'supply-chain-planner',
      title: 'Supply Chain Planner',
      subtitle: 'High Volume Launch',
      description: 'Manage demand sensing, inventory optimization, and distribution for Suzetrigine (VX-548) retail launch.',
      icon: Pill,
      scenarios: ['Demand spike response', 'Inter-depot transfers', 'Stockout prevention'],
      color: 'vertex'
    },
    {
      id: 'quality-engineer',
      title: 'Quality Engineer',
      subtitle: 'Cell & Gene Therapy',
      description: 'Oversee Chain of Identity, cryopreservation logistics, and patient safety for Casgevy therapies.',
      icon: FlaskConical,
      scenarios: ['Flight disruption', 'COI verification', 'Cryo-emergency protocol'],
      color: 'critical'
    }
  ];

  const difficulties = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Single issue, clear solution path, helpful hints provided',
      icon: Target,
      time: '10-15 min'
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Multiple factors, some ambiguity, time pressure',
      icon: Zap,
      time: '15-20 min'
    },
    {
      id: 'expert',
      title: 'Expert',
      description: 'Cascading failures, competing priorities, minimal guidance',
      icon: Shield,
      time: '20-30 min'
    }
  ];

  const handleStart = () => {
    if (selectedRole && selectedDifficulty) {
      onStartSimulation(selectedRole, selectedDifficulty);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-vertex-600 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold text-neutral-100">
                Vertex Supply Chain Command Center
              </h1>
              <p className="text-xs text-neutral-500 font-mono tracking-wide">
                // TRAINING MODULE v1.0
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-neutral-100 mb-4">
            Flight Simulator
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Train for high-stakes supply chain decisions with AI-powered scenario simulations 
            based on real Vertex pharmaceutical operations.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-12">
          <h3 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">
            Step 1: Select Your Role
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              const colorClasses = {
                vertex: {
                  border: isSelected ? 'border-vertex-500' : 'border-neutral-800 hover:border-neutral-700',
                  bg: isSelected ? 'bg-vertex-500/10' : 'bg-neutral-900/50',
                  icon: isSelected ? 'bg-vertex-500 text-white' : 'bg-neutral-800 text-neutral-400',
                  badge: 'bg-vertex-500/20 text-vertex-400'
                },
                critical: {
                  border: isSelected ? 'border-critical-500' : 'border-neutral-800 hover:border-neutral-700',
                  bg: isSelected ? 'bg-critical-500/10' : 'bg-neutral-900/50',
                  icon: isSelected ? 'bg-critical-500 text-white' : 'bg-neutral-800 text-neutral-400',
                  badge: 'bg-critical-500/20 text-critical-400'
                }
              };
              const colors = colorClasses[role.color];

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative p-6 rounded-xl border-2 ${colors.border} ${colors.bg} 
                    transition-all duration-300 text-left group card-hover`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-success-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${colors.icon} flex items-center justify-center transition-colors`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-neutral-100 mb-1">
                        {role.title}
                      </h4>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${colors.badge} mb-3`}>
                        {role.subtitle}
                      </span>
                      <p className="text-neutral-400 text-sm mb-4">
                        {role.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {role.scenarios.map((scenario, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-400"
                          >
                            {scenario}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-12">
          <h3 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">
            Step 2: Select Difficulty
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {difficulties.map((diff) => {
              const Icon = diff.icon;
              const isSelected = selectedDifficulty === diff.id;

              return (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 text-left
                    ${isSelected 
                      ? 'border-vertex-500 bg-vertex-500/10' 
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                      ${isSelected ? 'bg-vertex-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {diff.time}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-neutral-100 mb-1">
                    {diff.title}
                  </h4>
                  <p className="text-neutral-400 text-sm">
                    {diff.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={!selectedRole || !selectedDifficulty}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg
              transition-all duration-300 group
              ${selectedRole && selectedDifficulty
                ? 'bg-vertex-600 hover:bg-vertex-700 text-white cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
          >
            Begin Simulation
            <ChevronRight className={`w-5 h-5 transition-transform
              ${selectedRole && selectedDifficulty ? 'group-hover:translate-x-1' : ''}`} 
            />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Powered by PeakView Labs</span>
            <span className="font-mono">Build: 2024.12.22</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
