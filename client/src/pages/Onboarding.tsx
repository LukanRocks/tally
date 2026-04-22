import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound, Plus, Gamepad2, Users, ChevronRight, Check } from 'lucide-react'
import { api, Player, Game } from '../lib/api'
import { useSettings } from '../contexts/SettingsContext'

type Step = 1 | 2 | 3

export default function Onboarding() {
  const navigate = useNavigate()
  const { settings, updateSetting, refreshSettings } = useSettings()
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [hostName, setHostName] = useState('')
  const [hostPlayer, setHostPlayer] = useState<Player | null>(null)
  const [hostError, setHostError] = useState('')
  const [hostSubmitting, setHostSubmitting] = useState(false)
  // Step 2
  const [friends, setFriends] = useState<Player[]>([])
  const [friendName, setFriendName] = useState('')
  const [friendError, setFriendError] = useState('')

  // Step 3
  const [games, setGames] = useState<Game[]>([])
  const [gameName, setGameName] = useState('')
  const [gameError, setGameError] = useState('')
  const [completing, setCompleting] = useState(false)

  // Resume: if default_owner_id is already set, skip to step 2
  useEffect(() => {
    if (!settings) return
    if (settings.default_owner_id != null) {
      api.players.get(settings.default_owner_id).then((p) => {
        setHostPlayer(p)
        setStep(2)
      }).catch(() => {
        // player was soft-deleted, stay on step 1
      })
    }
  }, [settings])

  async function handleHostContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!hostName.trim()) { setHostError('Name is required'); return }
    setHostSubmitting(true)
    setHostError('')
    try {
      const player = await api.players.create(hostName.trim())
      await updateSetting({ default_owner_id: player.id })
      setHostPlayer(player)
      setStep(2)
    } catch (err: any) {
      setHostError(err.message)
    } finally {
      setHostSubmitting(false)
    }
  }

async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault()
    if (!friendName.trim()) return
    setFriendError('')
    try {
      const p = await api.players.create(friendName.trim())
      setFriends((f) => [...f, p])
      setFriendName('')
    } catch (err: any) {
      setFriendError(err.message)
    }
  }

  async function handleAddGame(e: React.FormEvent) {
    e.preventDefault()
    if (!gameName.trim()) return
    setGameError('')
    try {
      const g = await api.games.create({
        name: gameName.trim(),
        description: null,
        quick_rules: null,
        min_players: null,
        max_players: null,
        purchase_at: null,
        price: null,
        cover_image_path: null,
        owner_id: settings?.default_owner_id ?? null,
        owner_name: null,
      })
      setGames((gs) => [...gs, g])
      setGameName('')
    } catch (err: any) {
      setGameError(err.message)
    }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      await updateSetting({ onboarded: 1 })
      await refreshSettings()
      navigate('/home', { replace: true })
    } catch (err: any) {
      setGameError(err.message)
      setCompleting(false)
    }
  }

  const steps = [
    { n: 1, label: 'You' },
    { n: 2, label: 'Friends' },
    { n: 3, label: 'Games' },
  ]

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12'>
      <div className='w-full max-w-md'>

        {/* Header */}
        <div className='mb-10 text-center'>
          <h1 className='text-3xl font-bold text-foreground'>Welcome to Tally</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Let's get you set up in a few quick steps.</p>
        </div>

        {/* Step indicators */}
        <div className='mb-10 flex items-center justify-center gap-0'>
          {steps.map((s, i) => (
            <div key={s.n} className='flex items-center'>
              <div className='flex flex-col items-center gap-1'>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    step > s.n
                      ? 'bg-primary text-primary-foreground'
                      : step === s.n
                        ? 'border-2 border-primary bg-background text-primary'
                        : 'border-2 border-border bg-background text-muted-foreground'
                  }`}
                >
                  {step > s.n ? <Check size={13} /> : s.n}
                </div>
                <span className={`text-xs ${step === s.n ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mb-5 mx-3 h-px w-12 transition-colors ${step > s.n ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Host */}
        {step === 1 && (
          <div className='rounded-2xl border border-border bg-card p-8 shadow-sm'>
            <div className='mb-6 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                <UserRound size={20} className='text-primary' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-foreground'>Who are you?</h2>
                <p className='text-xs text-muted-foreground'>Create your player profile</p>
              </div>
            </div>

            <form onSubmit={handleHostContinue} className='space-y-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-foreground'>Your name</label>
                <input
                  type='text'
                  value={hostName}
                  onChange={(e) => { setHostName(e.target.value); setHostError('') }}
                  placeholder='e.g. Alex'
                  autoFocus
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${hostError ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-ring'}`}
                />
                {hostError && <p className='mt-1 text-xs text-destructive'>{hostError}</p>}
              </div>

              <button
                type='submit'
                disabled={hostSubmitting || !hostName.trim()}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {hostSubmitting ? 'Creating…' : <>Continue <ChevronRight size={15} /></>}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Friends */}
        {step === 2 && hostPlayer && (
          <div className='rounded-2xl border border-border bg-card p-8 shadow-sm'>
            <div className='mb-6 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                <Users size={20} className='text-primary' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-foreground'>Add your friends</h2>
                <p className='text-xs text-muted-foreground'>You can always add more later</p>
              </div>
            </div>

            {friends.map((p) => (
              <div key={p.id} className='mb-2 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
                  {p.avatar_path
                    ? <img src={p.avatar_path} alt={p.name} className='h-full w-full object-cover rounded-full' />
                    : <UserRound size={15} className='text-muted-foreground' />}
                </div>
                <span className='text-sm text-foreground'>{p.name}</span>
              </div>
            ))}

            <form onSubmit={handleAddFriend} className='mt-4 flex gap-2'>
              <input
                type='text'
                value={friendName}
                onChange={(e) => { setFriendName(e.target.value); setFriendError('') }}
                placeholder="Friend's name..."
                className='flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
              />
              <button
                type='submit'
                className='flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent'
              >
                <Plus size={14} /> Add
              </button>
            </form>
            {friendError && <p className='mt-1 text-xs text-destructive'>{friendError}</p>}

            <button
              onClick={() => setStep(3)}
              className='mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90'
            >
              Continue <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Step 3: Games */}
        {step === 3 && (
          <div className='rounded-2xl border border-border bg-card p-8 shadow-sm'>
            <div className='mb-6 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                <Gamepad2 size={20} className='text-primary' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-foreground'>Add your games</h2>
                <p className='text-xs text-muted-foreground'>You can always add more later</p>
              </div>
            </div>

            {games.map((g) => (
              <div key={g.id} className='mb-2 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2'>
                <Gamepad2 size={15} className='shrink-0 text-muted-foreground' />
                <span className='text-sm text-foreground'>{g.name}</span>
              </div>
            ))}

            <form onSubmit={handleAddGame} className='mt-4 flex gap-2'>
              <input
                type='text'
                value={gameName}
                onChange={(e) => { setGameName(e.target.value); setGameError('') }}
                placeholder='Game name…'
                className='flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
              />
              <button
                type='submit'
                className='flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent'
              >
                <Plus size={14} /> Add
              </button>
            </form>
            {gameError && <p className='mt-1 text-xs text-destructive'>{gameError}</p>}

            <button
              onClick={handleComplete}
              disabled={completing}
              className='mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60'
            >
              {completing ? 'Finishing up…' : <>Done — Let's go! <ChevronRight size={15} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
