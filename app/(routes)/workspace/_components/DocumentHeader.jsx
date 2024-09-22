import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'
import React from 'react'

function DocumentHeader({ setIsVisible }) {
  return (
    <div className='flex justify-between items-center p-3 px-7 shadow-md'>
      <div className='md:hidden' onClick={() => setIsVisible(prev => !prev)}>
        <Menu size={24}/>
      </div>
      <OrganizationSwitcher/>
      <div className='flex gap-2'>
        <UserButton/>
      </div>
    </div>
  )
}

export default DocumentHeader
