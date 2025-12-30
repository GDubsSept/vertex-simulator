import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SimulationInterface from './components/SimulationInterface';
import HomePage from './components/HomePage';
import TestPrep from './components/TestPrep';
import FlashcardStudy from './components/FlashcardStudy';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); // home | simulation-landing | simulation | test-prep | completed
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [grade, setGrade] = useState(null);

  const handleStartSimulation = (role, difficulty) => {
    setSelectedRole(role);
    setSelectedDifficulty(difficulty);
    setCurrentPage('simulation');
  };

  const handleSimulationComplete = (gradeData) => {
    setGrade(gradeData);
    setCurrentPage('completed');
  };

  const handleRestart = () => {
    setCurrentPage('simulation-landing');
    setSelectedRole(null);
    setSelectedDifficulty(null);
    setGrade(null);
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    setSelectedRole(null);
    setSelectedDifficulty(null);
    setGrade(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 grid-bg">
      {currentPage === 'home' && (
        <HomePage 
          onSelectSimulation={() => setCurrentPage('simulation-landing')}
          onSelectTestPrep={() => setCurrentPage('test-prep')}
          onSelectFlashcards={() => setCurrentPage('flashcards')}
        />
      )}

      {currentPage === 'simulation-landing' && (
        <LandingPage 
          onStartSimulation={handleStartSimulation} 
          onBack={handleGoHome}
        />
      )}
      
      {currentPage === 'simulation' && (
        <SimulationInterface
          role={selectedRole}
          difficulty={selectedDifficulty}
          onComplete={handleSimulationComplete}
          onExit={handleRestart}
        />
      )}
      
      {currentPage === 'completed' && (
        <CompletionScreen 
          grade={grade} 
          role={selectedRole}
          onRestart={handleRestart}
          onHome={handleGoHome}
        />
      )}

      {currentPage === 'test-prep' && (
        <TestPrep onBack={handleGoHome} />
      )}

      {currentPage === 'flashcards' && (
        <FlashcardStudy onBack={handleGoHome} />
      )}
    </div>
  );
};

// Completion Screen Component
const CompletionScreen = ({ grade, role, onRestart, onHome }) => {
  const gradeColors = {
    'A': 'text-success-400 border-success-500',
    'B': 'text-vertex-400 border-vertex-500',
    'C': 'text-warning-400 border-warning-500',
    'D': 'text-critical-400 border-critical-500',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-100 mb-2">
            Simulation Complete
          </h1>
          <p className="text-neutral-400">
            {role === 'supply-chain-planner' ? 'Supply Chain Planner' : 'Quality Engineer'} Training Module
          </p>
        </div>

        {grade && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mb-6">
            {/* Grade Display */}
            <div className="flex items-center justify-center mb-8">
              <div className={`w-32 h-32 rounded-full border-4 ${gradeColors[grade.grade] || gradeColors['C']} flex items-center justify-center`}>
                <span className={`text-6xl font-display font-bold ${gradeColors[grade.grade]?.split(' ')[0] || 'text-neutral-400'}`}>
                  {grade.grade || '?'}
                </span>
              </div>
            </div>

            {/* Score */}
            {grade.score && (
              <div className="text-center mb-6">
                <span className="text-4xl font-mono font-bold text-neutral-100">{grade.score}</span>
                <span className="text-neutral-500">/100</span>
              </div>
            )}

            {/* Summary */}
            {grade.summary && (
              <p className="text-neutral-300 text-center mb-8">{grade.summary}</p>
            )}

            {/* Strengths */}
            {grade.strengths && grade.strengths.length > 0 && (
              <div className="mb-6">
                <h3 className="text-success-400 font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-success-400 rounded-full"></span>
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {grade.strengths.map((item, i) => (
                    <li key={i} className="text-neutral-300 text-sm pl-4">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {grade.improvements && grade.improvements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-warning-400 font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-warning-400 rounded-full"></span>
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {grade.improvements.map((item, i) => (
                    <li key={i} className="text-neutral-300 text-sm pl-4">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SOP References */}
            {grade.sop_references && grade.sop_references.length > 0 && (
              <div className="mb-6">
                <h3 className="text-vertex-400 font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-vertex-400 rounded-full"></span>
                  Relevant SOPs to Review
                </h3>
                <ul className="space-y-2">
                  {grade.sop_references.map((item, i) => (
                    <li key={i} className="text-neutral-300 text-sm pl-4 font-mono">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coaching Tips */}
            {grade.coaching_tips && grade.coaching_tips.length > 0 && (
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <h3 className="text-neutral-200 font-semibold mb-3">Coaching Tips</h3>
                <ul className="space-y-2">
                  {grade.coaching_tips.map((tip, i) => (
                    <li key={i} className="text-neutral-400 text-sm">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onHome}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-vertex-600 hover:bg-vertex-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Another Scenario
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;