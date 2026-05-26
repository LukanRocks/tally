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
            <p className='eyebrow text-ink-muted'>Inter · UI & body</p>
            <p className='text-xs text-ink-muted'>400 / 500 / 600 / 700 / 800</p>
          </div>
          <span className='font-sans text-2xl text-ink-primary'>The quick brown fox plays Rumikubi</span>
        </div>
        <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
          <div>
            <p className='eyebrow text-ink-muted'>Kalam · display accent</p>
            <p className='text-xs text-ink-muted'>700 · −3° rotation looks best</p>
          </div>
          <span className='callout'>A mark made.</span>
        </div>
        <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
          <div>
            <p className='eyebrow text-ink-muted'>JetBrains Mono · metadata</p>
            <p className='text-xs text-ink-muted'>500 · uppercase · 1.5px tracking</p>
          </div>
          <span className='eyebrow text-sm text-ink-muted'>PLAY TONIGHT · 3 PLAYERS · ~45 MIN</span>
        </div>
      </div>

      <div>
        <p className='eyebrow mb-3 text-ink-muted'>Scale</p>
        <div className='overflow-auto rounded-xl border border-border bg-card'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border'>
                <th className='eyebrow px-4 py-3 text-left text-ink-muted'>token</th>
                <th className='eyebrow px-4 py-3 text-left text-ink-muted'>size / line</th>
                <th className='eyebrow px-4 py-3 text-left text-ink-muted'>weight</th>
                <th className='eyebrow px-4 py-3 text-left text-ink-muted'>preview</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-dashed divide-border'>
              {[
                {
                  token: 'display',
                  size: '56 / 60',
                  weight: '800',
                  preview: 'Tally',
                  style: { fontFamily: 'Inter', fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 },
                },
                {
                  token: 'h1',
                  size: '40 / 44',
                  weight: '800',
                  preview: 'Leaderboard',
                  style: { fontFamily: 'Inter', fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 },
                },
                {
                  token: 'h2',
                  size: '28 / 32',
                  weight: '700',
                  preview: 'Tonight focus',
                  style: { fontFamily: 'Inter', fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 },
                },
                {
                  token: 'h3',
                  size: '20 / 26',
                  weight: '700',
                  preview: 'Rumikubi',
                  style: { fontFamily: 'Inter', fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px', lineHeight: 1 },
                },
                { token: 'body', size: '16 / 25', weight: '400', preview: 'Alyne won three in a row.', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400 } },
                {
                  token: 'small',
                  size: '14 / 22',
                  weight: '400',
                  preview: '2 sessions · last on May 6',
                  style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, color: 'var(--ink-muted)' },
                },
                {
                  token: 'label',
                  size: '11 / 16',
                  weight: '600 mono',
                  preview: 'PLAY TONIGHT',
                  style: { fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: 'var(--ink-muted)' },
                },
                {
                  token: 'accent',
                  size: '32 / 36',
                  weight: '700 kalam',
                  preview: 'a mark made.',
                  style: { fontFamily: 'Kalam', fontSize: 28, fontWeight: 700, transform: 'rotate(-2deg)', display: 'inline-block', color: 'var(--yellow-tertiary)' },
                },
              ].map((row) => (
                <tr key={row.token}>
                  <td className='px-4 py-3'>
                    <code className='font-mono text-xs'>{row.token}</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-ink-muted'>{row.size}</td>
                  <td className='px-4 py-3 text-xs text-ink-muted'>{row.weight}</td>
                  <td className='px-4 py-3'>
                    <span style={row.style}>{row.preview}</span>
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
