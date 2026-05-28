import { WorkspaceManagement } from './workspace-management'
import { AppearanceManagement } from './appearance-management'
import { BggManagement } from './bgg-management'
import { DataManagement } from './data-management'

export default () => (
  <div className='max-w-lg p-4 md:p-8'>
    <h1 className='mb-8 text-2xl font-bold text-foreground'>Settings</h1>
    <WorkspaceManagement />
    <AppearanceManagement />
    <BggManagement />
    <DataManagement />
  </div>
)
