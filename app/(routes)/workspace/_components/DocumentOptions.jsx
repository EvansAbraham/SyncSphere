import { MoreVertical, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  
import React from 'react'

function DocumentOptions({doc,deleteDocument}) {
  return (
    <div>
        <DropdownMenu>
        <DropdownMenuTrigger>
            <MoreVertical className='h-4 w-4'/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem 
            onClick={()=>deleteDocument(doc?.id)}
            className="flex gap-2 text-red-500"> 
            <Trash2 className='h-4 w-4'/>Delete</DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>

    </div>
  )
}

export default DocumentOptions
