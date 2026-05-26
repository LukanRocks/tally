import { Page } from '@/components/page'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { BrandSection } from './foundations/brand-section'
import { ColorsSection } from './foundations/colors-section'
import { TypographySection } from './foundations/typography-section'
import { ElevationSection } from './foundations/elevation-section'
import { IconographySection } from './foundations/iconography-section'
import { ButtonsSection } from './components/buttons-section'
import { ChipsBadgesSection } from './components/chips-badges-section'
import { InputsSection } from './inputs-section'
import { AvatarsSection } from './avatars-section'
import { CardsSection } from './cards-section'
import { NavigationSection } from './navigation-section'
import { FeedbackSection } from './feedback-section'
import { LeaderboardSection } from './leaderboard-section'
import { PodiumSection } from './podium-section'
import { GameCardSection } from './game-card-section'
import { SessionCardSection } from './session-card-section'
import { PlayerProfileSection } from './player-profile-section'
import { EmptyStateSection } from './empty-state-section'

export default () => (
  <Page className='space-y-8'>
    <header className='flx flex-col gap-2'>
      <span className='eyebrow text-ink-muted'>v1 · foundations · patterns · components</span>
      <div className='flex w-full items-center justify-between'>
        <h1 className='text-5xl font-bold'>Design system</h1>
        <ThemeToggle />
      </div>
    </header>
    {/* FOUNDATIONS */}
    <BrandSection />
    <ColorsSection />
    <TypographySection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    {/* <SpacingSection /> — import from ./spacing-section when ready */}
    <ElevationSection />
    <IconographySection />
    {/* COMPONENTS */}
    <ButtonsSection />
    <ChipsBadgesSection />
    <InputsSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    {/* <CheckboxSection /> — import from ./checkbox-section when ready */}
    <AvatarsSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <CardsSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <NavigationSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <FeedbackSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <LeaderboardSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <PodiumSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <GameCardSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <SessionCardSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <PlayerProfileSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
    <EmptyStateSection /> {/* !TODO NEEDS COMPONENTIZATION*/}
  </Page>
)
