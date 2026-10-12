import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Activity } from 'lucide-react';
import type { TestResult } from '../types';

interface TestTimelineProps {
  results: TestResult[];
  isRunning: boolean;
}

export function TestTimeline({ results, isRunning }: TestTimelineProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-gray-300">Execution Timeline</h3>
        </div>
        {isRunning && (
          <motion.span
            className="text-xs text-amber-400 flex items-center gap-1"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Clock className="w-3 h-3" />
            In Progress
          </motion.span>
        )}
      </div>

      <div className="p-5">
        {results.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No test results yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-800" />

            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={`${result.testId}-${result.timestamp}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-center gap-4 pl-6"
                >
                  {/* Timeline Dot */}
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {result.status === 'passing' ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 border-2 border-red-400" />
                    )}
                  </motion.div>

                  {/* Result Card */}
                  <div className="flex-1 flex items-center justify-between bg-gray-950/30 rounded-lg px-4 py-2.5 border border-gray-800/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-sm text-gray-200">{result.testName}</p>
                        <p className="text-[10px] text-gray-600 font-mono">{result.testId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-mono">
                        {result.duration.toFixed(1)}ms
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PASS
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Running indicator */}
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative flex items-center gap-4 pl-6"
                >
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-amber-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <div className="flex-1 bg-gray-950/30 rounded-lg px-4 py-2.5 border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="text-sm text-amber-300">Executing next test...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
