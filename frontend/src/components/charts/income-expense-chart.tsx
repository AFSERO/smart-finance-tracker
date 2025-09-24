"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  month: string
  income: number
  expenses: number
  balance: number
}

interface IncomeExpenseChartProps {
  data: ChartData[]
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No Data Available</div>
          <div className="text-gray-500 text-sm">Add some transactions to see your income and expenses over time</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Balance'
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#22c55e" 
            strokeWidth={2}
            name="income"
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="expenses"
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="balance"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
