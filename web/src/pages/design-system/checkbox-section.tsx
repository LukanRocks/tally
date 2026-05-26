// import React, { useState } from 'react'
// import { Checkbox } from '@/components/checkbox'

// function CheckboxRow({ label, ...props }: { label: string } & React.ComponentProps<typeof Checkbox>) {
//   const [checked, setChecked] = useState(!!props.defaultChecked)
//   return (
//     <label className='flex cursor-pointer items-center gap-2 text-sm'>
//       <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} {...props} />
//       {label}
//     </label>
//   )
// }

export function CheckboxSection() {
  return null

  // return (
  //   <section className='space-y-4'>
  //     <h2 className='text-lg font-semibold'>Checkbox</h2>
  //     <div className='bg-surface-elevated flex flex-wrap gap-6 rounded-xl border border-border px-6 py-5'>
  //       <CheckboxRow label='Unchecked' />
  //       <CheckboxRow label='Checked' defaultChecked />
  //       <CheckboxRow label='Disabled' disabled />
  //       <CheckboxRow label='Disabled checked' disabled defaultChecked />
  //     </div>
  //   </section>
  // )
}
