import { Page, PageHeader } from '@/components/layout/page'

import { WorkspaceManagement } from './workspace-management'
import { AppearanceManagement } from './appearance-management'
import { BggManagement } from './bgg-management'
import { DataManagement } from './data-management'

export default () => (
  <Page container>
    <PageHeader title='Settings' caption='the little knobs' />

    <WorkspaceManagement />
    <AppearanceManagement />
    <BggManagement />
    <DataManagement />
  </Page>
)
