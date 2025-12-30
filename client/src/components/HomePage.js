import React from 'react';
import { 
  Plane, 
  GraduationCap, 
  ChevronRight,
  Zap,
  Target,
  BookOpen
} from 'lucide-react';

const HomePage = ({ onSelectSimulation, onSelectTestPrep, onSelectFlashcards }) => {
  return (
    <div className="min-h-screen flex flex-col">
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

          {/* Three Options */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Flashcard Study Card */}
            <button
              onClick={onSelectFlashcards}
              className="group relative p-6 rounded-2xl border-2 border-neutral-800 bg-neutral-900/50 
                hover:border-vertex-500 hover:bg-vertex-500/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6 text-vertex-400" />
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-vertex-500/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-vertex-400" />
              </div>
              
              <h3 className="text-xl font-display font-bold text-neutral-100 mb-2">
                Study Flashcards
              </h3>
              
              <p className="text-neutral-400 text-sm mb-4">
                Review key concepts with interactive flashcards. Filter by category and track your progress.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  158 Cards
                </span>
                <span className="px-2 py-1 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  Self-Paced
                </span>
              </div>
            </button>

            {/* Test Prep Card */}
            <button
              onClick={onSelectTestPrep}
              className="group relative p-6 rounded-2xl border-2 border-neutral-800 bg-neutral-900/50 
                hover:border-vertex-500 hover:bg-vertex-500/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6 text-vertex-400" />
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-vertex-500/20 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-vertex-400" />
              </div>
              
              <h3 className="text-xl font-display font-bold text-neutral-100 mb-2">
                Knowledge Test
              </h3>
              
              <p className="text-neutral-400 text-sm mb-4">
                Adaptive testing with AI grading. Identifies weak areas and creates personalized study plans.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  AI Grading
                </span>
                <span className="px-2 py-1 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  Adaptive
                </span>
              </div>
            </button>

            {/* Simulation Card */}
            <button
              onClick={onSelectSimulation}
              className="group relative p-6 rounded-2xl border-2 border-neutral-800 bg-neutral-900/50 
                hover:border-vertex-500 hover:bg-vertex-500/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6 text-vertex-400" />
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-vertex-500/20 flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-vertex-400" />
              </div>
              
              <h3 className="text-xl font-display font-bold text-neutral-100 mb-2">
                Scenario Training
              </h3>
              
              <p className="text-neutral-400 text-sm mb-4">
                Experience realistic supply chain crisis scenarios. Make decisions under pressure with AI feedback.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-neutral-800 rounded-full text-xs text-neutral-400">
                  Role-Playing
                </span>
                <span className="px-2 py-1 bg-neutral-800 rounded-full text-xs text-neutral-400">
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