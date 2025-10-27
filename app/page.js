'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import './globals.css'

const PERSONS = ["eu","tu","ele/ela","nós","vós","eles/elas"]
const INDICATIVE_TENSES = [
  ["presente", "Presente"],
  ["pretérito_perfeito", "Pretérito Perfeito"],
  ["pretérito_imperfeito", "Pretérito Imperfeito"],
  ["futuro", "Futuro do Presente"],
  ["condicional", "Condicional"]
]
const SUBJUNCTIVE_TENSES = [
  ["presente", "Presente"],
  ["imperfeito", "Pretérito Imperfeito"],
  ["futuro", "Futuro"]
]

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all') // all | ar | er | ir | irregular
  const [expanded, setExpanded] = useState(new Set())
  const [dark, setDark] = useState(false)

  // TTS voice (Portuguese, EP if available)
  const voiceRef = useRef(null)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const loadVoices = () => {
      const voices = synth.getVoices()
      const preferred = [
        'Google português de Portugal',
        'Microsoft Duarte Online (Natural) - Portuguese (Portugal)',
        'Microsoft Maria Online (Natural) - Portuguese (Portugal)'
      ]
      voiceRef.current =
        voices.find(v => preferred.includes(v.name)) ||
        voices.find(v => v.lang?.toLowerCase().startsWith('pt-pt')) ||
        voices.find(v => v.lang?.toLowerCase().startsWith('pt')) ||
        null
    }
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    return () => synth.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const speak = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-PT'
    if (voiceRef.current) u.voice = voiceRef.current
    u.rate = 0.98
    u.pitch = 1
    synth.speak(u)
  }

  // Load JSON
  useEffect(() => {
    fetch('/conjugations.json')
      .then(r => {
        if (!r.ok) throw new Error('Place conjugations.json in /public')
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let rows = data
    if (filterCat !== 'all') {
      if (filterCat === 'irregular') rows = rows.filter(v => v.irregular)
      else rows = rows.filter(v => v.category === filterCat)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(v =>
        v.verb.toLowerCase().includes(q) ||
        (v.translation || '').toLowerCase().includes(q)
      )
    }
    return rows
  }, [data, search, filterCat])

  const toggle = (rank) => {
    const s = new Set(expanded)
    s.has(rank) ? s.delete(rank) : s.add(rank)
    setExpanded(s)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading…</div>
  if (error) return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-red-100 border-2 border-red-500 text-red-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-3">❌ Failed to load</h2>
        <p>{error}</p>
        <p className="mt-2 text-sm">Make sure the file is <code>/public/conjugations.json</code>.</p>
      </div>
    </div>
  )

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 mb-6 shadow">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🇵🇹 European Portuguese Verb Conjugations
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Full tables • EP forms (incl. <i>vós</i>) • Click a form to hear it
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <input
                className="flex-1 min-w-[260px] px-4 py-2 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search Portuguese or English…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {['all','ar','er','ir','irregular'].map(k => (
                <button key={k}
                  onClick={() => setFilterCat(k)}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    filterCat===k ? 'bg-purple-600 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}>
                  {k.toUpperCase()}
                </button>
              ))}
              <button onClick={() => setDark(!dark)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold">
                {dark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          {/* Count */}
          <div className="text-center text-gray-800 dark:text-gray-200 mb-4 font-semibold">
            Showing {filtered.length} of {data.length} verbs
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(v => (
              <div key={v.rank}
                   className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
                <div className="p-5 flex items-center justify-between cursor-pointer"
                     onClick={() => toggle(v.rank)}>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">#{v.rank}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{v.verb}</div>
                    <div className="text-gray-600 dark:text-gray-300">{v.translation}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
                      v.category==='ar' ? 'bg-green-500' :
                      v.category==='er' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>-{v.category}</span>
                    {v.irregular && <span className="text-xl" title="Irregular">⭐</span>}
                  </div>
                </div>

                {expanded.has(v.rank) && (
                  <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-700">
                    <Tabs verb={v} onSpeak={speak} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length===0 && (
            <div className="text-center text-gray-700 dark:text-gray-200 text-lg mt-10">
              No verbs match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Table({ title, persons, rows, onSpeak }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2"></th>
              {persons.map(p => (
                <th key={p} className="px-3 py-2 text-gray-700 dark:text-gray-200">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([key,label,forms]) => (
              <tr key={key} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">{label}</td>
                {forms.map((f, i) => (
                  <td key={i} className="px-3 py-2">
                    <button
                      onClick={() => onSpeak(f)}
                      className="rounded-lg px-2 py-1 hover:bg-purple-50 dark:hover:bg-gray-600 transition"
                      title="Speak">
                      {f}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Tabs({ verb, onSpeak }) {
  const [tab, setTab] = useState('indicativo')
  const c = verb.conjugations
  const persons = c.persons

  const indRows = INDICATIVE_TENSES.map(([k,label]) => [k, label, c.indicativo[k]])
  const sjRows  = SUBJUNCTIVE_TENSES.map(([k,label]) => [k, label, c.subjuntivo[k]])

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['indicativo','subjuntivo','imperativo','non_finite'].map(k => (
          <button key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
              tab===k ? 'bg-purple-600 text-white' :
              'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
            }`}>
            {k==='non_finite' ? 'Nominais' : k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {tab==='indicativo' && <Table title="Indicativo" persons={persons} rows={indRows} onSpeak={onSpeak} />}
      {tab==='subjuntivo' && <Table title="Subjuntivo" persons={persons} rows={sjRows} onSpeak={onSpeak} />}

      {tab==='imperativo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Imperativo Afirmativo</h3>
            <ul className="space-y-1">
              {["tu","você","nós","vós","vocês"].map(p => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-20 text-gray-600 dark:text-gray-300">{p}</span>
                  <button onClick={() => onSpeak(verb.conjugations.imperativo.afirmativo[p])}
                          className="rounded-lg px-2 py-1 hover:bg-purple-50 dark:hover:bg-gray-600 transition">
                    {verb.conjugations.imperativo.afirmativo[p]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Imperativo Negativo</h3>
            <ul className="space-y-1">
              {["tu","você","nós","vós","vocês"].map(p => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-20 text-gray-600 dark:text-gray-300">{p}</span>
                  <button onClick={() => onSpeak(verb.conjugations.imperativo.negativo[p])}
                          className="rounded-lg px-2 py-1 hover:bg-purple-50 dark:hover:bg-gray-600 transition">
                    {verb.conjugations.imperativo.negativo[p]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab==='non_finite' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(verb.conjugations.non_finite).map(([k,v]) => (
            <div key={k} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">{k}</div>
              <button onClick={() => onSpeak(v)}
                      className="mt-1 text-lg font-semibold hover:underline">
                {v}
              </button>
            </div>
          ))}
          {/* Infinitivo pessoal table */}
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Infinitivo Pessoal</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2"></th>
                    {["eu","tu","ele/ela","nós","vós","eles/elas"].map(p => (
                      <th key={p} className="px-3 py-2 text-gray-700 dark:text-gray-200">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">Infinitivo Pessoal</td>
                    {[
                      verb.conjugations.non_finite.infinitivo,
                      verb.conjugations.non_finite.infinitivo + "es",
                      verb.conjugations.non_finite.infinitivo,
                      verb.conjugations.non_finite.infinitivo + "mos",
                      verb.conjugations.non_finite.infinitivo + "des",
                      verb.conjugations.non_finite.infinitivo + "em",
                    ].map((form, i) => (
                      <td key={i} className="px-3 py-2">
                        <button onClick={() => onSpeak(form)} className="rounded-lg px-2 py-1 hover:bg-purple-50 dark:hover:bg-gray-600 transition">{form}</button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      )}
    </div>
  )
}
