"use client";
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon, SmilePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { db } from '@/config/firebaseConfig';
import CoverPicker from '@/app/_components/CoverPicker';
import EmojiPickerComponent from '@/app/_components/EmojiPickerComponent';
import { doc, writeBatch } from 'firebase/firestore';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useFirebaseAuthBridge } from '@/app/providers/FirebaseAuthBridge';
import uuid4 from 'uuid4';

function CreateWorkSpace() {
  const [coverImage, setCoverImage] = useState('/cover.png');
  const [workSpaceName, setWorkSpaceName] = useState('');
  const [emoji, setEmoji] = useState();
  const { user } = useUser();
  const { status: bridgeStatus, error: bridgeError } = useFirebaseAuthBridge();
  const { orgId } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const OnCreateWorkspace = async () => {
    if (bridgeStatus !== 'authenticated' || !user) {
      toast.error(bridgeError || 'Wait until authentication is ready before creating a workspace.');
      return;
    }
    setLoading(true);
    const workspaceId = Date.now();
    try {
      const docId = uuid4();
      const batch = writeBatch(db);
      batch.set(doc(db, 'Workspace', workspaceId.toString()), {
        workSpaceName,
        emoji,
        coverImage,
        createdBy: user.primaryEmailAddress?.emailAddress,
        id: workspaceId,
        orgId: orgId || user.primaryEmailAddress?.emailAddress,
      });
      batch.set(doc(db, 'workspaceDocuments', docId.toString()), {
        workspaceId,
        createdBy: user.primaryEmailAddress?.emailAddress,
        coverImage: null,
        emoji: null,
        id: docId,
        documentName: 'Untitled Document',
        documentOutput: [],
      });
      batch.set(doc(db, 'documentOutput', docId.toString()), {
        docId,
        output: [],
      });
      await batch.commit();
      router.replace('/workspace/' + workspaceId + "/" + docId);
    } catch (error) {
      console.error('Workspace creation failed:', error);
      toast.error('Unable to create workspace. If it was partially created, refresh the workspace list before retrying.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 md:px-36 lg:px-64 xl:px-96 py-28">
      <div className="shadow-2xl rounded-xl">
        <CoverPicker setNewCover={(value) => setCoverImage(value)}>
          <div className="relative group cursor-pointer">
            <h2 className="hidden absolute p-4 w-full h-full items-center justify-center group-hover:flex">Change Cover</h2>
            <div className="group-hover:opacity-40">
              <Image src={coverImage} width={400} height={400} className="w-full h-[180px] object-cover rounded-t-xl" alt="cover image" priority />
            </div>
          </div>
        </CoverPicker>
        <div className="p-12">
          <h2 className="font-semibold text-xl">Create a new workspace</h2>
          <h2 className="text-sm mt-2">This is a shared workspace where you can collaborate with your team! You can always rename it later.</h2>
          <div className="mt-8 flex gap-2 items-center">
            <EmojiPickerComponent setEmojiIcon={(value) => setEmoji(value)}>
              <Button variant="outline">{emoji ? emoji : <SmilePlus />}</Button>
            </EmojiPickerComponent>
            <Input placeholder="Workspace Name" value={workSpaceName} onChange={(event) => setWorkSpaceName(event.target.value)} />
          </div>
          <div className="mt-7 flex justify-end gap-6">
            <Button disabled={!workSpaceName.trim() || loading || bridgeStatus !== 'authenticated'} onClick={OnCreateWorkspace}>
              Create {loading && <Loader2Icon className="animate-spin ml-2" />}
            </Button>
            <Button variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CreateWorkSpace;
