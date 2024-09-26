"use client";
import { Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { deleteDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { toast } from 'sonner';

function WorkSpaceListItem({ workSpaceList }) {
  const router = useRouter();

  // State to manage the dialog visibility and the workspace to be deleted
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Function to delete all documents related to the workspace
  const DeleteWorkspace = async (workspaceId) => {
    try {
      // Convert workspaceId to a string if it is not already
      const workspaceIdString = workspaceId.toString();

      // Query to find all documents related to the workspace
      const documentsQuery = query(
        collection(db, "workspaceDocuments"),
        where("workspaceId", "==", Number(workspaceId))
      );

      const documentSnapshots = await getDocs(documentsQuery);

      // Delete each document related to the workspace
      const deletePromises = documentSnapshots.docs.map(async (document) => {
        await deleteDoc(doc(db, "workspaceDocuments", document.id));
        await deleteDoc(doc(db, "documentOutput", document.id));
      });

      // Wait for all document deletions to complete
      await Promise.all(deletePromises);

      // Delete the workspace itself
      await deleteDoc(doc(db, "Workspace", workspaceIdString));

      toast('Workspace and related documents deleted successfully!');
      // Close the dialog after successful deletion
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting workspace: ", error);
      toast.error("Failed to delete workspace");
    }
  };

  const OnClickItem = (workspaceid) => {
    console.log("OnClickItem triggered with ID:", workspaceid);
    router.push('/workspace/' + workspaceid);
  };

  const openDeleteDialog = (workspace) => {
    setSelectedWorkspace(workspace);
    setIsDialogOpen(true);  // Open dialog
  };

  const closeDeleteDialog = () => {
    setIsDialogOpen(false); // Close dialog
    setSelectedWorkspace(null); // Reset selected workspace
  };

  const confirmDelete = () => {
    if (selectedWorkspace) {
      DeleteWorkspace(selectedWorkspace.id); // Delete the selected workspace
    }
  };

  return (
    <div>
      {/* Grid displaying workspaces */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5 md:mt-10'>
        {workSpaceList && workSpaceList.map((item, index) => (
          <div key={index} 
            className='border shadow-xl rounded-xl hover:scale-105 transition-all cursor-pointer'>
            <Image 
              src={item?.coverImage} 
              width={400} 
              height={200} 
              alt='cover-image' 
              className='h-[80px] rounded-t-xl md:h-[150px] object-cover'
              onClick={() => OnClickItem(item.id)} // Clicking the image redirects to workspace
            />
            <div className='p-2 md:p-4 rounded-b-xl flex justify-between'>
              <h2 className='flex gap-2'>{item?.emoji} {item.workSpaceName}</h2>
              <Trash2Icon 
                className='text-red-500 cursor-pointer' 
                onClick={() => openDeleteDialog(item)} // Open delete confirmation dialog
              />
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg mb-4">
              Are you sure you want to delete the workspace "<strong>{selectedWorkspace?.workSpaceName}</strong>"?
            </h2>
            <div className="flex justify-end gap-4">
              <button 
                onClick={confirmDelete} 
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Delete
              </button>
              <button 
                onClick={closeDeleteDialog} 
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400">
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
