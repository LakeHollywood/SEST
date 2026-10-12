import { motion } from 'framer-motion';
import { Cpu, Waves, Server, Zap, Shield, AlertTriangle } from 'lucide-react';

interface AttackVisualizationProps {
  surfaceId: string;
  activeTest: string | null;
}

export function AttackVisualization({ surfaceId, activeTest }: AttackVisualizationProps) {
  const getVisualization = () => {
    switch (surfaceId) {
      case 'dma':
        return <DMAVisualization activeTest={activeTest} />;
      case 'contention':
        return <ContentionVisualization activeTest={activeTest} />;
      case 'physical':
        return <PhysicalVisualization activeTest={activeTest} />;
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
      <div className="p-4 min-h-[320px] flex items-center justify-center">
        {getVisualization()}
      </div>
    </div>
  );
}

function DMAVisualization({ activeTest }: { activeTest: string | null }) {
  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider">DMA Memory Mutation Attack</p>
      </div>

      {/* Memory Buffer Visualization */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-gray-400">Memory Buffer</span>
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

        {/* Attack Arrow */}
        {activeTest === 'STS-DMA-001' && (
          <motion.div
            className="absolute top-1/2 -right-2 flex items-center"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: [20, 0, 20], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </motion.div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-400">Signature Check</span>
          <span className="text-[10px] text-emerald-400 ml-auto">PASS</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: ['#f59e0b', '#ef4444', '#f59e0b'],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs text-gray-400">Payload Read</span>
          <span className="text-[10px] text-amber-400 ml-auto">MUTATED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-400">Authority Check</span>
          <span className="text-[10px] text-emerald-400 ml-auto">BLOCKED</span>
        </div>
      </div>

      {/* Protection Status */}
      <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">Engine snapshot protection active</span>
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
        <p className="text-center text-[10px] text-gray-500 mt-2">Lineage Registry (Atomic)</p>
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
  const isActive = isGlitch || isBreach;

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Physical Side-Channel Analysis</p>
      </div>

      {/* Oscillator Wave */}
      <div className="relative h-24 bg-gray-950/50 rounded-lg border border-gray-800/50 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
          <motion.path
            d={
              isActive
                ? isGlitch
                  ? 'M0,30 Q10,5 20,30 Q25,55 30,30 Q35,2 40,30 Q45,58 50,30 Q55,8 60,30 Q65,52 70,30 Q75,12 80,30 Q85,48 90,30 Q95,15 100,30 Q105,45 110,30 Q115,18 120,30 Q125,42 130,30 Q135,20 140,30 Q145,40 150,30 Q155,22 160,30 Q165,38 170,30 Q175,24 180,30 Q185,36 190,30 Q195,26 200,30'
                  : 'M0,30 Q25,28 50,30 Q75,32 100,30 Q125,28 150,30 Q175,32 200,30'
                : 'M0,30 Q25,20 50,30 Q75,40 100,30 Q125,20 150,30 Q175,40 200,30'
            }
            fill="none"
            stroke={isGlitch ? '#ef4444' : isBreach ? '#f59e0b' : '#10b981'}
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>

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
              isActive
                ? { color: ['#ef4444', '#f59e0b', '#ef4444'] }
                : { color: '#10b981' }
            }
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          >
            {isGlitch ? '0.001ps' : '1.0ps'}
          </motion.p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {isGlitch ? '⚠ Outside envelope' : '✓ Within tolerance'}
          </p>
        </div>
        <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800/50">
          <p className="text-[10px] text-gray-600 uppercase">Uncertainty</p>
          <motion.p
            className="text-sm font-mono mt-1"
            animate={
              isActive
                ? { color: ['#ef4444', '#f59e0b', '#ef4444'] }
                : { color: '#10b981' }
            }
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          >
            {isBreach ? '1e-12' : '1e-18'}
          </motion.p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {isBreach ? '⚠ Temp breach' : '✓ Nominal'}
          </p>
        </div>
      </div>

      {/* Validity Envelope */}
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

      {/* Protection Status */}
      <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">
            {isGlitch ? 'Oscillator anomaly detected & rejected' : isBreach ? 'Environmental breach flagged' : 'Physical layer secure'}
          </span>
        </div>
      </div>
    </div>
  );
}
