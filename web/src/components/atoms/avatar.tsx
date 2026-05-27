import { ReactNode } from 'react'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { Player } from '@/lib/http-transport/api'
import { useDeterministicPick } from '@/hooks/useDeterministicPick'

const BACKGROUNDS = ['bg-player-a', 'bg-player-b', 'bg-player-c', 'bg-player-d', 'bg-player-e', 'bg-player-f', 'bg-player-g', 'bg-player-h', 'bg-player-i', 'bg-player-j']

const AVATAR_VARIANTS_CONFIG = cva('relative flex shrink-0 overflow-hidden rounded-full border-ink-primary select-none', {
  variants: {
    size: {
      xs: 'size-5 border text-[10px]',
      sm: 'size-7 border text-xs',
      md: 'size-9 border-[1.5px] text-sm',
      lg: 'size-14 border-2 text-[22px]',
      xl: 'size-22 border-[2.5px] text-4xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type AVATAR_VARIANTS_PROPS = VariantProps<typeof AVATAR_VARIANTS_CONFIG>

export type AVATAR_SIZE = NonNullable<AVATAR_VARIANTS_PROPS['size']>
export const AVATAR_SIZES: AVATAR_SIZE[] = ['xs', 'sm', 'md', 'lg', 'xl']

export type AvatarProps = AVATAR_VARIANTS_PROPS & Pick<Player, 'id' | 'name' | 'avatar_path'>

export const Avatar = ({ size, id, avatar_path, name }: AvatarProps) => {
  const background = useDeterministicPick(BACKGROUNDS, id)
  const classes = cn(AVATAR_VARIANTS_CONFIG({ size }), background)

  return (
    <AvatarPrimitive.Root data-slot='avatar' data-size={size} className={classes}>
      {avatar_path && <AvatarPrimitive.Image data-slot='avatar-image' className='aspect-square size-full' src={avatar_path} />}
      <AvatarPrimitive.Fallback data-slot='avatar-fallback' className='flex size-full items-center justify-center rounded-full font-sans font-bold text-ink-primary'>
        {name[0].toUpperCase()}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export type AvatarGroupProps = {
  players: Pick<Player, 'id' | 'name' | 'avatar_path'>[]
  size?: AVATAR_SIZE
  children?: ReactNode
}

export const AvatarGroup = ({ players, size, children }: AvatarGroupProps) => {
  const classes = cn(AVATAR_VARIANTS_CONFIG({ size }), 'flex items-center justify-center bg-paper-secondary font-mono font-semibold text-ink-primary')

  return (
    <div data-slot='avatar-group' className='flex items-center *:[box-shadow:0_0_0_2px_var(--card)] [&>*:not(:first-child)]:-ml-2.5'>
      {players.map((player) => (
        <Avatar key={player.id} size={size} {...player} />
      ))}

      {children && (
        <div data-slot='avatar-group-extra' className={classes}>
          {children}
        </div>
      )}
    </div>
  )
}
