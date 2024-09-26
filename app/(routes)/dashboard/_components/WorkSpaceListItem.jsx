"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

function WorkSpaceListItem({workSpaceList}) {

  
  const router = useRouter();
  const OnClickItem=(workspaceid)=>{
    console.log("OnClickItem triggered with ID:", workspaceid); 
    router.push('/workspace/'+workspaceid)
  }
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5 md:mt-10'>
      {workSpaceList&&workSpaceList.map((item,index)=>(
        <div key={index} 
        className='border shadow-xl rounded-xl hover:scale-105 transition-all cursor-pointer'
        onClick={()=>OnClickItem(item.id)}>
            <Image src={item?.coverImage} 
            width={400} height={200} alt='cover-image'
            className='h-[80px] rounded-t-xl md:h-[150px] object-cover'/>
            <div className='p-2 md:p-4 rounded-b-xl'>
                <h2 className='flex gap-2'>{item?.emoji} {item.workSpaceName}</h2>
            </div>
            
        </div>
      ))}
    </div>
  )
}

export default WorkSpaceListItem
