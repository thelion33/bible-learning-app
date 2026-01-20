'use client'

import { Progress } from './ui/progress'
import { Trophy } from 'lucide-react'

interface ProgressBarProps {
  current: number
  total: number
  xp: number
}

export function ProgressBar({ current, total, xp }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="bg-white border-b shadow-sm sticky top-[57px] z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {current} of {total}
          </span>
          <div className="flex items-center space-x-2 text-sm font-medium text-purple-600">
            <Trophy className="w-4 h-4" />
            <span>{xp} XP</span>
          </div>
        </div>
        <Progress value={percentage} max={100} className="h-2" />
      </div>
    </div>
  )
}
