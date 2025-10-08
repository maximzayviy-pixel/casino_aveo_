'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Users, Trophy, Coins, LogOut, Play, RotateCcw, Crown } from 'lucide-react'

interface User {
  id: string
  username: string
  balance: number
  isOnline: boolean
  lastSeen: number
}

interface Player {
  id: string
  username: string
  balance: number
  isOnline: boolean
  lastSeen: number
}

interface GameState {
  players: Player[]
  currentSpin: {
    isSpinning: boolean
    result: number | null
    startTime: number | null
  }
  history: number[]
}

interface Bet {
  type: 'red' | 'black' | 'green' | 'even' | 'odd' | 'low' | 'high'
  amount: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPrizes, setShowPrizes] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentSpin: { isSpinning: false, result: null, startTime: null },
    history: []
  })
  const [selectedChip, setSelectedChip] = useState<number>(10)
  const [bets, setBets] = useState<Bet[]>([])
  const [wheelRotation, setWheelRotation] = useState(0)

  const prizes = [
    {
      name: 'АВЕО - ЛУЧШАЯ МАШИНА В МИРЕ',
      emoji: '🏆',
      description: 'Легендарная Шевроле Авео - лучшая машина в мире!',
      price: 5000000,
      isSpecial: true
    },
    {
      name: 'Дом мечты',
      emoji: '🏰',
      description: 'Роскошный особняк для настоящих победителей!',
      price: 10000000
    },
    {
      name: 'Яхта класса люкс',
      emoji: '⛵',
      description: 'Эксклюзивная яхта для круизов по миру!',
      price: 25000000
    }
  ]

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('aveo-casino-user')
    const savedGameState = localStorage.getItem('aveo-casino-game')
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        
        if (savedGameState) {
          const gameData = JSON.parse(savedGameState)
          setGameState(gameData)
        } else {
          // Add current user to game state
          const newGameState: GameState = {
            players: [{ ...userData, isOnline: true, lastSeen: Date.now() }],
            currentSpin: { isSpinning: false, result: null, startTime: null },
            history: []
          }
          setGameState(newGameState)
          localStorage.setItem('aveo-casino-game', JSON.stringify(newGameState))
        }
      } catch (error) {
        console.error('Error parsing saved data:', error)
        localStorage.removeItem('aveo-casino-user')
        localStorage.removeItem('aveo-casino-game')
      }
    }
    
    setIsLoading(false)
  }, [])

  // Simulate shared game state updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.players.length > 0) {
        const updatedGameState = {
          ...gameState,
          players: gameState.players.map(player => ({
            ...player,
            isOnline: Math.random() > 0.1 // Simulate players going online/offline
          }))
        }
        setGameState(updatedGameState)
        localStorage.setItem('aveo-casino-game', JSON.stringify(updatedGameState))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [gameState])

  const login = async (username: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      balance: 50000, // Starting balance increased
      isOnline: true,
      lastSeen: Date.now()
    }

    setUser(newUser)
    
    // Add to shared game state
    const updatedGameState = {
      ...gameState,
      players: [...gameState.players.filter(p => p.id !== newUser.id), newUser]
    }
    setGameState(updatedGameState)
    
    localStorage.setItem('aveo-casino-user', JSON.stringify(newUser))
    localStorage.setItem('aveo-casino-game', JSON.stringify(updatedGameState))
  }

  const logout = () => {
    setUser(null)
    setGameState({
      players: [],
      currentSpin: { isSpinning: false, result: null, startTime: null },
      history: []
    })
    localStorage.removeItem('aveo-casino-user')
    localStorage.removeItem('aveo-casino-game')
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
    if (!user || user.balance < selectedChip || gameState.currentSpin.isSpinning) return

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
    
    // Update game state with new user balance
    const updatedGameState = {
      ...gameState,
      players: gameState.players.map(p => p.id === user.id ? updatedUser : p)
    }
    setGameState(updatedGameState)
    
    localStorage.setItem('aveo-casino-user', JSON.stringify(updatedUser))
    localStorage.setItem('aveo-casino-game', JSON.stringify(updatedGameState))
  }

  const handleSpin = async () => {
     if (bets.length === 0 || !user) return

    // Start spinning
    const newGameState = {
      ...gameState,
      currentSpin: { isSpinning: true, result: null, startTime: Date.now() }
    }
    setGameState(newGameState)

    // Calculate wheel rotation (multiple full rotations + final position)
    const fullRotations = 5 + Math.random() * 3 // 5-8 full rotations
    const finalNumber = Math.floor(Math.random() * 37) // 0-36
    const finalRotation = (fullRotations * 360) + (finalNumber * (360 / 37))
    
    setWheelRotation(prev => prev + finalRotation)

    // Simulate wheel spin duration
    await new Promise(resolve => setTimeout(resolve, 4000))

    // Process bets and calculate winnings
    let totalWinnings = 0
    bets.forEach(bet => {
      let won = false
      let multiplier = 1

      switch (bet.type) {
        case 'red':
          won = isRed(finalNumber)
          multiplier = 2
          break
        case 'black':
          won = isBlack(finalNumber)
          multiplier = 2
          break
        case 'green':
          won = finalNumber === 0
          multiplier = 36
          break
        case 'even':
          won = finalNumber !== 0 && finalNumber % 2 === 0
          multiplier = 2
          break
        case 'odd':
          won = finalNumber !== 0 && finalNumber % 2 === 1
          multiplier = 2
          break
        case 'low':
          won = finalNumber >= 1 && finalNumber <= 18
          multiplier = 2
          break
        case 'high':
          won = finalNumber >= 19 && finalNumber <= 36
          multiplier = 2
          break
      }

      if (won) {
        totalWinnings += bet.amount * multiplier
      }
    })

    // Update user balance with winnings
    const newBalance = user.balance + totalWinnings
    const updatedUser = { ...user, balance: newBalance }
    setUser(updatedUser)
    
    // Update game state
    const finalGameState = {
      ...gameState,
      currentSpin: { isSpinning: false, result: finalNumber, startTime: null },
      history: [...gameState.history.slice(-9), finalNumber], // Keep last 10 results
      players: gameState.players.map(p => p.id === user.id ? updatedUser : p)
    }
    setGameState(finalGameState)
    
    localStorage.setItem('aveo-casino-user', JSON.stringify(updatedUser))
    localStorage.setItem('aveo-casino-game', JSON.stringify(finalGameState))

    // Clear bets after a delay
    setTimeout(() => {
      setBets([])
    }, 3000)
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
           <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
             {!user ? (
               // Premium Login Screen
               <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                 {/* Animated background elements */}
                 <div className="absolute inset-0 overflow-hidden">
                   <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                 </div>
                 
                 <motion.div
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}
                   className="max-w-md w-full relative z-10"
                 >
                   <div className="text-center mb-8">
                     <motion.div
                       initial={{ scale: 0, rotate: -180 }}
                       animate={{ scale: 1, rotate: 0 }}
                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                       className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full mb-6 shadow-2xl shadow-yellow-500/50"
                     >
                       <Car className="w-12 h-12 text-black" />
                     </motion.div>
                     <motion.div
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: 0.5 }}
                     >
                       <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 mb-4">
                         АВЕО
                       </h1>
                       <p className="text-xl font-bold text-yellow-400 mb-2">
                         ЛУЧШАЯ МАШИНА В МИРЕ
                       </p>
                       <p className="text-gray-300 text-lg">
                         Премиальное казино для настоящих победителей!
                       </p>
                     </motion.div>
                   </div>

                   <div className="bg-black/60 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-8 shadow-2xl shadow-black/50">
                     <LoginForm onLogin={login} />
                   </div>

                   <motion.button
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 1 }}
                     onClick={() => setShowPrizes(!showPrizes)}
                     className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30"
                   >
                     <Crown className="w-5 h-5 inline mr-2" />
                     ГЛАВНЫЕ ПРИЗЫ
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
                             className={`${
                               prize.isSpecial 
                                 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 shadow-lg shadow-yellow-500/30' 
                                 : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600'
                             } rounded-2xl p-4 backdrop-blur-sm`}
                           >
                             <div className="flex items-center space-x-4">
                               <span className="text-3xl">{prize.emoji}</span>
                               <div>
                                 <h3 className={`font-bold ${prize.isSpecial ? 'text-yellow-400' : 'text-white'} text-lg`}>
                                   {prize.name}
                                 </h3>
                                 <p className="text-sm text-gray-300">{prize.description}</p>
                                 <p className={`font-bold text-lg ${prize.isSpecial ? 'text-yellow-400' : 'text-yellow-500'}`}>
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
                     <div className="flex items-center justify-center space-x-2 text-yellow-400">
                       <Coins className="w-6 h-6" />
                       <span className="text-xl font-bold">Начальный капитал: 50,000 тугриков</span>
                     </div>
                     <p className="text-gray-400 text-sm mt-2">Присоединяйтесь к общему столу!</p>
                   </div>
                 </motion.div>
               </div>
             ) : (
               // Premium Casino Lobby
               <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
                 {/* Animated background */}
                 <div className="absolute inset-0 overflow-hidden">
                   <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                 </div>
                 
                 {/* Header */}
                 <header className="bg-black/60 backdrop-blur-xl border-b border-yellow-400/30 relative z-10">
                   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center justify-between h-20">
                       <div className="flex items-center space-x-6">
                         <motion.div
                           animate={{ rotate: 360 }}
                           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                           className="w-14 h-14 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50"
                         >
                           <Car className="w-8 h-8 text-black" />
                         </motion.div>
                         <div>
                           <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                             АВЕО КАЗИНО
                           </h1>
                           <p className="text-sm text-gray-300">Добро пожаловать, {user?.username}!</p>
                         </div>
                       </div>

                       <div className="flex items-center space-x-4">
                         {/* Online Players Count */}
                         <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-lg border border-green-400/30">
                           <Users className="w-5 h-5 text-green-400" />
                           <span className="text-white font-bold">
                             {gameState.players.filter(p => p.isOnline).length} игроков
                           </span>
                         </div>
                         
                         {/* Balance */}
                         <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-lg border border-yellow-400/30">
                           <Coins className="w-5 h-5 text-yellow-400" />
                           <span className="text-white font-bold">
                             {user?.balance.toLocaleString()} тугриков
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

                 {/* Main Game Area */}
                 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     
                     {/* Left Sidebar - Players */}
                     <div className="lg:col-span-1 space-y-6">
                       {/* Online Players */}
                       <div className="bg-black/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6">
                         <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                           <Users className="w-5 h-5 mr-2 text-green-400" />
                           Игроки за столом
                         </h3>
                         <div className="space-y-3 max-h-64 overflow-y-auto">
                           {gameState.players.filter(p => p.isOnline).map((player, index) => (
                             <motion.div
                               key={player.id}
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: index * 0.1 }}
                               className={`flex items-center justify-between p-3 rounded-xl ${
                                 player.id === user?.id 
                                   ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30' 
                                   : 'bg-gray-800/50 border border-gray-600/30'
                               }`}
                             >
                               <div className="flex items-center space-x-3">
                                 <div className={`w-3 h-3 rounded-full ${player.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                 <span className={`font-medium ${player.id === user?.id ? 'text-yellow-400' : 'text-white'}`}>
                                   {player.username}
                                 </span>
                               </div>
                               <span className="text-yellow-400 font-bold">
                                 {player.balance.toLocaleString()}
                               </span>
                             </motion.div>
                           ))}
                         </div>
                       </div>

                       {/* Game History */}
                       <div className="bg-black/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6">
                         <h3 className="text-xl font-bold text-white mb-4">Последние результаты</h3>
                         <div className="grid grid-cols-5 gap-2">
                           {gameState.history.slice(-10).map((number, index) => (
                             <div
                               key={index}
                               className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                 number === 0 ? 'bg-green-600' : 
                                 isRed(number) ? 'bg-red-600' : 'bg-black'
                               }`}
                             >
                               {number}
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>

                     {/* Center - Roulette Wheel */}
                     <div className="lg:col-span-2">
                       <div className="flex flex-col items-center space-y-8">
                         {/* Premium Roulette Wheel */}
                         <div className="relative">
                           <motion.div
                             className="relative w-96 h-96"
                             style={{ rotate: wheelRotation }}
                           >
                             {/* Wheel Background */}
                             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-yellow-400 shadow-2xl shadow-yellow-400/30">
                               {/* Numbers around the wheel */}
                               {Array.from({ length: 37 }, (_, i) => (
                                 <div
                                   key={i}
                                   className="absolute w-12 h-12 flex items-center justify-center text-white font-bold text-sm rounded-full"
                                   style={{
                                     transform: `rotate(${i * (360 / 37)}deg) translateY(-176px)`,
                                     transformOrigin: 'center',
                                     backgroundColor: i === 0 ? '#16a34a' : isRed(i) ? '#dc2626' : '#000000'
                                   }}
                                 >
                                   {i}
                                 </div>
                               ))}
                             </div>
                             
                             {/* Center Hub */}
                             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-black shadow-lg"></div>
                           </motion.div>

                           {/* Ball */}
                           <motion.div
                             className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg z-10"
                             animate={gameState.currentSpin.isSpinning ? {
                               x: [0, 50, -30, 20, 0],
                               y: [0, -30, 40, -20, 0],
                               rotate: [0, 180, 360]
                             } : {}}
                             transition={{ duration: 4, ease: "easeInOut" }}
                           />

                           {/* Result Display */}
                           {gameState.currentSpin.result !== null && (
                             <motion.div
                               initial={{ scale: 0, rotate: -180 }}
                               animate={{ scale: 1, rotate: 0 }}
                               className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-3xl px-8 py-4 rounded-2xl shadow-2xl shadow-yellow-500/50"
                             >
                               {gameState.currentSpin.result}
                             </motion.div>
                           )}
                         </div>

                         {/* Premium Betting Areas */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                           {bettingAreas.map((area) => {
                             const bet = bets.find(b => b.type === area.type)
                             return (
                               <motion.button
                                 key={area.type}
                                 onClick={() => handlePlaceBet(area.type)}
                                 disabled={gameState.currentSpin.isSpinning || !user || user.balance < selectedChip}
                                 className={`${area.color} text-white font-bold py-6 px-4 rounded-2xl relative overflow-hidden group border-2 border-transparent hover:border-yellow-400/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                                 whileHover={{ scale: 1.05 }}
                                 whileTap={{ scale: 0.95 }}
                               >
                                 <div className="text-center relative z-10">
                                   <div className="text-lg font-bold">{area.label}</div>
                                   <div className="text-sm opacity-75">x{area.multiplier}</div>
                                 </div>

                                 {bet && (
                                   <motion.div
                                     initial={{ scale: 0 }}
                                     animate={{ scale: 1 }}
                                     className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                                   >
                                     {bet.amount}
                                   </motion.div>
                                 )}

                                 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                               </motion.button>
                             )
                           })}
                         </div>

                         {/* Premium Chip Selection */}
                         <div className="flex justify-center space-x-4">
                           {chipValues.map((value) => (
                             <motion.button
                               key={value}
                               onClick={() => setSelectedChip(value)}
                               className={`${getChipClass(value)} ${
                                 selectedChip === value ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''
                               } transform hover:scale-110 transition-all duration-200`}
                               whileHover={{ scale: 1.1 }}
                               whileTap={{ scale: 0.9 }}
                             >
                               {value}
                             </motion.button>
                           ))}
                         </div>

                         {/* Premium Game Controls */}
                         <div className="flex justify-center space-x-6">
                           <motion.button
                             onClick={handleSpin}
                             disabled={bets.length === 0 || gameState.currentSpin.isSpinning}
                             className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100"
                             whileHover={{ scale: 1.05 }}
                             whileTap={{ scale: 0.95 }}
                           >
                             <Play className="w-6 h-6" />
                             <span className="text-lg">КРУТИТЬ РУЛЕТКУ</span>
                           </motion.button>

                           <motion.button
                             onClick={() => setBets([])}
                             disabled={bets.length === 0 || gameState.currentSpin.isSpinning}
                             className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100"
                             whileHover={{ scale: 1.05 }}
                             whileTap={{ scale: 0.95 }}
                           >
                             <RotateCcw className="w-5 h-5" />
                             <span>Очистить ставки</span>
                           </motion.button>
                         </div>
                       </div>
                     </div>
                   </div>

                 {/* Current Bets Display */}
                 {bets.length > 0 && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-black/60 backdrop-blur-xl border border-yellow-400/30 rounded-2xl p-6 mt-8"
                   >
                     <h3 className="text-white font-bold mb-4 text-xl">Ваши ставки:</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {bets.map((bet, index) => (
                         <div key={index} className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-3 text-center border border-gray-600/30">
                           <div className="text-white font-bold capitalize">{bet.type}</div>
                           <div className="text-yellow-400 font-bold">{bet.amount.toLocaleString()} тугриков</div>
                         </div>
                       ))}
                     </div>
                     <div className="mt-4 text-center">
                       <span className="text-white font-bold text-lg">Общая сумма: </span>
                       <span className="text-yellow-400 font-bold text-xl">{getTotalBet().toLocaleString()} тугриков</span>
                     </div>
                   </motion.div>
                 )}

                 {/* Game Status */}
                 <div className="text-center mt-6">
                   {gameState.currentSpin.isSpinning ? (
                     <motion.div
                       animate={{ opacity: [0.5, 1, 0.5] }}
                       transition={{ duration: 1, repeat: Infinity }}
                       className="text-yellow-400 text-xl font-bold"
                     >
                       🎲 Крутим рулетку...
                     </motion.div>
                   ) : (
                     <div className="text-gray-400 text-lg">
                       Выберите ставки и крутите рулетку!
                     </div>
                   )}
                 </div>
               </main>

               {/* Premium Prize Banner */}
               <motion.div
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1 }}
                 className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black p-6 rounded-2xl shadow-2xl shadow-yellow-500/30 max-w-sm border-2 border-yellow-400"
               >
                 <div className="flex items-center space-x-2 mb-3">
                   <Crown className="w-6 h-6" />
                   <span className="font-black text-lg">ГЛАВНЫЕ ПРИЗЫ:</span>
                 </div>
                 <div className="text-sm space-y-2">
                   <div className="font-bold">🏆 АВЕО - ЛУЧШАЯ МАШИНА - 5,000,000</div>
                   <div>🏰 Дом мечты - 10,000,000</div>
                   <div>⛵ Яхта класса люкс - 25,000,000</div>
                 </div>
               </motion.div>
             </div>
           )}
         </div>
       )
     }

// Premium Login Form Component
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
          Добро пожаловать в АВЕО КАЗИНО!
        </h2>
        <p className="text-gray-400">
          Введите ваше имя для входа в премиальную игру
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-yellow-400 text-xl">👤</span>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ваше имя"
          className="w-full pl-12 pr-4 py-4 bg-white/10 border border-yellow-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg font-medium"
          maxLength={20}
          required
        />
      </div>

      <motion.button
        type="submit"
        disabled={!username.trim() || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Play className="w-6 h-6" />
            <span className="text-lg">ВОЙТИ В КАЗИНО</span>
          </>
        )}
      </motion.button>

      <div className="text-center text-sm text-gray-400">
        При входе вы получите 50,000 тугриков и присоединитесь к общему столу!
      </div>
    </form>
  )
}
