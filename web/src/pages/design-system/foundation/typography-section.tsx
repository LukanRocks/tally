const previews: Record<string, string> = {
  display: 'Tally',
  h1: 'Leaderboard',
  h2: 'Tonight focus',
  h3: 'Rumikubi',
  body: 'Alyne won three in a row.',
  small: '2 sessions · last on May 6',
  caption: 'PLAY TONIGHT',
  accent: 'a mark made.',
}

export function TypographySection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Typography</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Three families with strict jobs. <strong>Inter</strong> is the workhorse. <strong>JetBrains Mono</strong> is the labeler. <strong>Kalam</strong> is the wink — used once
          or twice per screen, never for body.
        </p>
      </div>

      <div className='divide-y divide-dashed divide-border rounded-xl border border-border bg-card'>
        <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
          <div>
            <p className='caption text-ink-muted'>Inter · UI & body</p>
            <p className='text-xs text-ink-muted'>400 / 500 / 600 / 700 / 800</p>
          </div>
          <span className='font-sans text-2xl text-ink-primary'>The quick brown fox plays Rumikubi</span>
        </div>
        <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
          <div>
            <p className='caption text-ink-muted'>Kalam · display accent</p>
            <p className='text-xs text-ink-muted'>700 · −2° rotation</p>
          </div>
          <span className='callout'>A mark made.</span>
        </div>
        <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
          <div>
            <p className='caption text-ink-muted'>JetBrains Mono · metadata</p>
            <p className='text-xs text-ink-muted'>600 · uppercase · 0.12em tracking</p>
          </div>
          <span className='caption text-ink-muted'>PLAY TONIGHT · 3 PLAYERS · ~45 MIN</span>
        </div>
      </div>

      <div>
        <p className='caption mb-3 text-ink-muted'>Scale</p>
        <div className='overflow-auto rounded-xl border border-border bg-card'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border'>
                <th className='caption px-4 py-3 text-left text-ink-muted'>token</th>
                <th className='caption px-4 py-3 text-left text-ink-muted'>class</th>
                <th className='caption px-4 py-3 text-left text-ink-muted'>size / line</th>
                <th className='caption px-4 py-3 text-left text-ink-muted'>weight</th>
                <th className='caption px-4 py-3 text-left text-ink-muted'>preview</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-dashed divide-border'>
              {[
                { token: 'display', cls: '.display', size: '2.25rem',  line: '1.125', weight: '800' },
                { token: 'h1',      cls: '.h1',      size: '1.875rem', line: '1.25',  weight: '800' },
                { token: 'h2',      cls: '.h2',      size: '1.25rem',  line: '1.375', weight: '700' },
                { token: 'h3',      cls: '.h3',      size: '1.125rem', line: '1.375', weight: '600' },
                { token: 'body',    cls: '.body',    size: '0.875rem', line: '1.375', weight: '400' },
                { token: 'small',   cls: '.small',   size: '0.75rem',  line: '1.5',   weight: '400' },
                { token: 'caption', cls: '.caption', size: '0.75rem',  line: '1.5',   weight: '600 mono' },
                { token: 'accent',  cls: '.callout', size: '1.5rem',   line: '1.25',  weight: '700 kalam' },
              ].map((row) => (
                <tr key={row.token}>
                  <td className='px-4 py-3'>
                    <code className='font-mono text-xs'>{row.token}</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='font-mono text-xs text-ink-muted'>{row.cls}</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-ink-muted'>{row.size} / {row.line}</td>
                  <td className='px-4 py-3 text-xs text-ink-muted'>{row.weight}</td>
                  <td className='px-4 py-3'>
                    <span className={row.token === 'accent' ? 'callout' : row.token === 'caption' ? 'caption text-ink-muted' : row.token}>
                      {previews[row.token]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
