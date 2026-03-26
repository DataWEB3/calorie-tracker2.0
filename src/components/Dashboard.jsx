import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Flame, Droplets, Wheat, Beef, TrendingUp, TrendingDown, Minus,
  Moon, Scale, Trophy, Target, Activity, Calendar, Award,
  Plus, Check, ChevronRight
} from 'lucide-react'
import useStore, { achievementsList } from '../store/useStore'

// Circular Progress
function CircularProgress({ value, max, size = 100, strokeWidth = 8, color }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((value / max) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-dark-700/50" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="progress-ring-circle" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{Math.round(value)}</span>
        <span className="text-dark-500 text-xs">/ {max}</span>
      </div>
    </div>
  )
}

// Water Tracker (inline)
function WaterTracker({ current, goal, onAdd }) {
  const glasses = Math.floor(current / 250)
  const percentage = Math.min((current / goal) * 100, 100)
  const isComplete = current >= goal
  
  const handleAdd = (amount) => {
    if (current + amount <= goal * 1.5) { // Максимум 150% от цели
      onAdd(amount)
    }
  }
  
  return (
    <div className="flex items-center gap-3 p-3 glass-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
        <Droplets className={`w-5 h-5 ${isComplete ? 'text-green-400' : 'text-blue-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-dark-400">Вода {isComplete && '(цель достигнута!)'}</span>
          <span className={`text-sm font-medium ${isComplete ? 'text-green-400' : ''}`}>{current} / {goal} мл</span>
        </div>
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${Math.min(percentage, 100)}%` }} 
            className={`h-full ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
          />
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {current < goal * 1.5 && (
          <>
            <button onClick={() => handleAdd(250)} className="w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium">+250</button>
            <button onClick={() => handleAdd(500)} className="w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium">+500</button>
          </>
        )}
        {isComplete && (
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4 text-green-400" />
          </div>
        )}
      </div>
    </div>
  )
}

// Weight Tracker (inline)
function WeightTracker({ weightLog, onAdd }) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  const latestWeight = weightLog[weightLog.length - 1]?.weight
  const previousWeight = weightLog[weightLog.length - 2]?.weight
  const weightDiff = latestWeight && previousWeight ? (latestWeight - previousWeight).toFixed(1) : null
  
  const handleSubmit = () => {
    const w = parseFloat(inputValue)
    if (w > 0 && w <= 200) {
      onAdd(w)
      setInputValue('')
      setIsOpen(false)
    }
  }
  
  return (
    <div className="flex items-center gap-3 p-3 glass-card">
      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
        <Scale className="w-5 h-5 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-dark-400">Вес</span>
          {latestWeight && (
            <span className="text-sm font-medium text-purple-400">{latestWeight} кг</span>
          )}
        </div>
        {weightDiff !== null && (
          <span className={`text-xs ${weightDiff > 0 ? 'text-red-400' : weightDiff < 0 ? 'text-green-400' : 'text-dark-500'}`}>
            {weightDiff > 0 ? '+' : ''}{weightDiff} кг
          </span>
        )}
      </div>
      {isOpen ? (
        <div className="flex gap-1 flex-shrink-0 items-center">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0-200"
            min="0"
            max="200"
            step="0.1"
            className="w-16 px-2 py-1 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
            autoFocus
          />
          <span className="text-xs text-dark-400">кг</span>
          <button onClick={handleSubmit} className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-8 h-8 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Sleep Tracker (inline)
function SleepTracker({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState('')
  const getTodaySleep = useStore(state => state.getTodaySleep)
  const todaySleep = getTodaySleep()
  
  const handleSubmit = () => {
    const h = parseFloat(hours)
    if (h > 0 && h <= 24) {
      onAdd(h, 3) // качество 3 по умолчанию
      setHours('')
      setIsOpen(false)
    }
  }
  
  return (
    <div className="flex items-center gap-3 p-3 glass-card">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
        <Moon className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-dark-400">Сон</span>
          {todaySleep && (
            <span className="text-sm font-medium text-indigo-400">{todaySleep.hours}ч</span>
          )}
        </div>
        {todaySleep && (
          <span className="text-xs text-dark-500">сегодня</span>
        )}
      </div>
      {isOpen ? (
        <div className="flex gap-1 flex-shrink-0 items-center">
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0-24"
            min="0"
            max="24"
            step="0.5"
            className="w-16 px-2 py-1 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
            autoFocus
          />
          <span className="text-xs text-dark-400">ч</span>
          <button onClick={handleSubmit} className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-8 h-8 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Streak Display
function StreakDisplay({ streak, longestStreak }) {
  return (
    <div className="flex items-center gap-3 p-3 glass-card">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
        <Flame className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <span className="text-sm text-dark-400">Серия</span>
        <div className="font-bold text-xl">{streak} <span className="text-dark-500 text-sm font-normal">дней</span></div>
      </div>
      <div className="text-right">
        <span className="text-xs text-dark-500">Рекорд</span>
        <div className="font-semibold text-orange-400">{longestStreak}</div>
      </div>
    </div>
  )
}

// Achievements (compact)
function Achievements({ userAchievements }) {
  const earned = achievementsList.filter(a => userAchievements.includes(a.id))
  
  return (
    <div className="p-3 glass-card">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-dark-400">Достижения</span>
        <span className="text-xs text-dark-500 ml-auto">{earned.length}/{achievementsList.length}</span>
      </div>
      <div className="flex gap-2">
        {achievementsList.slice(0, 8).map(achievement => (
          <div 
            key={achievement.id}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              earned.includes(achievement) ? 'bg-yellow-500/20' : 'bg-dark-800/50 opacity-30'
            }`}
            title={achievement.desc}
          >
            <Trophy className={`w-4 h-4 ${earned.includes(achievement) ? 'text-yellow-400' : 'text-dark-600'}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Weekly Stats
function WeeklyStats({ weeklyStats }) {
  return (
    <div className="flex items-center gap-2 p-3 glass-card overflow-hidden">
      <Calendar className="w-4 h-4 text-green-400 flex-shrink-0" />
      <div className="flex-1 grid grid-cols-3 gap-1 text-center min-w-0">
        <div className="min-w-0">
          <div className="font-bold text-green-400 text-xs truncate">{weeklyStats.daysActive}</div>
          <div className="text-[10px] text-dark-500 truncate">дней</div>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-orange-400 text-xs truncate">{weeklyStats.avgCalories}</div>
          <div className="text-[10px] text-dark-500 truncate">ккал</div>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-blue-400 text-xs truncate">{weeklyStats.totalWorkouts}</div>
          <div className="text-[10px] text-dark-500 truncate">тренир</div>
        </div>
      </div>
    </div>
  )
}

// Macro Item
function MacroItem({ icon: Icon, label, current, target, color, bgColor }) {
  const percentage = Math.min((current / target) * 100, 100)
  
  return (
    <div className="flex items-center gap-3 p-2 glass-card-hover">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-dark-300 text-sm">{label}</span>
          <span className="text-white text-sm font-medium">{current}г / {target}г</span>
        </div>
        <div className="h-1 bg-dark-800 rounded-full overflow-hidden mt-1">
          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: color === 'text-primary-400' ? '#38bdf8' : color === 'text-yellow-400' ? '#facc15' : '#f472b6' }} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, getTodayStats, getWeeklyStats, addWater, addWeight, addSleep, weightLog, currentStreak, longestStreak, achievements } = useStore()
  const stats = getTodayStats()
  const weeklyStats = getWeeklyStats()
  
  if (!stats) return null
  
  const { consumed, target, remaining, percentage, protein, fat, carbs } = stats
  
  const getTrendIcon = () => {
    if (remaining > 200) return <TrendingDown className="w-4 h-4 text-green-400" />
    if (remaining < -200) return <TrendingUp className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-yellow-400" />
  }
  
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold">Добро пожаловать</h1>
        <p className="text-dark-400 text-sm">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      
      {/* Main Calories Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-dark-400">Калории</span>
            </div>
            <div className="text-3xl font-bold mt-1">{consumed}</div>
            <div className="text-dark-400 text-sm">из {target} ккал</div>
          </div>
          <CircularProgress value={consumed} max={target} size={100} strokeWidth={8} color={percentage > 100 ? '#ef4444' : percentage > 80 ? '#facc15' : '#38bdf8'} />
        </div>
        <div className="flex items-center justify-between mt-3 p-2 bg-dark-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-dark-300 text-sm">{remaining >= 0 ? `${remaining} осталось` : `${Math.abs(remaining)} сверх`}</span>
          </div>
          <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>{percentage}%</span>
        </div>
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-2">
        <StreakDisplay streak={currentStreak} longestStreak={longestStreak} />
      </div>
      <WeeklyStats weeklyStats={weeklyStats} />
      
      {/* Water */}
      <WaterTracker current={stats.water.current} goal={stats.water.target} onAdd={addWater} />
      
      {/* Weight & Sleep Row */}
      <div className="grid grid-cols-2 gap-2">
        <WeightTracker weightLog={weightLog} onAdd={addWeight} />
        <SleepTracker onAdd={addSleep} />
      </div>
      
      {/* Macros */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm px-1">Макронутриенты</h3>
        <MacroItem icon={Beef} label="Белок" current={protein.current} target={protein.target} color="text-primary-400" bgColor="bg-primary-500/20" />
        <MacroItem icon={Droplets} label="Жиры" current={fat.current} target={fat.target} color="text-yellow-400" bgColor="bg-yellow-500/20" />
        <MacroItem icon={Wheat} label="Углеводы" current={carbs.current} target={carbs.target} color="text-pink-400" bgColor="bg-pink-500/20" />
      </div>
      
      {/* Achievements */}
      <Achievements userAchievements={achievements} />
      
      {/* Today's Entries Preview */}
      {stats.entries.length > 0 && (
        <div className="p-3 glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Приёмы пищи</h3>
            <span className="text-dark-500 text-xs">{stats.entries.length}</span>
          </div>
          <div className="space-y-1">
            {stats.entries.slice(0, 3).map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{entry.name}</span>
                <span className="text-orange-400 font-medium">{entry.calories}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Workouts Preview */}
      {stats.workouts.length > 0 && (
        <div className="p-3 glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Тренировки</h3>
            <span className="text-dark-500 text-xs">{stats.workouts.filter(w => w.completed).length}/{stats.workouts.length}</span>
          </div>
          <div className="space-y-1">
            {stats.workouts.map((workout, i) => (
              <div key={workout.id} className="flex items-center gap-2 text-sm">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${workout.completed ? 'bg-green-500' : 'bg-dark-700'}`}>
                  {workout.completed ? <Check className="w-3 h-3 text-white" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className="truncate">{workout.timeSlotLabel || 'Тренировка'}</span>
                <span className="text-dark-500 ml-auto text-xs">{workout.duration || 0} мин</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
