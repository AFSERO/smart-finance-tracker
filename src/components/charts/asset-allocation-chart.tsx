"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface AssetData {
  name: string
  value: number
  color: string
}

interface AssetAllocationChartProps {
  data: AssetData[]
}

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444']

export function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No Assets</div>
          <div className="text-gray-500 text-sm">Add some assets to see your portfolio allocation</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
