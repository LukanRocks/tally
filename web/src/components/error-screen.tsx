type Props = { onRetry: () => void }

export const ErrorScreen = ({ onRetry }: Props) => (
  <div className='flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted-foreground'>
    <span>Something went wrong. Could not load settings.</span>
    <button onClick={onRetry} className='text-foreground underline underline-offset-4'>
      Retry
    </button>
  </div>
)
