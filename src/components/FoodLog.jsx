import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, Utensils, Coffee, Moon, Apple, Droplet, Trash2, Flame, Plus, Filter } from 'lucide-react'
import useStore from '../store/useStore'
import { searchFoods, getCategories, formatFoodEntry } from '../lib/database'

const categoryIcons = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Apple,
  drink: Droplet
}

const categoryLabels = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
  drink: 'Напиток'
}

const categoryColors = {
  breakfast: 'from-amber-500 to-orange-500',
  lunch: 'from-green-500 to-emerald-500',
  dinner: 'from-purple-500 to-indigo-500',
  snack: 'from-pink-500 to-rose-500',
  drink: 'from-blue-500 to-cyan-500'
}

function FoodCard({ food, onAdd }) {
  const [showDetails, setShowDetails] = useState(false)
  const Icon = categoryIcons[food.category] || Utensils
  
  return (
    <motion.div
      layout
      className="glass-card-hover p-4 cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[food.category] || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium">{food.name}</div>
            <div className="text-dark-500 text-xs">{food.portion}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-orange-400">{food.calories}</div>
          <div className="text-dark-500 text-xs">ккал</div>
        </div>
      </div>
      
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-dark-700">
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button onClick={(e) => { e.stopPropagation(); onAdd(food, 0.5); setShowDetails(false); }} className="p-2 bg-dark-700/50 rounded-lg text-xs hover:bg-dark-600/50">0.5x</button>
                <button onClick={(e) => { e.stopPropagation(); onAdd(food, 1); setShowDetails(false); }} className="p-2 bg-primary-500/20 rounded-lg text-xs text-primary-400 hover:bg-primary-500/30">1x</button>
                <button onClick={(e) => { e.stopPropagation(); onAdd(food, 1.5); setShowDetails(false); }} className="p-2 bg-dark-700/50 rounded-lg text-xs hover:bg-dark-600/50">1.5x</button>
                <button onClick={(e) => { e.stopPropagation(); onAdd(food, 2); setShowDetails(false); }} className="p-2 bg-dark-700/50 rounded-lg text-xs hover:bg-dark-600/50">2x</button>
              </div>
              <div className="flex justify-center gap-4 text-xs text-dark-400">
                <span>Б: {food.protein}г</span>
                <span>Ж: {food.fat}г</span>
                <span>У: {food.carbs}г</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AddCustomModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', portion: '100г', calories: '', protein: '', fat: '', carbs: '', category: 'snack'
  })
  
  const handleSubmit = () => {
    if (!form.name || !form.calories) return
    onAdd({
      name: form.name, portion: form.portion,
      calories: parseInt(form.calories),
      protein: parseFloat(form.protein) || 0,
      fat: parseFloat(form.fat) || 0,
      carbs: parseFloat(form.carbs) || 0,
      category: form.category
    }, 1)
    onClose()
  }
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end z-50" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="w-full bg-dark-900 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Добавить продукт</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="space-y-4">
          <input type="text" placeholder="Название" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Порция" value={form.portion} onChange={e => setForm({...form, portion: e.target.value})} className="input-field" />
            <input type="number" placeholder="Калории" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" placeholder="Белки" value={form.protein} onChange={e => setForm({...form, protein: e.target.value})} className="input-field" />
            <input type="number" placeholder="Жиры" value={form.fat} onChange={e => setForm({...form, fat: e.target.value})} className="input-field" />
            <input type="number" placeholder="Углеводы" value={form.carbs} onChange={e => setForm({...form, carbs: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Категория</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button key={key} onClick={() => setForm({...form, category: key})} className={`p-2 rounded-lg text-xs transition-all ${form.category === key ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button onClick={handleSubmit} className="btn-primary w-full mt-6">Добавить</button>
      </motion.div>
    </motion.div>
  )
}

export default function FoodLog() {
  const { addFoodEntry, removeFoodEntry, todayEntries } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCustomAdd, setShowCustomAdd] = useState(false)
  
  const categories = ['all', ...getCategories()]
  
  const filteredFoods = useMemo(() => {
    let foods = searchFoods(searchQuery)
    if (selectedCategory !== 'all') foods = foods.filter(f => f.category === selectedCategory)
    return foods
  }, [searchQuery, selectedCategory])
  
  const handleAddFood = (food, multiplier) => {
    const entry = formatFoodEntry(food, multiplier)
    addFoodEntry(entry)
  }
  
  const entriesByCategory = useMemo(() => {
    const grouped = {}
    todayEntries.forEach(entry => {
      if (!grouped[entry.category]) grouped[entry.category] = []
      grouped[entry.category].push(entry)
    })
    return grouped
  }, [todayEntries])
  
  const totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0)
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Питание</h1>
          <p className="text-dark-400">{totalCalories} ккал сегодня</p>
        </div>
        <button onClick={() => setShowCustomAdd(true)} className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </div>
      
      {/* Today's Summary */}
      {todayEntries.length > 0 && (
        <div className="glass-card p-4">
          <h2 className="font-semibold mb-3">Сегодня</h2>
          <div className="space-y-2">
            {Object.entries(entriesByCategory).map(([category, entries]) => {
              const Icon = categoryIcons[category] || Utensils
              const catCalories = entries.reduce((sum, e) => sum + e.calories, 0)
              return (
                <div key={category} className="flex items-center gap-3 p-2 bg-dark-800/30 rounded-xl">
                  <Icon className="w-5 h-5 text-dark-400" />
                  <span className="flex-1 text-dark-300">{categoryLabels[category]}</span>
                  <span className="font-bold text-orange-400">{catCalories}</span>
                  <span className="text-dark-500 text-xs">{entries.length}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input type="text" placeholder="Поиск продуктов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field pl-12" />
      </div>
      
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all ${selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>
            {cat === 'all' ? 'Все' : categoryLabels[cat]}
          </button>
        ))}
      </div>
      
      {/* Food List */}
      <div>
        <h2 className="font-semibold mb-3">Продукты</h2>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
          <AnimatePresence>
            {filteredFoods.map(food => (
              <FoodCard key={food.id} food={food} onAdd={handleAddFood} />
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Recent Entries */}
      {todayEntries.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Недавние</h2>
          <div className="space-y-2">
            {todayEntries.slice(0, 5).map(entry => (
              <motion.div key={entry.id} layout className="glass-card p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{entry.name}</div>
                  <div className="text-dark-500 text-xs">{entry.portion}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-400">{entry.calories}</span>
                  <button onClick={() => removeFoodEntry(entry.id)} className="p-1.5 text-dark-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add Custom Modal */}
      <AnimatePresence>
        {showCustomAdd && <AddCustomModal onClose={() => setShowCustomAdd(false)} onAdd={handleAddFood} />}
      </AnimatePresence>
    </div>
  )
}