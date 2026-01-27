import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { MetricsMap, MethodMetric } from '../types';

interface MetricsChartsProps {
  data: MetricsMap;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const MetricsCharts: React.FC<MetricsChartsProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.split('::')[1] || key, // Simplify name for chart
    fullName: key,
    ...(value as MethodMetric)
  }));

  const failureData = chartData.filter(d => d.failureCount > 0).map(d => ({
    name: d.name,
    value: d.failureCount
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      
      {/* Execution Time Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg Execution Time (ms)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="averageExecutionTimeMs" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Call Count vs Failures */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Traffic Volume</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="callCount" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Failure Distribution */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Failure Distribution</h3>
        <div className="h-64 w-full flex items-center justify-center">
          {failureData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {failureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400">No failures recorded</div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
         {chartData.map((item, idx) => (
           <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-wide truncate" title={item.fullName}>{item.fullName}</div>
             <div className="mt-2 flex justify-between items-end">
               <div>
                 <span className="text-2xl font-bold text-gray-800">{item.callCount}</span>
                 <span className="text-xs text-gray-500 ml-1">calls</span>
               </div>
               <div className={`text-xs font-bold ${item.failureRate > 1 ? 'text-red-500' : 'text-green-500'}`}>
                 {item.failureRate.toFixed(2)}% err
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};