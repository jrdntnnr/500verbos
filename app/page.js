'use client'

import { useState, useEffect, useRef } from 'react'
import './globals.css'

export default function Home() {
  const [verbs, setVerbs] = useState([])
  const [filteredVerbs, setFilteredVerbs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilter, setCurrentFilter] = useState('all')
  const [darkMode, setDarkMode] = useState(false)
  const [expandedCards, setExpandedCards] = useState(new Set())

  // ===== Load verbs from JSON =====
  useEffect(() => {
    fetch('/verbs.json')
      .then(res => {
        if (!res.ok) throw new Error('verbs.json not found in /public folder')
        return res.json()
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('JSON must be an array of verbs')
        setVerbs(data)
        setFilteredVerbs(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // ===== Filtering =====
  useEffect(() => {
    let result = verbs

    if (currentFilter !== 'all') {
      if (currentFilter === 'irregular') {
        result = result.filter(v => v.irregular === true)
      } else {
        result = result.filter(v => v.category === currentFilter)
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        v =>
          v.verb.toLowerCase().includes(query) ||
          v.translation.toLowerCase().includes(query)
      )
    }

    setFilteredVerbs(result)
  }, [searchQuery, currentFilter, verbs])

  // ===== TTS: preload voices and keep a stable pick =====
  const [voices, setVoices] = useState([])
  const selectedVoiceRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis

    const loadVoices = () => {
      const list = synth.getVoices()
      setVoices(list)

      const preferredByName = [
        // Chrome
        'Google português de Portugal',
        'Google português',
        // Edge/Windows
        'Microsoft Duarte Online (Natural) - Portuguese (Portugal)',
        'Microsoft Maria Online (Natural) - Portuguese (Portugal)'
      ]
      const byName = list.find(v => preferredByName.includes(v.name))
      const byLangPtPT = list.find(v => v.lang?.toLowerCase().startsWith('pt-pt'))
      const byLangPt = list.find(v => v.lang?.toLowerCase().startsWith('pt'))

      selectedVoiceRef.current = byName || byLangPtPT || byLangPt || null
    }

    // try now (may be empty first call), and subscribe for when ready
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    return () => synth.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const speak = (text, buttonId) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis

    if (synth.speaking) synth.cancel()

    const doSpeak = () => {
      // remove translation after dash to avoid mixed-language TTS
      const cleanText = text.split(/[-–]/)[0].trim()
      const utter = new SpeechSynthesisUtterance(cleanText)
      utter.lang = 'pt-PT'
      utter.rate = 0.9
      utter.pitch = 1
      utter.volume = 1

      const v = selectedVoiceRef.current
      if (v) {
        utter.voice = v
      } else {
        const list = synth.getVoices()
        const fallback =
          list.find(v => v.lang?.toLowerCase().startsWith('pt-pt')) ||
          list.find(v => v.lang?.toLowerCase().startsWith('pt')) ||
          null
        if (fallback) utter.voice = fallback
      }

      const btn = document.getElementById(buttonId)
      if (btn) btn.classList.add('speaking')
      utter.onend = () => {
        if (btn) btn.classList.remove('speaking')
      }

      synth.speak(utter)
    }

    setTimeout(doSpeak, 60) // small delay helps Chrome keep the selected voice after cancel()
  }

  // ===== UI helpers =====
  const toggleCard = (rank) => {
    const next = new Set(expandedCards)
    next.has(rank) ? next.delete(rank) : next.add(rank)
    setExpandedCards(next)
  }

  // ===== Render =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading verbs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border-2 border-red-500 text-red-900 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">❌ Error Loading Verbs</h2>
            <p className="mb-4">{error}</p>
            <div className="bg-white p-4 rounded">
              <p className="font-semibold mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Place your <code className="bg-gray-200 px-1">verbs.json</code> file in the <code className="bg-gray-200 px-1">/public</code> directory</li>
                <li>Make sure the file is named exactly <code className="bg-gray-200 px-1">verbs.json</code></li>
                <li>Verify the JSON structure matches the expected format</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🇵🇹 Top 500 European Portuguese Verbs
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Learn by frequency • Click verbs to see examples
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">-ar</span>
                <span className="text-sm">Regular -ar verbs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">-er</span>
                <span className="text-sm">Regular -er verbs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">-ir</span>
                <span className="text-sm">Regular -ir verbs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <span className="text-sm">Irregular verb</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-xl">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verbs in Portuguese or English..."
                className="flex-1 min-w-[250px] px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              
              <button
                onClick={() => setCurrentFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  currentFilter === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCurrentFilter('ar')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  currentFilter === 'ar' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                -ar
              </button>
              <button
                onClick={() => setCurrentFilter('er')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  currentFilter === 'er' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                -er
              </button>
              <button
                onClick={() => setCurrentFilter('ir')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  currentFilter === 'ir' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                -ir
              </button>
              <button
                onClick={() => setCurrentFilter('irregular')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  currentFilter === 'irregular' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Irregular
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center text-white text-lg font-semibold mb-6">
            Showing {filteredVerbs.length} of {verbs.length} verbs
          </div>

          {/* Verb Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVerbs.map(verb => (
              <div
                key={verb.rank}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer"
                onClick={() => toggleCard(verb.rank)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-sm font-bold">
                    #{verb.rank}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
                      verb.category === 'ar' ? 'bg-green-500' :
                      verb.category === 'er' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      -{verb.category}
                    </span>
                    {verb.irregular && <span className="text-xl">⭐</span>}
                  </div>
                </div>

                {/* Verb */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {verb.verb}
                    </h3>
                    <button
                      id={`verb-${verb.rank}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        speak(verb.verb, `verb-${verb.rank}`)
                      }}
                      className="w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition"
                    >
                      🔊
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {verb.translation}
                  </p>
                </div>

                {/* Examples (expandable) */}
                {expandedCards.has(verb.rank) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    {verb.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="flex-1 text-gray-700 dark:text-gray-200 text-sm">
                          {example}
                        </span>
                        <button
                          id={`example-${verb.rank}-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            speak(example, `example-${verb.rank}-${idx}`)
                          }}
                          className="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition text-sm"
                        >
                          🔊
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredVerbs.length === 0 && (
            <div className="text-center text-white text-xl mt-12">
              No verbs found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
