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
