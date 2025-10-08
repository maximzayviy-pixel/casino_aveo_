'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice6, Users, Trophy, Coins, LogOut, Play, RotateCcw } from 'lucide-react'

interface User {
  id: string
  username: string
  balance: number
}

interface Player {
  id: string
  username: string
  balance: number
}

interface Bet {
  type: 'red' | 'black' | 'green' | 'even' | 'odd' | 'low' | 'high'
  amount: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPrizes, setShowPrizes] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedChip, setSelectedChip] = useState<number>(10)
  const [bets, setBets] = useState<Bet[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)

  const prizes = [
    {
      name: 'Шевроле Авео',
      emoji: '🚗',
      description: 'Легендарная машина для настоящих победителей!',
      price: 1000000
    },
    {
      name: 'Лабубу',
      emoji: '🏠',
      description: 'Роскошный дом вашей мечты!',
      price: 2000000
    },
    {
      name: 'Матрикс',
      emoji: '💊',
      description: 'Войдите в матрицу и измените реальность!',
      price: 5000000
    }
  ]

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('casino-user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setPlayers([userData])
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('casino-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      balance: 10000 // Starting balance
    }
    
    setUser(newUser)
    setPlayers([newUser])
    localStorage.setItem('casino-user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setPlayers([])
    localStorage.removeItem('casino-user')
  }

  const chipValues = [10, 50, 100, 500, 1000]
  const isRed = (num: number) => [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)
  const isBlack = (num: number) => [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(num)

  const bettingAreas = [
    { type: 'red' as const, label: 'Красное', color: 'bg-red-600', multiplier: 2 },
    { type: 'black' as const, label: 'Черное', color: 'bg-black', multiplier: 2 },
    { type: 'green' as const, label: 'Зеленое (0)', color: 'bg-green-600', multiplier: 36 },
    { type: 'even' as const, label: 'Четное', color: 'bg-blue-600', multiplier: 2 },
    { type: 'odd' as const, label: 'Нечетное', color: 'bg-purple-600', multiplier: 2 },
    { type: 'low' as const, label: '1-18', color: 'bg-yellow-600', multiplier: 2 },
    { type: 'high' as const, label: '19-36', color: 'bg-pink-600', multiplier: 2 },
  ]

  const handlePlaceBet = (betType: Bet['type']) => {
    if (!user || user.balance < selectedChip) return

    const existingBet = bets.find(bet => bet.type === betType)
    if (existingBet) {
      setBets(bets.map(bet => 
        bet.type === betType 
          ? { ...bet, amount: bet.amount + selectedChip }
          : bet
      ))
    } else {
      setBets([...bets, { type: betType, amount: selectedChip }])
    }

    // Update user balance
    const newBalance = user.balance - selectedChip
    const updatedUser = { ...user, balance: newBalance }
    setUser(updatedUser)
    setPlayers([updatedUser])
    localStorage.setItem('casino-user', JSON.stringify(updatedUser))
  }

  const handleSpin = async () => {
    if (bets.length === 0) return
    
    setIsSpinning(true)
    
    // Simulate wheel spin
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate random result (0-36)
    const spinResult = Math.floor(Math.random() * 37)
    setResult(spinResult)
    
    // Process bets
    let totalWinnings = 0
    bets.forEach(bet => {
      let won = false
      let multiplier = 1

      switch (bet.type) {
        case 'red':
          won = isRed(spinResult)
          multiplier = 2
          break
        case 'black':
          won = isBlack(spinResult)
          multiplier = 2
          break
        case 'green':
          won = spinResult === 0
          multiplier = 36
          break
        case 'even':
          won = spinResult !== 0 && spinResult % 2 === 0
          multiplier = 2
          break
        case 'odd':
          won = spinResult !== 0 && spinResult % 2 === 1
          multiplier = 2
          break
        case 'low':
          won = spinResult >= 1 && spinResult <= 18
          multiplier = 2
          break
        case 'high':
          won = spinResult >= 19 && spinResult <= 36
          multiplier = 2
          break
      }

      if (won) {
        totalWinnings += bet.amount * multiplier
      }
    })

    // Update player balance with winnings
    if (user) {
      const newBalance = user.balance + totalWinnings
      const updatedUser = { ...user, balance: newBalance }
      setUser(updatedUser)
      setPlayers([updatedUser])
      localStorage.setItem('casino-user', JSON.stringify(updatedUser))
    }
    
    setTimeout(() => {
      setIsSpinning(false)
      setBets([])
      setResult(null)
    }, 4000)
  }

  const getTotalBet = () => {
    return bets.reduce((total, bet) => total + bet.amount, 0)
  }

  const getChipClass = (value: number) => {
    const classes = {
      10: 'chip chip-10',
      50: 'chip chip-50', 
      100: 'chip chip-100',
      500: 'chip chip-500',
      1000: 'chip chip-1000'
    }
    return classes[value as keyof typeof classes] || 'chip'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-casino-gold border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {!user ? (
        // Login Screen
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md w-full"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-casino-gold to-yellow-400 rounded-full mb-4"
              >
                <Dice6 className="w-10 h-10 text-black" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🎰 Local Casino
              </h1>
              <p className="text-gray-300 text-lg">
                Играйте с друзьями по локальной сети!
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-casino-gold rounded-2xl p-8 shadow-2xl">
              <LoginForm onLogin={login} />
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => setShowPrizes(!showPrizes)}
              className="mt-6 w-full casino-button"
            >
              <Trophy className="w-5 h-5 inline mr-2" />
              Посмотреть призы
            </motion.button>

            <AnimatePresence>
              {showPrizes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3"
                >
                  {prizes.map((prize, index) => (
                    <motion.div
                      key={prize.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border border-casino-gold rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{prize.emoji}</span>
                        <div>
                          <h3 className="font-bold text-white">{prize.name}</h3>
                          <p className="text-sm text-gray-300">{prize.description}</p>
                          <p className="text-casino-gold font-bold">
                            {prize.price.toLocaleString()} тугриков
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 text-casino-gold">
                <Coins className="w-5 h-5" />
                <span className="text-lg font-bold">Начальный капитал: 10,000 тугриков</span>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        // Casino Lobby
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {/* Header */}
          <header className="bg-black/40 backdrop-blur-sm border-b border-casino-gold">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 bg-gradient-to-r from-casino-gold to-yellow-400 rounded-full flex items-center justify-center"
                  >
                    <span className="text-black font-bold text-lg">🎰</span>
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Local Casino</h1>
                    <p className="text-sm text-gray-400">Добро пожаловать, {user.username}!</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-lg border border-casino-gold">
                    <Coins className="w-5 h-5 text-casino-gold" />
                    <span className="text-white font-bold">
                      {user.balance.toLocaleString()} тугриков
                    </span>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500 text-red-400 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Roulette Table */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Roulette Wheel */}
              <div className="flex justify-center">
                <div className="relative">
                  <motion.div
                    className="roulette-wheel"
                    animate={isSpinning ? { rotate: [0, 1800 + (result || 0) * 10] } : {}}
                    transition={{ duration: 3, ease: "easeOut" }}
                  >
                    <div className="roulette-ball" />
                    
                    {/* Numbers around the wheel */}
                    {Array.from({ length: 37 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-8 h-8 flex items-center justify-center text-white font-bold text-xs"
                        style={{
                          transform: `rotate(${i * 9.73}deg) translateY(-180px)`,
                          transformOrigin: 'center'
                        }}
                      >
                        {i}
                      </div>
                    ))}
                  </motion.div>
                  
                  {result !== null && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-casino-gold text-black font-bold text-2xl px-4 py-2 rounded-full shadow-lg"
                    >
                      {result}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Betting Areas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bettingAreas.map((area) => {
                  const bet = bets.find(b => b.type === area.type)
                  return (
                    <motion.button
                      key={area.type}
                      onClick={() => handlePlaceBet(area.type)}
                      disabled={isSpinning || !user || user.balance < selectedChip}
                      className={`betting-area ${area.color} text-white font-bold py-6 px-4 rounded-lg relative overflow-hidden group`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">{area.label}</div>
                        <div className="text-sm opacity-75">x{area.multiplier}</div>
                      </div>
                      
                      {bet && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 bg-casino-gold text-black text-xs font-bold px-2 py-1 rounded-full"
                        >
                          {bet.amount}
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Chip Selection */}
              <div className="flex justify-center space-x-4">
                {chipValues.map((value) => (
                  <button
                    key={value}
                    onClick={() => setSelectedChip(value)}
                    className={`${getChipClass(value)} ${
                      selectedChip === value ? 'ring-4 ring-casino-gold' : ''
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {/* Game Controls */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSpin}
                  disabled={bets.length === 0 || isSpinning}
                  className="casino-button flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Крутить рулетку</span>
                </button>
                
                <button
                  onClick={() => setBets([])}
                  disabled={bets.length === 0 || isSpinning}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Очистить ставки</span>
                </button>
              </div>

              {/* Current Bets */}
              {bets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 backdrop-blur-sm border border-casino-gold rounded-lg p-4"
                >
                  <h3 className="text-white font-bold mb-3">Ваши ставки:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {bets.map((bet, index) => (
                      <div key={index} className="bg-white/10 rounded p-2 text-center">
                        <div className="text-white font-bold">{bet.type}</div>
                        <div className="text-casino-gold">{bet.amount} тугриков</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-white font-bold">Общая сумма: </span>
                    <span className="text-casino-gold font-bold">{getTotalBet()} тугриков</span>
                  </div>
                </motion.div>
              )}

              {/* Game Status */}
              <div className="text-center">
                {isSpinning ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-casino-gold text-lg font-bold"
                  >
                    Крутим рулетку...
                  </motion.div>
                ) : (
                  <div className="text-gray-400">
                    Выберите ставки и крутите рулетку!
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Prize Banner */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-casino-gold to-yellow-400 text-black p-4 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">Главные призы:</span>
            </div>
            <div className="text-sm space-y-1">
              <div>🚗 Шевроле Авео - 1,000,000</div>
              <div>🏠 Лабубу - 2,000,000</div>
              <div>💊 Матрикс - 5,000,000</div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Login Form Component
function LoginForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    try {
      await onLogin(username.trim())
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Добро пожаловать в казино!
        </h2>
        <p className="text-gray-400">
          Введите ваше имя для входа в игру
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">👤</span>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ваше имя"
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-casino-gold rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent"
          maxLength={20}
          required
        />
      </div>

      <motion.button
        type="submit"
        disabled={!username.trim() || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full casino-button flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Play className="w-5 h-5" />
            <span>Войти в казино</span>
          </>
        )}
      </motion.button>

      <div className="text-center text-sm text-gray-400">
        При входе вы получите 10,000 тугриков
      </div>
    </form>
  )
}
