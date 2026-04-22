import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { MetricsMap } from '../types';

interface MetricsChartsProps {
  metrics: MetricsMap;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

// Helper to determine performance level based on avg execution time
const getPerformanceLevel = (avgTime: number): { level: string; color: string } => {
  if (avgTime < 50) return { level: 'FAST', color: 'bg-green-100 text-green-700' };
  if (avgTime < 200) return { level: 'NORMAL', color: 'bg-yellow-100 text-yellow-700' };
  if (avgTime < 500) return { level: 'SLOW', color: 'bg-orange-100 text-orange-700' };
  return { level: 'CRITICAL', color: 'bg-red-100 text-red-700' };
};

// Extract short method name from full name like "PostService.getAllPosts(..)"
const getShortName = (methodName: string): string => {
  const match = methodName.match(/\.([^.]+)\(/);
  return match ? match[1] : methodName;
};

// Extract service/layer name
const getServiceName = (methodName: string): string => {
  const match = methodName.match(/^([^.]+)/);
  return match ? match[1] : 'Unknown';
};

export const MetricsCharts: React.FC<MetricsChartsProps> = ({ metrics }) => {
  // Convert metrics map to array for charts
  const methodEntries = Object.entries(metrics);

  const chartData = methodEntries.map(([key, m]) => {
    const perf = getPerformanceLevel(m.averageExecutionTime);
    return {
      ...m,
      shortName: getShortName(m.methodName),
      service: getServiceName(m.methodName),
      performanceLevel: perf.level,
      performanceColor: perf.color,
      failureRate: m.totalCalls > 0 ? ((m.failedCalls / m.totalCalls) * 100).toFixed(1) + '%' : '0%'
    };
  });

  const failureData = chartData
    .filter(d => d.failedCalls > 0)
    .map(d => ({
      name: d.shortName,
      value: d.failedCalls
    }));

  // Check if we have data to display
  if (chartData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No metrics data available
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6">
      {/* Performance Overview - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 uppercase tracking-wide">{item.service}</div>
                <div className="text-sm font-semibold text-gray-900 truncate" title={item.methodName}>
                  {item.shortName}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.performanceColor}`}>
                {item.performanceLevel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{item.totalCalls}</div>
                <div className="text-xs text-gray-500">Calls</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{item.averageExecutionTime}<span className="text-xs ml-0.5">ms</span></div>
                <div className="text-xs text-gray-500">Avg</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${item.failedCalls > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.failureRate}
                </div>
                <div className="text-xs text-gray-500">Errors</div>
              </div>
            </div>

            {/* Execution Time Range */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>Min: {item.minExecutionTime}ms</span>
              <span>Max: {item.maxExecutionTime}ms</span>
              <span>Total: {item.totalExecutionTime}ms</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Execution Time Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg Execution Time (ms)</h3>
          <div className="overflow-x-auto">
            <BarChart
              data={chartData}
              layout="vertical"
              width={Math.max(400, chartData.length * 40)}
              height={Math.max(250, chartData.length * 35)}
              margin={{ left: 120, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="shortName"
                type="category"
                width={110}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} ms`, 'Avg Time']}
              />
              <Bar
                dataKey="averageExecutionTime"
                radius={[0, 4, 4, 0]}
                fill="#4f46e5"
              />
            </BarChart>
          </div>
        </div>

        {/* Call Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Call Distribution</h3>
          <div className="overflow-x-auto">
            <BarChart
              data={chartData}
              width={Math.max(400, chartData.length * 60)}
              height={250}
              margin={{ left: 20, right: 20, top: 5, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successfulCalls" stackId="a" fill="#10b981" name="Success" />
              <Bar dataKey="failedCalls" stackId="a" fill="#ef4444" name="Failed" />
            </BarChart>
          </div>
        </div>

        {/* Latency Comparison (Min/Avg/Max) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Latency Range (Min/Avg/Max)</h3>
          <div className="overflow-x-auto">
            <BarChart
              data={chartData}
              width={Math.max(500, chartData.length * 100)}
              height={300}
              margin={{ left: 40, right: 20, top: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, angle: -35, textAnchor: 'end' }}
                interval={0}
                height={80}
              />
              <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="minExecutionTime" fill="#10b981" name="Min" />
              <Bar dataKey="averageExecutionTime" fill="#4f46e5" name="Avg" />
              <Bar dataKey="maxExecutionTime" fill="#f59e0b" name="Max" />
            </BarChart>
          </div>
        </div>

        {/* Failure Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Failure Distribution</h3>
          <div className="flex items-center justify-center" style={{ height: 300 }}>
            {failureData.length > 0 ? (
              <PieChart width={400} height={300}>
                <Pie
                  data={failureData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#666', strokeWidth: 1 }}
                >
                  {failureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
              </PieChart>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-gray-500">No failures recorded</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};