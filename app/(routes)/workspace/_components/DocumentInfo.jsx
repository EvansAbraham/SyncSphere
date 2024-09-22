"use client"

import CoverPicker from '@/app/_components/CoverPicker'
import EmojiPickerComponent from '@/app/_components/EmojiPickerComponent';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { SmilePlus } from 'lucide-react';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function DocumentInfo({params}) {
    const [coverImage,setCoverImage]=useState('/cover.png');
    const [emoji,setEmoji]=useState();
    const [documentInfo,setDocumentInfo]=useState();
    useEffect(()=>{
        params&&GetDocumentInfo();
    },[params])

    
    const GetDocumentInfo=async()=>{
        const docRef=doc(db,'workspaceDocuments',params?.documentid);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists())
        {
            console.log(docSnap.data())
            setDocumentInfo(docSnap.data())
            setEmoji(docSnap.data()?.emoji);
            docSnap.data()?.coverImage&&setCoverImage(docSnap.data()?.coverImage)
        }
    }
    
    const updateDocumentInfo=async(key,value)=>{
        const docRef=doc(db,'workspaceDocuments',params?.documentid);
        await updateDoc(docRef,{
            [key]:value
        })
        toast('Document Updated!')
    }


  return (
    <div>
        {/* Cover  */}
        <CoverPicker setNewCover={(cover)=>{
            setCoverImage(cover);
            updateDocumentInfo('coverImage',cover)
            }}>
        <div className='relative group cursor-pointer'>
                    <h2 className='hidden absolute p-4 w-full h-full
                    items-center group-hover:flex
                    justify-center'>Change Cover</h2>
                    <div className='group-hover:opacity-40'>
                        <Image src={coverImage} width={400} height={400} alt='cover image'
                        className='w-full h-[200px] object-cover rounded-t-lg'
                        />
                    </div>
                </div>
        </CoverPicker>
        {/* Emoji Picker  */}
        <div className='absolute ml-5 md:ml-10 px-7 md:px-20 mt-[-40px] cursor-pointer md:flex md:justify-start'>
            <EmojiPickerComponent 
            setEmojiIcon={(emoji)=>{
                setEmoji(emoji);
                updateDocumentInfo('emoji',emoji)
                }}>
            <div className='bg-[#ffffffb0] p-3 md:p-4 rounded-md text-3xl md:text-5xl'>
                {emoji?<span className=''>{emoji}</span>: <SmilePlus className='md:h-10 h-8 md:w-10 w-8 text-gray-500'/>}
            </div>
            </EmojiPickerComponent>
        </div>
        {/* File Name  */}
        <div className='md:mt-5 mt-3 px-5 md:px-20 ml-5 md:ml-10 md:p-10 p-5 md:w-full max-w-[600px]'>
            <input type="text" 
            placeholder='Untitled Document'
            defaultValue={documentInfo?.documentName}
            className='font-bold md:text-4xl text-2xl outline-none w-full ml-[-20px] md:ml-[-40px]'
            onBlur={(event)=>updateDocumentInfo('documentName',event.target.value)}
            />
        </div>
    </div>
  )
}

export default DocumentInfo