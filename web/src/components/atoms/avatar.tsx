import { ReactNode } from 'react'
import type { Player } from '@/lib/http-transport/api'
import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDeterministicPick } from '@/hooks/useDeterministicPick'

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full border-ink-primary select-none', {
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

type AvatarProps = VariantProps<typeof avatarVariants> & Pick<Player, 'id' | 'name' | 'avatar_path'>

export const Avatar = ({ size, id, avatar_path, name }: AvatarProps) => {
  const backgrounds = ['bg-player-a', 'bg-player-b', 'bg-player-c', 'bg-player-d', 'bg-player-e', 'bg-player-f', 'bg-player-g', 'bg-player-h', 'bg-player-i', 'bg-player-j']
  const background = useDeterministicPick(backgrounds, id)

  return (
    <AvatarPrimitive.Root data-slot='avatar' data-size={size} className={cn(avatarVariants({ size }), background)}>
      {avatar_path && <AvatarPrimitive.Image data-slot='avatar-image' className='aspect-square size-full' src={avatar_path} />}
      <AvatarPrimitive.Fallback data-slot='avatar-fallback' className='flex size-full items-center justify-center rounded-full font-sans font-bold text-ink-primary'>
        {name[0].toUpperCase()}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

type AvatarGroupProps = {
  players: Pick<Player, 'id' | 'name' | 'avatar_path'>[]
  size?: VariantProps<typeof avatarVariants>['size']
  children?: ReactNode
}

export const AvatarGroup = ({ players, size, children }: AvatarGroupProps) => {
  return (
    <div data-slot='avatar-group' className='flex items-center *:[box-shadow:0_0_0_2px_var(--card)] [&>*:not(:first-child)]:-ml-2.5'>
      {players.map((player) => (
        <Avatar key={player.id} size={size} {...player} />
      ))}
      {children && (
        <div
          data-slot='avatar-group-count'
          className={cn(avatarVariants({ size }), 'flex items-center justify-center bg-paper-secondary font-mono font-semibold text-ink-primary')}
        >
          {children}
        </div>
      )}
    </div>
  )
}
