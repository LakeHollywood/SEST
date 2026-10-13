import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Waves, Server, Zap, Shield, AlertTriangle, KeyRound } from 'lucide-react';

interface AttackVisualizationProps {
  surfaceId: string;
  activeTest: string | null;
}

// Memoized: only re-renders when the selected surface or active test changes,
// not on every 500ms test-result tick from the parent.
export const AttackVisualization = memo(function AttackVisualization({ surfaceId, activeTest }: AttackVisualizationProps) {
  const getVisualization = () => {
    switch (surfaceId) {
      case 'dma':
        return <DMAVisualization activeTest={activeTest} />;
      case 'contention':
        return <ContentionVisualization activeTest={activeTest} />;
      case 'physical':
        return <PhysicalVisualization activeTest={activeTest} />;
      case 'multisig':
        return <MultiSigVisualization activeTest={activeTest} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Attack Vector Visualization
        </h3>
      </div>
      <div className="p-4 min-h-[360px] flex items-center justify-center">
        {getVisualization()}
      </div>
    </div>
  );
});

function DMAVisualization({ activeTest }: { activeTest: string | null }) {
  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider">DMA Snapshot Isolation Defense</p>
      </div>

      {/* Memory Buffer Visualization */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-gray-400">Memory Buffer (Shared DMA)</span>
        </div>

        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-8 rounded flex items-center justify-center text-[9px] font-mono"
              initial={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              animate={
                activeTest === 'STS-DMA-001'
                  ? {
                      backgroundColor:
                        i >= 4 && i <= 7
                          ? ['rgba(59, 130, 246, 0.2)', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.6)']
                          : 'rgba(59, 130, 246, 0.2)',
                    }
                  : {}
              }
              transition={{ duration: 0.5, delay: i * 0.05, repeat: activeTest === 'STS-DMA-001' ? Infinity : 0, repeatDelay: 2 }}
            >
              <span className="text-blue-300/60">
                {i < 4 ? '✓' : i < 8 ? '⚠' : '·'}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Snapshot Clone Indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            SNAPSHOT CLONE
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-emerald-500/50 to-transparent" />
        </div>

        {/* Cloned Buffer */}
        <div className="grid grid-cols-8 gap-1 mt-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={`clone-${i}`}
              className="h-6 rounded flex items-center justify-center text-[9px] font-mono border border-emerald-500/20"
              animate={
                activeTest === 'STS-DMA-001'
                  ? { backgroundColor: ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)'] }
                  : {}
              }
              transition={{ duration: 1.5, delay: i * 0.03, repeat: Infinity }}
            >
              <span className="text-emerald-300/60 text-[8px]">
                {i < 4 ? 'V' : i < 8 ? 'V' : 'V'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-400">Snapshot Entry</span>
          <span className="text-[10px] text-emerald-400 ml-auto">CLONE</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: ['#f59e0b', '#ef4444', '#f59e0b'],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs text-gray-400">DMA Mutation Attempt</span>
          <span className="text-[10px] text-red-400 ml-auto">BLOCKED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-400">Authority Evaluation</span>
          <span className="text-[10px] text-emerald-400 ml-auto">FROM SNAPSHOT</span>
        </div>
      </div>

      {/* Protection Status */}
      <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">Snapshot isolation prevents DMA mutation bypass</span>
        </div>
      </div>
    </div>
  );
}

function ContentionVisualization({ activeTest }: { activeTest: string | null }) {
  const threads = Array.from({ length: 8 });
  const isActive = activeTest === 'STS-MT-001';

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Thread Contention Simulation</p>
      </div>

      {/* Thread Pool */}
      <div className="grid grid-cols-4 gap-2">
        {threads.map((_, i) => (
          <motion.div
            key={i}
            className="relative p-2 bg-gray-800/50 rounded-lg border border-gray-700/50"
            animate={
              isActive
                ? {
                    borderColor: i % 2 === 0
                      ? ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.3)']
                      : ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.6)', 'rgba(239, 68, 68, 0.3)'],
                  }
                : {}
            }
            transition={{ duration: 1, delay: i * 0.1, repeat: isActive ? Infinity : 0 }}
          >
            <div className="flex items-center gap-1">
              <Server className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] text-gray-400">T{i}</span>
            </div>
            <motion.div
              className="mt-1 h-1 rounded-full bg-gray-700"
              animate={isActive ? { scaleX: [0, 1, 0] } : {}}
              transition={{ duration: 1.5, delay: i * 0.15, repeat: isActive ? Infinity : 0 }}
              style={{ transformOrigin: 'left' }}
            >
              <div className={`h-full rounded-full ${i % 2 === 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Registry Lock */}
      <div className="relative mt-4">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
            animate={
              isActive
                ? { borderColor: ['#f59e0b', '#10b981', '#f59e0b'] }
                : { borderColor: 'rgba(107, 114, 128, 0.5)' }
            }
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          >
            <span className="text-lg">🔒</span>
          </motion.div>
        </div>
        <p className="text-center text-[10px] text-gray-500 mt-2">
          Mutex&lt;Option&lt;Vec&lt;String&gt;&gt;&gt;
        </p>
      </div>

      {/* Status */}
      <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">No fail-open detected under contention</span>
        </div>
      </div>
    </div>
  );
}

function PhysicalVisualization({ activeTest }: { activeTest: string | null }) {
  const isGlitch = activeTest === 'STS-PHY-001';
  const isBreach = activeTest === 'STS-PHY-002';
  const isDrift = activeTest === 'STS-PHY-004';
  const isActive = isGlitch || isBreach || isDrift;

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          {isDrift ? 'Clock Drift Analysis' : 'Physical Side-Channel Analysis'}
        </p>
      </div>

      {/* Oscillator Wave */}
      <div className="relative h-24 bg-gray-950/50 rounded-lg border border-gray-800/50 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
          <motion.path
            d={
              isDrift
                ? 'M0,30 Q15,25 30,30 Q45,35 60,30 Q75,28 90,30 Q105,33 120,30 Q135,27 150,30 Q165,34 180,30 Q190,29 200,30'
                : isGlitch
                ? 'M0,30 Q10,5 20,30 Q25,55 30,30 Q35,2 40,30 Q45,58 50,30 Q55,8 60,30 Q65,52 70,30 Q75,12 80,30 Q85,48 90,30 Q95,15 100,30 Q105,45 110,30 Q115,18 120,30 Q125,42 130,30 Q135,20 140,30 Q145,40 150,30 Q155,22 160,30 Q165,38 170,30 Q175,24 180,30 Q185,36 190,30 Q195,26 200,30'
                : 'M0,30 Q25,20 50,30 Q75,40 100,30 Q125,20 150,30 Q175,40 200,30'
            }
            fill="none"
            stroke={isDrift ? '#f59e0b' : isGlitch ? '#ef4444' : isBreach ? '#f59e0b' : '#10b981'}
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>

        {/* Drift indicator */}
        {isDrift && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-[10px] text-amber-400">
            DRIFT: 85.5 ppb
          </div>
        )}

        {/* Glitch markers */}
        {isGlitch && (
          <>
            {[30, 60, 90, 120, 150].map((x, i) => (
              <motion.div
                key={i}
                className="absolute top-0 w-px h-full bg-red-500/30"
                style={{ left: `${x / 2}%` }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800/50">
          <p className="text-[10px] text-gray-600 uppercase">Precision</p>
          <motion.p
            className="text-sm font-mono mt-1"
            animate={
              isActive && !isDrift
                ? { color: ['#ef4444', '#f59e0b', '#ef4444'] }
                : { color: isDrift ? '#10b981' : '#10b981' }
            }
            transition={{ duration: 1, repeat: isActive && !isDrift ? Infinity : 0 }}
          >
            {isDrift ? '0.5ps' : isGlitch ? '0.001ps' : '1.0ps'}
          </motion.p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {isGlitch ? '⚠ Outside envelope' : '✓ Within tolerance'}
          </p>
        </div>
        <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800/50">
          <p className="text-[10px] text-gray-600 uppercase">{isDrift ? 'Drift (ppb)' : 'Uncertainty'}</p>
          <motion.p
            className="text-sm font-mono mt-1"
            animate={
              isDrift
                ? { color: ['#ef4444', '#f59e0b', '#ef4444'] }
                : { color: '#10b981' }
            }
            transition={{ duration: 1, repeat: isDrift ? Infinity : 0 }}
          >
            {isDrift ? '85.5' : isBreach ? '1e-12' : '1e-18'}
          </motion.p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {isDrift ? '⚠ Exceeds 50.0 ppb' : isBreach ? '⚠ Temp breach' : '✓ Nominal'}
          </p>
        </div>
      </div>

      {/* Drift Threshold Bar */}
      {isDrift && (
        <div className="relative mt-2">
          <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
            <span>Drift Tolerance: 50.0 ppb</span>
            <span className="text-red-400">85.5 ppb EXCEEDED</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
            {/* Threshold marker */}
            <div className="absolute left-[58.8%] top-0 bottom-0 w-px bg-emerald-400/50 z-10" />
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-red-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5 }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100 ppb</span>
          </div>
        </div>
      )}

      {/* Validity Envelope */}
      {!isDrift && (
        <div className="relative mt-2">
          <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
            <span>Validity Envelope (V)</span>
            <span>{isActive ? 'BREACHED' : 'INTACT'}</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={
                isActive
                  ? {
                      width: ['70%', '95%', '70%'],
                      backgroundColor: ['#ef4444', '#f59e0b', '#ef4444'],
                    }
                  : { width: '70%', backgroundColor: '#10b981' }
              }
              transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
            />
          </div>
        </div>
      )}

      {/* Protection Status */}
      <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">
            {isDrift
              ? 'Drift exceeds 50.0 ppb threshold — authority denied'
              : isGlitch
              ? 'Oscillator anomaly detected & rejected'
              : isBreach
              ? 'Environmental breach flagged'
              : 'Physical layer secure'}
          </span>
        </div>
      </div>
    </div>
  );
}

function MultiSigVisualization({ activeTest }: { activeTest: string | null }) {
  const isActive = activeTest === 'STS-MULTISIG-001';
  const threshold = 3;
  const provided = 1;

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Multi-Signature Threshold Verification</p>
      </div>

      {/* Signature Blocks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Required Threshold</span>
          <span className="text-sm font-mono text-amber-400">{threshold} signatures</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: threshold }).map((_, i) => {
            const isProvided = i < provided;
            return (
              <motion.div
                key={i}
                className={`relative p-3 rounded-lg border text-center ${
                  isProvided
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-gray-800/30 border-gray-700/30'
                }`}
                animate={
                  isActive
                    ? {
                        borderColor: isProvided
                          ? ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.3)']
                          : ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.5)', 'rgba(239, 68, 68, 0.2)'],
                      }
                    : {}
                }
                transition={{ duration: 1.2, delay: i * 0.2, repeat: isActive ? Infinity : 0 }}
              >
                <KeyRound className={`w-5 h-5 mx-auto mb-1 ${isProvided ? 'text-emerald-400' : 'text-gray-600'}`} />
                <p className={`text-[10px] font-mono ${isProvided ? 'text-emerald-300' : 'text-gray-600'}`}>
                  {isProvided ? 'VALID' : 'MISSING'}
                </p>
                <p className="text-[9px] text-gray-600 mt-0.5">16-byte block</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chunk Analysis */}
      <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800/50">
        <p className="text-[10px] text-gray-600 uppercase mb-2">Payload Chunk Analysis</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 1 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded flex items-center justify-center"
              animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-[9px] text-emerald-300 font-mono">0x11×16</span>
            </motion.div>
          ))}
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-1 h-6 bg-gray-800/50 border border-gray-700/30 border-dashed rounded flex items-center justify-center"
            >
              <span className="text-[9px] text-gray-600 font-mono">∅</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px]">
          <span className="text-gray-500">chunks(16).count() = {provided}</span>
          <span className="text-red-400">{provided} &lt; {threshold} → EMPTY</span>
        </div>
      </div>

      {/* Decision */}
      <div className="relative">
        <div className="flex items-center justify-center gap-3 py-3">
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center"
            animate={isActive ? { borderColor: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0.3)'] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-2xl">✗</span>
          </motion.div>
        </div>
        <p className="text-center text-xs text-red-400">AuthoritySet::EMPTY</p>
      </div>

      {/* Protection Status */}
      <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">Insufficient signatures — threshold not met</span>
        </div>
      </div>
    </div>
  );
}
