"use client";
import { Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { deleteDoc, doc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteWorkspaceCascade } from '@/lib/workspace-cascade-delete';
import { db } from '@/config/firebaseConfig';
import { toast } from 'sonner';
import { useFirebaseAuthBridge } from '@/app/providers/FirebaseAuthBridge';

function WorkSpaceListItem({ workSpaceList }) {
  const router = useRouter();
  const { status: bridgeStatus } = useFirebaseAuthBridge();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  const DeleteWorkspace = async (workspaceId) => {
    if (bridgeStatus !== 'authenticated') {
      toast.error('Workspace deletion is unavailable until authentication is ready.');
      return;
    }
    try {
      const documentsQuery = query(
        collection(db, "workspaceDocuments"),
        where("workspaceId", "==", Number(workspaceId))
      );
      const documentSnapshots = await getDocs(documentsQuery);
      await deleteWorkspaceCascade({
        documentIds: documentSnapshots.docs.map((document) => document.id),
        deleteDocumentPair: async (documentIds) => {
          const batch = writeBatch(db);
          for (const documentId of documentIds) {
            batch.delete(doc(db, "workspaceDocuments", documentId));
            batch.delete(doc(db, "documentOutput", documentId));
          }
          await batch.commit();
        },
        deleteWorkspace: () => deleteDoc(doc(db, "Workspace", String(workspaceId))),
      });
      toast.success('Workspace and related documents deleted successfully!');
      setIsDialogOpen(false);
      setSelectedWorkspace(null);
    } catch (error) {
      console.error("Error deleting workspace: ", error);
      toast.error("Failed to delete workspace");
    }
  };

  const OnClickItem = (workspaceid) => router.push('/workspace/' + workspaceid);
  const openDeleteDialog = (workspace) => {
    if (bridgeStatus !== 'authenticated') return;
    setSelectedWorkspace(workspace);
    setIsDialogOpen(true);
  };
  const closeDeleteDialog = () => {
    setIsDialogOpen(false);
    setSelectedWorkspace(null);
  };
  const confirmDelete = () => {
    if (bridgeStatus === 'authenticated' && selectedWorkspace) {
      DeleteWorkspace(selectedWorkspace.id);
    }
  };

  return (
    <div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5 md:mt-10'>
        {workSpaceList?.map((item, index) => (
          <div key={item.id ?? index} className='border shadow-xl rounded-xl hover:scale-105 transition-all cursor-pointer'>
            <Image
              src={item?.coverImage}
              width={400}
              height={200}
              alt='cover-image'
              className='h-[80px] rounded-t-xl md:h-[150px] object-cover'
              onClick={() => OnClickItem(item.id)}
            />
            <div className='p-2 md:p-4 rounded-b-xl flex justify-between'>
              <h2 className='flex gap-2'>{item?.emoji} {item.workSpaceName}</h2>
              <Trash2Icon
                className={`text-red-500 ${bridgeStatus === 'authenticated' ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                onClick={() => openDeleteDialog(item)}
              />
            </div>
          </div>
        ))}
      </div>
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg mb-4">
              Are you sure you want to delete the workspace &quot;<strong>{selectedWorkspace?.workSpaceName}</strong>&quot;?
            </h2>
            <div className="flex justify-end gap-4">
              <button disabled={bridgeStatus !== 'authenticated'} onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Delete
              </button>
              <button onClick={closeDeleteDialog} className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default WorkSpaceListItem;
