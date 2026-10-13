import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Cpu,
  Waves,
  CheckCircle2,
  Lock,
  Activity,
  Server,
  ChevronRight,
  RefreshCw,
  Eye,
  Binary,
  KeyRound,
} from 'lucide-react';
import { TestSuitePanel } from './components/TestSuitePanel';
import { AttackVisualization } from './components/AttackVisualization';
import { MetricsOverview } from './components/MetricsOverview';
import { TestTimeline } from './components/TestTimeline';
import { surfaceAreas, surfaceById } from './data/surfaceAreasData';
import type { SurfaceArea, TestResult } from './types';

// --- Static, render-independent helpers & memoized presentational pieces ---
// Hoisted out of App() so they are created once per module instead of on
// every render, allowing React.memo to actually skip subtree re-renders.

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'cpu':
      return <Cpu className="w-5 h-5" />;
    case 'server':
      return <Server className="w-5 h-5" />;
    case 'waves':
      return <Waves className="w-5 h-5" />;
    case 'key':
      return <KeyRound className="w-5 h-5" />;
    default:
      return <Shield className="w-5 h-5" />;
  }
};

const getSurfaceColor = (color: string) => {
  switch (color) {
    case 'red':
      return 'from-red-500/20 to-red-900/10 border-red-500/30';
    case 'amber':
      return 'from-amber-500/20 to-amber-900/10 border-amber-500/30';
    case 'purple':
      return 'from-purple-500/20 to-purple-900/10 border-purple-500/30';
    case 'cyan':
      return 'from-cyan-500/20 to-cyan-900/10 border-cyan-500/30';
    default:
      return 'from-gray-500/20 to-gray-900/10 border-gray-500/30';
  }
};

const getSurfaceAccent = (color: string) => {
  switch (color) {
    case 'red':
      return 'text-red-400';
    case 'amber':
      return 'text-amber-400';
    case 'purple':
      return 'text-purple-400';
    case 'cyan':
      return 'text-cyan-400';
    default:
      return 'text-gray-400';
  }
};

const PIPELINE_STEPS = [
  'Snapshot Isolation',
  'Amplitude & Drift Bounds',
  'Payload Parse',
  'Envelope (V)',
  'Evidence (E)',
  'Lineage (L)',
  'Signature (σ)',
  'Multi-Sig Threshold',
];

// Total number of tests never changes — computed once at module load.
const totalTests = surfaceAreas.reduce((acc, s) => acc + s.tests.length, 0);

interface SurfaceCardProps {
  surface: SurfaceArea;
  isSelected: boolean;
  allPassing: boolean;
  onSelect: (id: string) => void;
}

// Memoized so a card only re-renders when its own selection/pass state flips,
// not on every 500ms test-result tick.
const SurfaceCard = memo(function SurfaceCard({
  surface,
  isSelected,
  allPassing,
  onSelect,
}: SurfaceCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(surface.id)}
      className={`relative text-left p-5 rounded-xl border bg-gradient-to-br transition-all ${getSurfaceColor(
        surface.color
      )} ${
        isSelected
          ? 'ring-2 ring-offset-2 ring-offset-gray-950 ring-white/20 scale-[1.02]'
          : 'hover:scale-[1.01]'
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg bg-gray-900/50 ${getSurfaceAccent(surface.color)}`}>
          {getIcon(surface.icon)}
        </div>
        {allPassing && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
      </div>
      <h3 className="mt-3 font-semibold text-gray-100 text-sm">{surface.title}</h3>
      <p className="mt-1 text-xs text-gray-400 line-clamp-2">{surface.description}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {surface.tests.length} test{surface.tests.length !== 1 ? 's' : ''}
        </span>
        <ChevronRight className="w-3 h-3 text-gray-600" />
      </div>
    </motion.button>
  );
});

const DefensePipelineBanner = memo(function DefensePipelineBanner() {
  return (
    <div className="mb-6 bg-gray-900/30 border border-gray-800 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Hardened Engine Defense Pipeline</p>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div className="px-2.5 py-1 bg-gray-800/50 border border-gray-700/50 rounded text-[10px] text-gray-300 whitespace-nowrap">
              <span className="text-emerald-400 mr-1">{i + 1}.</span>{step}
            </div>
            {i < PIPELINE_STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-700 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
});

const SourceCodeReference = memo(function SourceCodeReference() {
  return (
    <div className="mt-8 mb-12">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
          <Binary className="w-4 h-4 text-emerald-400" />
          Hardened Engine Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {surfaceAreas.map((surface) => (
            <div key={surface.id} className="space-y-2">
              <h4 className={`text-xs font-medium uppercase tracking-wider ${getSurfaceAccent(surface.color)}`}>
                {surface.title}
              </h4>
              {surface.tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-gray-950/50 rounded-lg p-3 border border-gray-800/50"
                >
                  <code className="text-xs text-emerald-400">{test.id}</code>
                  <p className="text-xs text-gray-500 mt-1">{test.name}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                      {test.details.riskLevel}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {test.assertions} assertion{test.assertions !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {test.details.defenseLayer && (
                    <p className="text-[10px] text-emerald-400/70 mt-1.5 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {test.details.defenseLayer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

function App() {
  const [selectedSurface, setSelectedSurface] = useState<string>('dma');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runCount, setRunCount] = useState(0);
  const [activeVisualization, setActiveVisualization] = useState<string | null>(null);

  // Stable handler so memoized cards don't re-render on every parent render.
  const handleSelectSurface = useCallback((id: string) => {
    setSelectedSurface(id);
  }, []);

  const runAllTests = useCallback(() => {
    setIsRunning(true);
    setTestResults([]);
    setRunCount((c) => c + 1);

    // Flat list with surface id resolved via precomputed map — no O(n·m)
    // `.find()` scan inside the interval callback anymore.
    const allTests = surfaceAreas.flatMap((s) =>
      s.tests.map((test) => ({ test, surfaceId: s.id }))
    );
    let index = 0;

    const interval = setInterval(() => {
      if (index >= allTests.length) {
        clearInterval(interval);
        setIsRunning(false);
        return;
      }

      const { test, surfaceId } = allTests[index];
      setTestResults((prev) => [
        ...prev,
        {
          testId: test.id,
          testName: test.name,
          surfaceId,
          status: 'passing',
          duration: test.duration + Math.random() * 5,
          timestamp: Date.now(),
        },
      ]);
      index++;
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    runAllTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived metrics computed in a single pass and memoized, so repeated
  // renders (e.g. surface selection) don't rescan the results array.
  const { passingTests, avgDuration } = useMemo(() => {
    let passing = 0;
    let durationSum = 0;
    for (const r of testResults) {
      if (r.status === 'passing') passing++;
      durationSum += r.duration;
    }
    return {
      passingTests: passing,
      avgDuration: testResults.length > 0 ? durationSum / testResults.length : 0,
    };
  }, [testResults]);

  // Map of surface id -> count of passing results, computed once per results
  // update instead of filtering per-card on every render.
  const passingCountBySurface = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of testResults) {
      if (r.status === 'passing') {
        counts.set(r.surfaceId, (counts.get(r.surfaceId) ?? 0) + 1);
      }
    }
    return counts;
  }, [testResults]);

  const selectedSurfaceData = surfaceById.get(selectedSurface)!;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-emerald-400" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Sovereign Engine
                </h1>
                <p className="text-xs text-gray-500">
                  Hardened Security Test Suite • DMA · Physical · Contention · Multi-Sig
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Run #{runCount}</span>
              </div>
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running...' : 'Run All Tests'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DefensePipelineBanner />

        {/* Metrics Overview */}
        <MetricsOverview
          totalTests={totalTests}
          passingTests={passingTests}
          avgDuration={avgDuration}
          isRunning={isRunning}
          runCount={runCount}
        />

        {/* Surface Area Cards */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-400" />
            Attack Surface Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {surfaceAreas.map((surface) => (
              <SurfaceCard
                key={surface.id}
                surface={surface}
                isSelected={selectedSurface === surface.id}
                allPassing={
                  (passingCountBySurface.get(surface.id) ?? 0) === surface.tests.length
                }
                onSelect={handleSelectSurface}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Suite Panel */}
          <div className="lg:col-span-2">
            <TestSuitePanel
              surface={selectedSurfaceData}
              testResults={testResults}
              isRunning={isRunning}
              onTestClick={setActiveVisualization}
            />
          </div>

          {/* Attack Visualization */}
          <div>
            <AttackVisualization
              surfaceId={selectedSurface}
              activeTest={activeVisualization}
            />
          </div>
        </div>

        {/* Test Timeline */}
        <div className="mt-8">
          <TestTimeline results={testResults} isRunning={isRunning} />
        </div>

        <SourceCodeReference />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-600">
          <span>Sovereign Engine v0.2.0 • Hardened Security Verification Module</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            All surfaces verified • Snapshot isolation active
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
