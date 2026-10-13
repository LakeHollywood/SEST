import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, AlertTriangle } from 'lucide-react';
import type { TestResult } from '../types';

interface MetricsOverviewProps {
  totalTests: number;
  passingTests: number;
  avgDuration: number;
  isRunning: boolean;
  runCount: number;
}

// Memoized: static until a metric value or run state actually changes.
export const MetricsOverview = memo(function MetricsOverview({
  totalTests,
  passingTests,
  avgDuration,
  isRunning,
  runCount,
}: MetricsOverviewProps) {
  const passRate = totalTests > 0 ? (passingTests / totalTests) * 100 : 0;

  const metrics = [
    {
      label: 'Total Tests',
      value: totalTests,
      icon: <Zap className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Passing',
      value: passingTests,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Avg Duration',
      value: `${avgDuration.toFixed(1)}ms`,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Pass Rate',
      value: `${passRate.toFixed(0)}%`,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: passRate === 100 ? 'text-emerald-400' : 'text-red-400',
      bgColor: passRate === 100 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${metric.bgColor} ${metric.color}`}>
              {metric.icon}
            </div>
            {isRunning && (
              <motion.div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
          <motion.p
            className="text-2xl font-bold text-gray-100"
            key={`${metric.value}-${runCount}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {metric.value}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
        </motion.div>
      ))}
    </div>
  );
});
