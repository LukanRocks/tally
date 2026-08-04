import {
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Crown,
  Dice6,
  Dices,
  Gamepad2,
  GripVertical,
  House,
  Info,
  Library,
  Loader2,
  Minus,
  Moon,
  OctagonX,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Store,
  Sun,
  SunMoon,
  Timer,
  Trash2,
  TriangleAlert,
  Trophy,
  UserPlus,
  UserRound,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'

export const IconographySection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Iconography</h2>
      <p className='mt-1 text-sm text-ink-secondary'>
        Lucide, 1.75 stroke, 20×20 by default. Brand glyphs (tally bars, dice, podium) are custom SVGs and live in <code className='font-mono text-xs'>/public</code>.
      </p>
    </div>

    <div className='grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2'>
      {(
        [
          { label: 'House', Icon: House },
          { label: 'Library', Icon: Library },
          { label: 'Trophy', Icon: Trophy },
          { label: 'Users', Icon: Users },
          { label: 'Settings', Icon: Settings },
          { label: 'Wrench', Icon: Wrench },
          { label: 'UserRound', Icon: UserRound },
          { label: 'UserPlus', Icon: UserPlus },
          { label: 'Crown', Icon: Crown },
          { label: 'Dices', Icon: Dices },
          { label: 'Dice6', Icon: Dice6 },
          { label: 'Gamepad2', Icon: Gamepad2 },
          { label: 'Timer', Icon: Timer },
          { label: 'Plus', Icon: Plus },
          { label: 'Minus', Icon: Minus },
          { label: 'X', Icon: X },
          { label: 'Check', Icon: Check },
          { label: 'ChevronRight', Icon: ChevronRight },
          { label: 'ChevronLeft', Icon: ChevronLeft },
          { label: 'ChevronDown', Icon: ChevronDown },
          { label: 'RefreshCw', Icon: RefreshCw },
          { label: 'GripVertical', Icon: GripVertical },
          { label: 'Pencil', Icon: Pencil },
          { label: 'Trash2', Icon: Trash2 },
          { label: 'Camera', Icon: Camera },
          { label: 'Paperclip', Icon: Paperclip },
          { label: 'Store', Icon: Store },
          { label: 'Sun', Icon: Sun },
          { label: 'Moon', Icon: Moon },
          { label: 'SunMoon', Icon: SunMoon },
          { label: 'CircleCheck', Icon: CircleCheck },
          { label: 'Info', Icon: Info },
          { label: 'OctagonX', Icon: OctagonX },
          { label: 'TriangleAlert', Icon: TriangleAlert },
          { label: 'Loader2', Icon: Loader2 },
        ] as { label: string; Icon: LucideIcon }[]
      ).map(({ label, Icon }) => (
        <div key={label} className='flex flex-col items-center gap-2 rounded-lg border border-paper-muted p-3 text-ink-primary'>
          <Icon size={22} strokeWidth={1.75} />
          <span className='font-mono text-[10px] text-ink-muted'>{label}</span>
        </div>
      ))}
    </div>
  </section>
)
