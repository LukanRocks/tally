import { Page } from '@/components/layout/page'
import { ThemeToggle } from '@/components/theme/theme-toggle'

import { BrandSection } from './foundation/brand-section'
import { ColorsSection } from './foundation/colors-section'
import { TypographySection } from './foundation/typography-section'
import { ElevationSection } from './foundation/elevation-section'
import { IconographySection } from './foundation/iconography-section'

import { CheckboxSection } from './component/checkbox-section'
import { SwitchSection } from './component/switch-section'
// import { InputsSection } from './inputs-section'

import { ButtonsSection } from './component/buttons-section'
import { ChipsBadgesSection } from './component/chips-badges-section'
import { AvatarsSection } from './component/avatars-section'
import { GameCardSection } from './component/game-card-section'
// import { CardsSection } from './cards-section'
// import { NavigationSection } from './navigation-section'
// import { SonnerSection } from './feedback/sonner-section'
// import { LeaderboardSection } from './leaderboard-section'
// import { PodiumSection } from './podium-section'
// import { SessionCardSection } from './session-card-section'
// import { PlayerProfileSection } from './player-profile-section'

import { SonnerSection } from './feedback/sonner-section'
import { EmptyStateSection } from './feedback/empty-state-section'
import { LoadingScreenSection } from './feedback/loading-screen-section'
import { ErrorScreenSection } from './feedback/error-screen-section'

export default () => (
  <Page className='space-y-8'>
    <header className='flx flex-col gap-2'>
      <span className='caption text-ink-muted'>v1 · foundations · patterns · components</span>
      <h1 className='text-5xl font-bold'>Design system</h1>
    </header>
    <div className='fixed right-4 bottom-4 z-50'>
      <ThemeToggle />
    </div>
    <span className='caption text-ink-muted'>01 — Foundations</span>
    <BrandSection />
    <ColorsSection />
    <TypographySection />
    <ElevationSection />
    <IconographySection />
    <span className='caption text-ink-muted'>02 — Inputs</span>
    <CheckboxSection />
    <SwitchSection />
    {/* <InputsSection /> !TODO NEEDS COMPONENTIZATION */}
    <span className='caption text-ink-muted'>03 — Atomic Components</span>
    <ButtonsSection />
    <ChipsBadgesSection />
    <AvatarsSection />
    <span className='caption text-ink-muted'>04 — Components</span>
    <GameCardSection />
    {/* <CardsSection /> !TODO NEEDS COMPONENTIZATION */}
    {/* <LeaderboardSection /> !TODO NEEDS COMPONENTIZATION */}
    {/* <PodiumSection /> !TODO NEEDS COMPONENTIZATION */}
    {/* <SessionCardSection /> !TODO NEEDS COMPONENTIZATION */}
    {/* <PlayerProfileSection /> !TODO NEEDS COMPONENTIZATION */}
    <span className='caption text-ink-muted'>05 — Feedback</span>
    <SonnerSection /> {/*  !TODO NEEDS COMPONENTIZATION */}
    <EmptyStateSection />
    <LoadingScreenSection />
    <ErrorScreenSection />
  </Page>
)
