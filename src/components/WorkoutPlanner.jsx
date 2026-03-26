import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Flame, Heart, Zap, Play, RotateCcw, Check, Plus, Clock, Target, AlertCircle, Trash2, CheckCircle } from 'lucide-react'
import useStore from '../store/useStore'
import { selectWorkoutExercises } from '../lib/calculations'

const MAX_WORKOUTS_PER_DAY = 3
const MAX_MINUTES_PER_DAY = 60

const timeSlots = [
  { value: 'morning', label: 'Утро', time: '06:00 - 09:00' },
  { value: 'day', label: 'День', time: '12:00 - 14:00' },
  { value: 'evening', label: 'Вечер', time: '18:00 - 21:00' },
  { value: 'night', label: 'Ночь', time: '21:00 - 23:00' }
]

const goalOptions = [
  { value: 'strength', label: 'Сила', icon: Dumbbell, color: 'from-blue-500 to-cyan-500' },
  { value: 'cardio', label: 'Кардио', icon: Heart, color: 'from-red-500 to-pink-500' },
  { value: 'flexibility', label: 'Растяжка', icon: Zap, color: 'from-purple-500 to-indigo-500' },
  { value: 'mixed', label: 'Комби', icon: Flame, color: 'from-orange-500 to-yellow-500' }
]

const difficultyOptions = [
  { value: 'beginner', label: 'Новичок', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'intermediate', label: 'Средний', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'advanced', label: 'Профи', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
]

function ExerciseCard({ exercise, index, onComplete, isCompleted }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`glass-card-hover p-4 flex items-center gap-4 ${isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-dark-400 font-bold">{index + 1}</div>
      <div className="flex-1">
        <div className="font-medium">{exercise.name}</div>
        <div className="text-dark-500 text-sm">{exercise.muscleGroups.join(', ')}</div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-dark-500 flex items-center gap-1"><Flame className="w-3 h-3" /> {exercise.calories} ккал</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${exercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' : exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{exercise.difficulty}</span>
        </div>
      </div>
      <button onClick={() => onComplete(index)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'}`}>
        <Check className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

function WorkoutResult({ workout, onSave, onReset, canAdd, remainingTime }) {
  const [completed, setCompleted] = useState([])
  const [saved, setSaved] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('evening')
  
  const handleComplete = (index) => {
    setCompleted(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
  }
  
  const handleSaveClick = () => {
    if (!canAdd) return
    onSave({ ...workout, timeSlot: selectedTimeSlot, timeSlotLabel: timeSlots.find(t => t.value === selectedTimeSlot)?.label })
    setSaved(true)
    setShowToast(true)
    setTimeout(() => { setSaved(false); setShowToast(false); }, 3000)
  }
  
  const completionPercentage = Math.round((completed.length / workout.exercises.length) * 100)
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Ваша тренировка</h2>
            <p className="text-dark-500 text-sm">{workout.exercises.length} упражнений</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-400">{completionPercentage}%</div>
            <p className="text-dark-500 text-xs">выполнено</p>
          </div>
        </div>
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden mb-4">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-800/50 p-3 rounded-xl text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
            <div className="font-bold">{workout.totalCalories}</div>
            <div className="text-dark-500 text-xs">ккал</div>
          </div>
          <div className="bg-dark-800/50 p-3 rounded-xl text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <div className="font-bold">~{workout.estimatedDuration}</div>
            <div className="text-dark-500 text-xs">минут</div>
          </div>
          <div className="bg-dark-800/50 p-3 rounded-xl text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <div className="font-bold">{workout.muscleCoverage.length}</div>
            <div className="text-dark-500 text-xs">групп мышц</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">Упражнения</h3>
        <div className="space-y-2">
          {workout.exercises.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} index={index} onComplete={handleComplete} isCompleted={completed.includes(index)} />
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-dark-400 mb-2">Время тренировки:</label>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(slot => (
              <button key={slot.value} onClick={() => setSelectedTimeSlot(slot.value)} disabled={!canAdd} className={`p-2 rounded-xl text-sm transition-all ${selectedTimeSlot === slot.value ? 'bg-primary-500 text-white' : canAdd ? 'bg-dark-700 text-dark-300 hover:bg-dark-600' : 'bg-dark-800 text-dark-500 cursor-not-allowed'}`}>
                <div className="font-medium">{slot.label}</div>
                <div className="text-xs opacity-70">{slot.time}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-400">Осталось времени: <span className="text-primary-400 font-bold">{remainingTime} мин</span></span>
          {!canAdd && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Лимит исчерпан</span>}
        </div>
        
        <div className="flex gap-3">
          <button onClick={onReset} className="btn-secondary flex-1 flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Новый подбор</button>
          <button onClick={handleSaveClick} disabled={saved || !canAdd} className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${saved || !canAdd ? 'bg-dark-700 text-dark-500 cursor-not-allowed' : 'btn-primary'}`}>
            {saved ? <><CheckCircle className="w-4 h-4" /> Сохранено</> : <><Plus className="w-4 h-4" /> Добавить</>}
          </button>
        </div>
      </div>
      
      {showToast && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" /> Тренировка добавлена!
        </motion.div>
      )}
    </motion.div>
  )
}

export default function WorkoutPlanner() {
  const { addWorkoutPlan, todayWorkouts, completeWorkout, removeWorkout, getTodayWorkoutCount, getAvailableTime } = useStore()
  const [goal, setGoal] = useState('mixed')
  const [duration, setDuration] = useState(30)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  
  const todayWorkoutCount = getTodayWorkoutCount()
  const availableTime = getAvailableTime()
  const canAddWorkout = todayWorkoutCount < MAX_WORKOUTS_PER_DAY && availableTime > 0
  const displayDuration = Math.min(duration, availableTime)
  
  const handleGenerate = () => {
    const workout = selectWorkoutExercises({ goal, duration: displayDuration, difficulty })
    setGeneratedWorkout(workout)
  }
  
  const handleSave = (workoutWithTime) => {
    const result = addWorkoutPlan(workoutWithTime)
    if (result.success) setGeneratedWorkout(null)
  }
  
  const handleReset = () => setGeneratedWorkout(null)
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Тренировки</h1>
        <p className="text-dark-400">Планируйте и отслеживайте</p>
      </div>
      
      {/* Today's Workouts */}
      {todayWorkouts.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">На сегодня</h2>
            <span className="text-sm text-dark-400">{todayWorkoutCount}/{MAX_WORKOUTS_PER_DAY} - {todayWorkouts.reduce((s, w) => s + (w.duration || 0), 0)}/{MAX_MINUTES_PER_DAY} мин</span>
          </div>
          <div className="space-y-2">
            {todayWorkouts.map((workout, index) => (
              <div key={workout.id} className={`flex items-center justify-between p-3 rounded-xl ${workout.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-dark-800/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${workout.completed ? 'bg-green-500' : 'bg-dark-700'}`}>
                    {workout.completed ? <Check className="w-4 h-4 text-white" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{workout.timeSlotLabel || 'Тренировка'}</div>
                    <div className="text-dark-500 text-xs">{workout.exercises?.length || 0} упр - {workout.duration || 0} мин</div>
                  </div>
                </div>
                <button onClick={() => workout.completed ? removeWorkout(workout.id) : completeWorkout(workout.id)} className={`p-2 rounded-lg transition-colors ${workout.completed ? 'text-red-400 hover:bg-red-500/20' : 'text-green-400 hover:bg-green-500/20'}`}>
                  {workout.completed ? <Trash2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {generatedWorkout ? (
          <WorkoutResult key="result" workout={generatedWorkout} onSave={handleSave} onReset={handleReset} canAdd={canAddWorkout} remainingTime={availableTime} />
        ) : (
          <motion.div key="generator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <h2 className="font-semibold mb-3">Цель</h2>
              <div className="grid grid-cols-2 gap-3">
                {goalOptions.map(option => (
                  <button key={option.value} onClick={() => setGoal(option.value)} className={`p-4 rounded-xl border transition-all ${goal === option.value ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-800/30 hover:border-dark-600'}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mx-auto mb-2`}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-medium text-center">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="font-semibold mb-3">Длительность</h2>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark-400">Время</span>
                  <span className="text-2xl font-bold">{displayDuration} <span className="text-dark-500 text-sm font-normal">мин</span></span>
                </div>
                <input type="range" min="10" max={Math.min(60, availableTime)} step="5" value={displayDuration} onChange={e => setDuration(Number(e.target.value))} disabled={!canAddWorkout} className={`w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500 ${!canAddWorkout ? 'opacity-50 cursor-not-allowed' : ''}`} />
                <div className="flex justify-between text-dark-500 text-xs mt-2">
                  <span>10 мин</span>
                  <span className="text-primary-400">Доступно: {availableTime} мин</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="font-semibold mb-3">Сложность</h2>
              <div className="grid grid-cols-3 gap-3">
                {difficultyOptions.map(option => (
                  <button key={option.value} onClick={() => setDifficulty(option.value)} className={`p-3 rounded-xl border text-center transition-all ${difficulty === option.value ? option.color : 'border-dark-700 bg-dark-800/30 text-dark-400'}`}>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={handleGenerate} disabled={!canAddWorkout} className={`btn-primary w-full py-4 text-lg ${!canAddWorkout ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {canAddWorkout ? <><Play className="w-5 h-5 inline mr-2" /> Подобрать тренировку</> : <><AlertCircle className="w-5 h-5 inline mr-2" /> Лимит исчерпан</>}
            </button>
            
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-2">Рекомендации</h3>
              <ul className="text-dark-400 text-sm space-y-1">
                <li>Разминка 5-10 минут</li>
                <li>Отдых 30-60 сек между подходами</li>
                <li>Пейте воду каждые 15-20 минут</li>
                <li>Завершайте растяжкой</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}