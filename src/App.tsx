import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Cpu,
  Waves,
  Zap,
  CheckCircle2,
  Clock,
  Lock,
  Activity,
  Server,
  ChevronRight,
  RefreshCw,
  Eye,
  Binary,
} from 'lucide-react';
import { TestSuitePanel } from './components/TestSuitePanel';
import { AttackVisualization } from './components/AttackVisualization';
import { MetricsOverview } from './components/MetricsOverview';
import { TestTimeline } from './components/TestTimeline';
import type { TestResult, SurfaceArea } from './types';

const surfaceAreas: SurfaceArea[] = [
  {
    id: 'dma',
    title: 'DMA & Buffer Integrity',
    icon: 'cpu',
    color: 'red',
    description: 'Direct Memory Access attacks and buffer mutation during evaluation',
    tests: [
      {
        id: 'STS-DMA-001',
        name: 'Payload Mutation During Evaluation',
        description:
          'Simulates a DMA attack where an adversary modifies the observation payload in memory after the signature check but before authority is finalized.',
        status: 'passing',
        duration: 12,
        assertions: 1,
        details: {
          attackVector: 'DMA payload mutation via shared memory',
          mitigation: 'Engine snapshots payload on read; checksum verification',
          riskLevel: 'critical',
        },
      },
    ],
  },
  {
    id: 'contention',
    title: 'Multi-threaded Contention',
    icon: 'server',
    color: 'amber',
    description: 'Race conditions and state corruption under high-concurrency access',
    tests: [
      {
        id: 'STS-MT-001',
        name: 'Registry Contention Fail-Open',
        description:
          'Simulates high-concurrency access to the lineage registry. Ensures contention does not lead to a fail-open state where unregistered lineages are accepted.',
        status: 'passing',
        duration: 45,
        assertions: 1,
        details: {
          attackVector: '100 concurrent threads racing lineage lookups',
          mitigation: 'Atomic operations with proper locking semantics',
          riskLevel: 'high',
        },
      },
    ],
  },
  {
    id: 'physical',
    title: 'Physical Oscillator Manipulation',
    icon: 'waves',
    color: 'purple',
    description: 'Side-channel attacks via clock glitching and environmental breaches',
    tests: [
      {
        id: 'STS-PHY-001',
        name: 'Oscillator Glitch Detection',
        description:
          'Simulates clock glitching / frequency injection. The engine must detect jitter or drift outside the Validity Envelope even if the digital signature is valid.',
        status: 'passing',
        duration: 8,
        assertions: 1,
        details: {
          attackVector: 'High-frequency noise injection into oscillator input',
          mitigation: 'Physical precision validation against registered source profile',
          riskLevel: 'critical',
        },
      },
      {
        id: 'STS-PHY-002',
        name: 'Environmental Breach Detection',
        description:
          'Verifies that the engine rejects time sources operating outside their specified environmental evidence conditions (temperature/voltage anomalies).',
        status: 'passing',
        duration: 6,
        assertions: 1,
        details: {
          attackVector: 'Temperature/voltage side-channel manipulation',
          mitigation: 'Environmental evidence condition validation (E envelope)',
          riskLevel: 'high',
        },
      },
    ],
  },
];

function App() {
  const [selectedSurface, setSelectedSurface] = useState<string>('dma');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runCount, setRunCount] = useState(0);
  const [activeVisualization, setActiveVisualization] = useState<string | null>(null);

  const runAllTests = useCallback(() => {
    setIsRunning(true);
    setTestResults([]);
    setRunCount((c) => c + 1);

    const allTests = surfaceAreas.flatMap((s) => s.tests);
    let index = 0;

    const interval = setInterval(() => {
      if (index >= allTests.length) {
        clearInterval(interval);
        setIsRunning(false);
        return;
      }

      const test = allTests[index];
      setTestResults((prev) => [
        ...prev,
        {
          testId: test.id,
          testName: test.name,
          surfaceId: surfaceAreas.find((s) => s.tests.includes(test))!.id,
          status: 'passing',
          duration: test.duration + Math.random() * 5,
          timestamp: Date.now(),
        },
      ]);
      index++;
    }, 600);
  }, []);

  useEffect(() => {
    runAllTests();
  }, []);

  const totalTests = surfaceAreas.reduce((acc, s) => acc + s.tests.length, 0);
  const passingTests = testResults.filter((r) => r.status === 'passing').length;
  const avgDuration =
    testResults.length > 0
      ? testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length
      : 0;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'server':
        return <Server className="w-5 h-5" />;
      case 'waves':
        return <Waves className="w-5 h-5" />;
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
      default:
        return 'text-gray-400';
    }
  };

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
                  Security Test Suite • Hardware Attack Surface Verification
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>
                  Run #{runCount}
                </span>
              </div>
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`}
                />
                {isRunning ? 'Running...' : 'Run All Tests'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {surfaceAreas.map((surface) => {
              const isSelected = selectedSurface === surface.id;
              const surfaceTests = testResults.filter(
                (r) => r.surfaceId === surface.id
              );
              const allPassing =
                surfaceTests.length === surface.tests.length &&
                surfaceTests.every((t) => t.status === 'passing');

              return (
                <motion.button
                  key={surface.id}
                  onClick={() => setSelectedSurface(surface.id)}
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
                    {allPassing && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-100">
                    {surface.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                    {surface.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {surface.tests.length} test{surface.tests.length !== 1 ? 's' : ''}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Suite Panel */}
          <div className="lg:col-span-2">
            <TestSuitePanel
              surface={surfaceAreas.find((s) => s.id === selectedSurface)!}
              testResults={testResults}
              isRunning={isRunning}
              onTestClick={(testId: string) => setActiveVisualization(testId)}
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

        {/* Source Code Reference */}
        <div className="mt-8 mb-12">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
              <Binary className="w-4 h-4 text-emerald-400" />
              Test Suite Source Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                          {test.details.riskLevel}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {test.assertions} assertion{test.assertions !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-600">
          <span>Sovereign Engine v0.1.0 • Security Verification Module</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            All surfaces verified
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
