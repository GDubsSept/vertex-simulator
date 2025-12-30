import React, { useState } from 'react';
import { 
  Plane, 
  GraduationCap, 
  ChevronRight,
  Zap,
  Target,
  BookOpen,
  Compass
} from 'lucide-react';
import Tutorial from './Tutorial';

const HomePage = ({ onSelectSimulation, onSelectTestPrep, onSelectFlashcards }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tutorial Modal */}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-vertex-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold text-neutral-100">
                Vertex Training Platform
              </h1>
              <p className="text-xs text-neutral-500 font-mono tracking-wide">
                // SUPPLY CHAIN & AI TRAINING
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          {/* Hero */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-100 mb-4">
              Master
              <span className="block text-vertex-400">Supply Chain Excellence</span>
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Master supply chain concepts, AI architecture, and Vertex-specific knowledge 
              with AI-powered simulations and adaptive testing.
            </p>
          </div>

          {/* Four Options */}
          <div className="grid md:grid-cols-4 gap-4">
            {/* Platform Guide Card */}
            <button
              onClick={() => setShowTutorial(true)}
              className="group relative p-5 rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 
                hover:border-vertex-500 hover:bg-vertex-500/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-vertex-400" />
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-vertex-500/20 flex items-center justify-center mb-3 transition-colors">
                <Compass className="w-5 h-5 text-neutral-400 group-hover:text-vertex-400 transition-colors" />
              </div>
              
              <h3 className="text-lg font-display font-bold text-neutral-100 mb-1">
                Platform Guide
              </h3>
              
              <p className="text-neutral-500 text-sm mb-3">
                New here? Take a guided tour of all features.
              </p>
              
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-500">
                  5 min
                </span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-500">
                  Interactive
                </span>
              </div>
            </button>

            {/* Flashcard Study Card */}
            <button
              onClick={onSelectFlashcards}
              className="group relative p-5 rounded-2xl border-2 border-neutral-800 bg-neutral-900/50 
                hover:border-vertex-500 hover:bg-vertex-500/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-vertex-400" />
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-vertex-500/20 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-vertex-400" />
              </div>
              
              <h3 className="text-lg font-display font-bold text-neutral-100 mb-1">
                Study Flashcards
              </h3>
              
              <p className="text-neutral-400 text-sm mb-3">
                Review key concepts with interactive flashcards.
              </p>
              
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  158 Cards
                </span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  Self-Paced
                </span>
              </div>
            </button>

            {/* Test Prep Card */}
            <button
              onClick={onSelectTestPrep}
              className="group relative p-5 rounded-2xl border-2 border-neutral-800 bg-neutral-900/50 
                hover:border-vertex-500 hover:bg-vertex-500/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-vertex-400" />
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-vertex-500/20 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5 text-vertex-400" />
              </div>
              
              <h3 className="text-lg font-display font-bold text-neutral-100 mb-1">
                Knowledge Test
              </h3>
              
              <p className="text-neutral-400 text-sm mb-3">
                Adaptive testing with AI grading and feedback.
              </p>
              
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  AI Grading
                </span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  Adaptive
                </span>
              </div>
            </button>

            {/* Simulation Card */}
            <button
              onClick={onSelectSimulation}
              className="group relative p-5 rounded-2xl border-2 border-neutral-800 bg-neutral-900/50 
                hover:border-vertex-500 hover:bg-vertex-500/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-vertex-400" />
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-vertex-500/20 flex items-center justify-center mb-3">
                <Plane className="w-5 h-5 text-vertex-400" />
              </div>
              
              <h3 className="text-lg font-display font-bold text-neutral-100 mb-1">
                Scenario Training
              </h3>
              
              <p className="text-neutral-400 text-sm mb-3">
                Realistic crisis simulations with AI feedback.
              </p>
              
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  Role-Playing
                </span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  Real-time
                </span>
              </div>
            </button>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <FeatureBadge icon={Zap} text="AI-Powered" />
            <FeatureBadge icon={Target} text="Vertex-Specific" />
            <FeatureBadge icon={GraduationCap} text="Adaptive" />
            <FeatureBadge icon={Plane} text="Realistic" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Built by PeakView Labs</span>
            <span className="font-mono">v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureBadge = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-lg border border-neutral-800">
    <Icon className="w-4 h-4 text-vertex-400" />
    <span className="text-sm text-neutral-300">{text}</span>
  </div>
);

export default HomePage;