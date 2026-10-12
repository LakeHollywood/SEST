import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Lock,
} from 'lucide-react';
import { useState } from 'react';
import type { SurfaceArea, TestResult } from '../types';

interface TestSuitePanelProps {
  surface: SurfaceArea;
  testResults: TestResult[];
  isRunning: boolean;
  onTestClick: (testId: string) => void;
}

export function TestSuitePanel({
  surface,
  testResults,
  isRunning,
  onTestClick,
}: TestSuitePanelProps) {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-semibold text-gray-100">{surface.title}</h3>
            <p className="text-xs text-gray-500">{surface.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <motion.span
              className="text-xs text-emerald-400 flex items-center gap-1"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Clock className="w-3 h-3" />
              Running...
            </motion.span>
          )}
        </div>
      </div>

      {/* Test Cases */}
      <div className="divide-y divide-gray-800/50">
        {surface.tests.map((test, index) => {
          const result = testResults.find((r) => r.testId === test.id);
          const isExpanded = expandedTest === test.id;
          const isTestRunning = isRunning && !result;

          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => {
                  setExpandedTest(isExpanded ? null : test.id);
                  onTestClick(test.id);
                }}
                className="w-full text-left px-5 py-4 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    {isTestRunning ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Clock className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    ) : result?.status === 'passing' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : result?.status === 'failing' ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-700" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs text-emerald-400 font-mono">
                          {test.id}
                        </code>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${getRiskBadge(
                            test.details.riskLevel
                          )}`}
                        >
                          {test.details.riskLevel}
                        </span>
                        {test.details.defenseLayer && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            {test.details.defenseLayer}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-0.5">{test.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {result && (
                      <span className="text-xs text-gray-500">
                        {result.duration.toFixed(1)}ms
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-4"
                >
                  <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800/50 space-y-3">
                    <p className="text-sm text-gray-400">{test.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
                          Attack Vector
                        </p>
                        <p className="text-xs text-red-300 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                          {test.details.attackVector}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
                          Mitigation
                        </p>
                        <p className="text-xs text-emerald-300 flex items-start gap-1.5">
                          <Shield className="w-3 h-3 mt-0.5 shrink-0" />
                          {test.details.mitigation}
                        </p>
                      </div>
                    </div>

                    {/* Defense Layer Badge */}
                    {test.details.defenseLayer && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-emerald-400/70">Active Defense</p>
                          <p className="text-xs text-emerald-300">{test.details.defenseLayer}</p>
                        </div>
                      </div>
                    )}

                    {/* Parameters Table */}
                    {test.details.parameters && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">
                          Test Parameters
                        </p>
                        <div className="space-y-1">
                          {Object.entries(test.details.parameters).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <code className="text-gray-500 font-mono">{key}</code>
                              <code className="text-cyan-300 font-mono">{value}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{test.assertions} assertion{test.assertions !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>Expected: {test.duration}ms</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
