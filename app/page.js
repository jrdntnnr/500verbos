'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import './globals.css'

const PERSONS = ["eu","tu","ele/ela","nós","vós","eles/elas"]
const INDICATIVE_TENSES = [
  ["presente", "PRESENTE"],
  ["pretérito_perfeito", "P. PERFEITO"],
  ["pretérito_imperfeito", "P. IMPERFEITO"],
  ["futuro", "FUTURO"],
  ["condicional", "CONDICIONAL"]
]
const SUBJUNCTIVE_TENSES = [
  ["presente", "SUBJ. PRESENTE"],
  ["imperfeito", "SUBJ. IMPERFEITO"],
  ["futuro", "SUBJ. FUTURO"]
]

// 70s tag class by category
const catTag = (v) =>
  v.irregular ? 'tag tag-irreg'
    : v.category === 'ar' ? 'tag tag-ar'
    : v.category === 'er' ? 'tag tag-er'
    : 'tag tag-ir'

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all') // all | ar | er | ir | irregular
  const [expanded, setExpanded] = useState(new Set())

  // ephemeral status “telemetry”
  const [status, setStatus] = useState({ filter: 'ALL', search: '' })

  // TTS voice (prefer EP)
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

  // Load conjugations
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

  // Filtered rows
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

  // Interaction: toggle card
  const toggle = (rank) => {
    const s = new Set(expanded)
    s.has(rank) ? s.delete(rank) : s.add(rank)
    setExpanded(s)
  }

  // Interaction: filter buttons -> update status
  const setFilter = (k) => {
    setFilterCat(k)
    setStatus(s => ({ ...s, filter: k.toUpperCase() }))
  }

  // Interaction: search box -> update status
  useEffect(() => {
    const id = setTimeout(() => setStatus(s => ({ ...s, search })), 120)
    return () => clearTimeout(id)
  }, [search])

  if (loading) return (
    <div className="min-h-screen console-bg grid place-items-center">
      <div className="term-card p-6 rounded-xl font-mono">
        >> BOOT… <span className="cursor" />
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen console-bg p-6">
      <div className="max-w-3xl mx-auto term-card rounded-2xl p-6">
        <div className="ascii-title">>> ERROR</div>
        <div className="ascii-rule" />
        <pre>{error}</pre>
        <div className="ascii-rule" />
        <div className="kv">FIX <b>ADD /public/conjugations.json</b> THEN REFRESH</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen console-bg px-3 md:px-6 py-5">
      {/* Terminal Header */}
      <header className="max-w-7xl mx-auto term-card rounded-2xl p-5 md:p-7">
        <div className="ascii-title text-xl md:text-2xl">>> EP VERB CONSOLE</div>
        <div className="ascii-rule" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="md:col-span-2">
            <input
              className="w-full px-3 py-2 rounded bg-black/40 border border-[#1f2021] text-[.95rem] outline-none focus:border-[var(--accent)]"
              placeholder="SEARCH  ▒ verb / translation"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 justify-start md:justify-end">
            {['all','ar','er','ir','irregular'].map(k => (
              <button key={k}
                onClick={() => setFilter(k)}
                className={`btn px-3 py-1 rounded ${filterCat===k ? 'btn-on' : ''}`}>
                [{k.toUpperCase()}]
              </button>
            ))}
          </div>
        </div>
        <div className="ascii-rule" />
        <div className="status">
          <span>ACTIVE FILTER: <b>{status.filter}</b></span>
          <span>SEARCH: <b>{status.search || '—'}</b></span>
          <span className="flex items-center gap-1"><span className="dot live" /> LINK OK</span>
          <span>COUNT: <b>{filtered.length}/{data.length}</b></span>
        </div>
      </header>

      {/* Cards */}
      <main className="max-w-7xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filtered.map(v => (
          <section key={v.rank} className="term-card rounded-2xl overflow-hidden">
            <div className="p-4 md:p-5 flex items-start justify-between cursor-pointer select-none"
                 onClick={() => toggle(v.rank)}>
              <div>
                <div className="kv mb-1">ID <b>#{String(v.rank).padStart(3,'0')}</b></div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{v.verb}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(v.verb) }}
                    className="speak w-8 h-8 flex items-center justify-center text-sm"
                    title="play">
                    🔊
                  </button>
                </div>
                <div className="text-[.9rem] opacity-80">{v.translation}</div>
              </div>
              <div className="text-right">
                <div className="kv mb-1">CLASS</div>
                <div className={catTag(v)}>
                  {v.irregular ? 'IRREG' : 'REG'} • {v.category.toUpperCase()}
                </div>
              </div>
            </div>

            {expanded.has(v.rank) && (
              <div className="px-4 pb-5 border-t border-[#1f2021]">
                <Tabs verb={v} onSpeak={speak} />
              </div>
            )}
          </section>
        ))}
      </main>

      {/* Footer status line */}
      <div className="max-w-7xl mx-auto mt-4 kv">
        └─ READY ▒ PRESS [AR]/[ER]/[IR]/[IRREGULAR] TO FILTER • CLICK A FORM TO SPEAK
      </div>
    </div>
  )
}

/* ---------- Tables & Tabs ---------- */
function Table({ title, persons, rows, onSpeak }) {
  return (
    <div className="mb-6">
      <div className="kv mb-1">MODE</div>
      <div className="text-[.95rem] text-[var(--accent)] tracking-[.06em]">{title}</div>
      <div className="overflow-x-auto rounded-xl border border-[#1f2021] mt-2">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/30">
            <tr>
              <th className="px-3 py-2"></th>
              {persons.map(p => (
                <th key={p} className="px-3 py-2 text-[var(--dim)]">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([key,label,forms]) => (
              <tr key={key} className="border-t border-[#1f2021]">
                <td className="px-3 py-2 font-semibold">{label}</td>
                {forms.map((f, i) => (
                  <td key={i} className="px-2 py-1">
                    <button
                      onClick={() => onSpeak(f)}
                      className="w-full text-left flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5"
                      title="play">
                      <span>{f}</span>
                      <span className="text-[12px] opacity-80">🔊</span>
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
    <div className="pt-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {['indicativo','subjuntivo','imperativo','non_finite'].map(k => (
          <button key={k}
            onClick={() => setTab(k)}
            className={`btn px-3 py-1 rounded ${tab===k ? 'btn-on' : ''}`}>
            [{k === 'non_finite' ? 'NOMINAIS' : k.toUpperCase()}]
          </button>
        ))}
      </div>

      {tab==='indicativo' && (
        <Table title="INDICATIVO" persons={persons} rows={indRows} onSpeak={onSpeak} />
      )}

      {tab==='subjuntivo' && (
        <Table title="SUBJUNTIVO" persons={persons} rows={sjRows} onSpeak={onSpeak} />
      )}

      {tab==='imperativo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="kv mb-1">MODE</div>
            <div className="text-[.95rem] text-[var(--accent)] tracking-[.06em]">IMPERATIVO AFIRMATIVO</div>
            <ul className="mt-2 space-y-1">
              {["tu","você","nós","vós","vocês"].map(p => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-20 text-[var(--dim)]">{p}</span>
                  <button
                    onClick={() => onSpeak(c.imperativo.afirmativo[p])}
                    className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5"
                    title="play">
                    <span>{c.imperativo.afirmativo[p]}</span>
                    <span className="text-[12px] opacity-80">🔊</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="kv mb-1">MODE</div>
            <div className="text-[.95rem] text-[var(--accent)] tracking-[.06em]">IMPERATIVO NEGATIVO</div>
            <ul className="mt-2 space-y-1">
              {["tu","você","nós","vós","vocês"].map(p => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-20 text-[var(--dim)]">{p}</span>
                  <button
                    onClick={() => onSpeak(c.imperativo.negativo[p])}
                    className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5"
                    title="play">
                    <span>{c.imperativo.negativo[p]}</span>
                    <span className="text-[12px] opacity-80">🔊</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab==='non_finite' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(c.non_finite).map(([k,v]) => (
            <div key={k} className="rounded-xl border border-[#1f2021] p-3 bg-black/30">
              <div className="kv">{k.toUpperCase()}</div>
              <button
                onClick={() => onSpeak(v)}
                className="mt-1 text-base hover:underline inline-flex items-center gap-2"
                title="play">
                <span>{v}</span>
                <span className="text-[12px] opacity-80">🔊</span>
              </button>
            </div>
          ))}

          <div className="md:col-span-3">
            <div className="kv mb-1">MODE</div>
            <div className="text-[.95rem] text-[var(--accent)] tracking-[.06em]">INFINITIVO PESSOAL</div>
            <div className="overflow-x-auto rounded-xl border border-[#1f2021] mt-2">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-3 py-2"></th>
                    {["eu","tu","ele/ela","nós","vós","eles/elas"].map(p => (
                      <th key={p} className="px-3 py-2 text-[var(--dim)]">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#1f2021]">
                    <td className="px-3 py-2 font-semibold">INF. PESSOAL</td>
                    {[
                      c.non_finite.infinitivo,
                      c.non_finite.infinitivo + "es",
                      c.non_finite.infinitivo,
                      c.non_finite.infinitivo + "mos",
                      c.non_finite.infinitivo + "des",
                      c.non_finite.infinitivo + "em",
                    ].map((form, i) => (
                      <td key={i} className="px-2 py-1">
                        <button
                          onClick={() => onSpeak(form)}
                          className="w-full text-left flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5"
                          title="play">
                          <span>{form}</span>
                          <span className="text-[12px] opacity-80">🔊</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
