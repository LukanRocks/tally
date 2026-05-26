export const ColorsSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Color</h2>
      <p className='mt-1 text-sm text-ink-secondary'>
        A two-tone system: warm paper and ink, with yellow as the single accent. Player-identity colors live <em>only</em> on avatars and rivalry callouts — not on chrome.
      </p>
    </div>

    <div className='space-y-3'>
      <p className='caption text-ink-muted'>Core palette</p>
      <div className='grid grid-cols-3 gap-3 sm:grid-cols-6'>
        {[
          { v: '--paper-primary', name: 'paper-primary', desc: 'app background' },
          { v: '--paper-secondary', name: 'paper-secondary', desc: 'panels, lifted surfaces' },
          { v: '--paper-muted', name: 'paper-muted', desc: 'borders & dividers' },
          { v: '--ink-primary', name: 'ink-primary', desc: 'headings · key UI' },
          { v: '--ink-secondary', name: 'ink-secondary', desc: 'body text' },
          { v: '--ink-muted', name: 'ink-muted', desc: 'secondary text' },
        ].map((s) => (
          <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
            <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
            <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
            <span className='text-[11px] text-ink-muted'>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div className='space-y-3'>
      <p className='caption text-ink-muted'>Accent — the one and only yellow</p>
      <div className='grid grid-cols-3 gap-3'>
        {[
          { v: '--yellow-primary', name: 'yellow-primary', desc: 'primary CTA · slash' },
          { v: '--yellow-secondary', name: 'yellow-secondary', desc: 'highlight backgrounds' },
          { v: '--yellow-tertiary', name: 'yellow-tertiary', desc: 'borders and hovers' },
        ].map((s) => (
          <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
            <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
            <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
            <span className='text-[11px] text-ink-muted'>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div className='space-y-3'>
      <p className='caption text-ink-muted'>Players</p>
      <p className='text-xs text-ink-muted'>Use sparingly — these belong to people and outcomes, not buttons.</p>
      <div className='flex flex-wrap gap-3'>
        {(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const).map((p) => (
          <div key={p} className='flex flex-col items-center gap-1'>
            <div className='h-10 w-10 rounded-full border border-black/10' style={{ background: `var(--player-${p})` }} />
            <span className='font-mono text-[10px] text-ink-muted'>{p}</span>
          </div>
        ))}
      </div>
    </div>

    <div className='space-y-3'>
      <p className='caption text-ink-muted'>Outcomes</p>
      <div className='grid grid-cols-3 gap-3'>
        {[
          { v: '--win', name: 'win', desc: 'victory' },
          { v: '--loss', name: 'loss', desc: 'loss' },
          { v: '--tie', name: 'tie', desc: 'draw' },
        ].map((s) => (
          <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
            <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
            <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
            <span className='text-[11px] text-ink-muted'>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div className='space-y-3'>
      <p className='caption text-ink-muted'>Medals</p>
      <div className='grid grid-cols-3 gap-3'>
        {[
          { v: '--medal-gold', name: 'medal-gold', desc: '1st place' },
          { v: '--medal-silver', name: 'medal-silver', desc: '2nd place' },
          { v: '--medal-bronze', name: 'medal-bronze', desc: '3rd place' },
        ].map((s) => (
          <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
            <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
            <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
            <span className='text-[11px] text-ink-muted'>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div className='space-y-3'>
      <p className='caption text-ink-muted'>Ownership status</p>
      <div className='grid grid-cols-3 gap-3'>
        {[
          { v: '--owned', name: 'owned', desc: 'game you own' },
          { v: '--borrowed', name: 'borrowed', desc: "friend's copy" },
          { v: '--rented', name: 'rented', desc: 'rental / due back' },
        ].map((s) => (
          <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
            <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
            <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
            <span className='text-[11px] text-ink-muted'>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div className='space-y-3'>
      <p className='caption text-ink-muted'>Feedback</p>
      <div className='grid grid-cols-4 gap-3'>
        {[
          { v: '--success', name: 'success', desc: 'confirmations' },
          { v: '--warning', name: 'warning', desc: 'caution states' },
          { v: '--info', name: 'info', desc: 'neutral notices' },
          { v: '--destructive', name: 'destructive', desc: 'destructive actions' },
        ].map((s) => (
          <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
            <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
            <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
            <span className='text-[11px] text-ink-muted'>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
)
