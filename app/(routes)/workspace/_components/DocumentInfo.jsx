"use client";
import CoverPicker from '@/app/_components/CoverPicker';
import EmojiPickerComponent from '@/app/_components/EmojiPickerComponent';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { SmilePlus } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useFirebaseAuthBridge } from '@/app/providers/FirebaseAuthBridge';

function DocumentInfo({ params }) {
  const [coverImage, setCoverImage] = useState('/cover.png');
  const [emoji, setEmoji] = useState();
  const [documentInfo, setDocumentInfo] = useState();
  const { status: bridgeStatus, error: bridgeError } = useFirebaseAuthBridge();

  useEffect(() => {
    let active = true;
    if (bridgeStatus !== 'authenticated') {
      setDocumentInfo(undefined);
      setEmoji(undefined);
      setCoverImage('/cover.png');
      return () => { active = false; };
    }
    const getDocumentInfo = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'workspaceDocuments', params?.documentid));
        if (!active) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          setDocumentInfo(data);
          setEmoji(data.emoji);
          if (data.coverImage) setCoverImage(data.coverImage);
        }
      } catch (error) {
        if (!active) return;
        console.error('Failed to fetch document metadata:', error);
        toast.error('Unable to load document information.');
      }
    };
    if (params?.documentid) getDocumentInfo();
    return () => { active = false; };
  }, [params?.documentid, bridgeStatus]);

  const updateDocumentInfo = async (key, value) => {
    if (bridgeStatus !== 'authenticated') {
      toast.error(bridgeError || 'Document updates are unavailable until authentication is ready.');
      return false;
    }
    try {
      await updateDoc(doc(db, 'workspaceDocuments', params?.documentid), { [key]: value });
      toast.success('Document Updated!');
      return true;
    } catch (error) {
      console.error('Failed to update document metadata:', error);
      toast.error('Unable to update document information.');
      return false;
    }
  };

  return (
    <div className='p-2'>
      <CoverPicker setNewCover={(cover) => {
        if (bridgeStatus !== 'authenticated') return;
        setCoverImage(cover);
        updateDocumentInfo('coverImage', cover);
      }}>
        <div className='relative group cursor-pointer'>
          <h2 className='hidden absolute p-4 w-full h-full items-center group-hover:flex justify-center'>Change Cover</h2>
          <div className='group-hover:opacity-40'>
            <Image src={coverImage} width={400} height={400} alt='cover image' className='w-full h-[200px] object-cover rounded-t-lg'/>
          </div>
        </div>
      </CoverPicker>
      <div className='absolute ml-5 md:ml-10 px-5 md:px-20 mt-[-40px] cursor-pointer'>
        <EmojiPickerComponent setEmojiIcon={(selectedEmoji) => {
          if (bridgeStatus !== 'authenticated') return;
          setEmoji(selectedEmoji);
          updateDocumentInfo('emoji', selectedEmoji);
        }}>
          <div className='bg-[#ffffffb0] p-3 md:p-4 rounded-md text-3xl md:text-5xl'>
            {emoji ? <span>{emoji}</span> : <SmilePlus className='md:h-10 h-8 md:w-10 w-8 text-gray-500'/>}
          </div>
        </EmojiPickerComponent>
      </div>
      <div className='md:mt-5 mt-3 px-5 md:px-20 ml-5 md:ml-10 md:p-5 md:w-full max-w-[600px]'>
        <input type="text" placeholder='Untitled Document' defaultValue={documentInfo?.documentName}
          disabled={bridgeStatus !== 'authenticated'}
          className='font-bold md:text-4xl text-2xl outline-none w-full ml-[-20px] md:ml-[-40px]'
          onBlur={(event) => updateDocumentInfo('documentName', event.target.value)}/>
      </div>
    </div>
  );
}
export default DocumentInfo;
