import { Loading } from '@/components/4-templates/loading-screen'

export const LoadingScreenSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Loading screen</h2>
      <p className='mt-1 text-sm text-ink-secondary'>Full-screen loader shown while the app bootstraps. Random phrase each mount.</p>
    </div>

    <div className='overflow-hidden rounded-xl border border-border'>
      <Loading />
    </div>
  </section>
)
