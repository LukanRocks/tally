import { ComponentProps } from 'react'
import { Search } from 'lucide-react'

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/1-atoms/input'

export type SearchInputProps = Omit<ComponentProps<'input'>, 'type'>

export const SearchInput = ({ ...props }: SearchInputProps) => (
  <InputGroup data-slot='search-input' className='w-full sm:w-80'>
    <InputGroupAddon align='inline-start'>
      <InputGroupText>
        <Search size={15} />
      </InputGroupText>
    </InputGroupAddon>
    <InputGroupInput type='text' {...props} />
  </InputGroup>
)
