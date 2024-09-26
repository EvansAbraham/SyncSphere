"use client"
import React, { useState, useEffect } from 'react'
import SideNav from '../_components/SideNav'
import DocumentHeader from '../_components/DocumentHeader';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

function WorkSpace({params}) {
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const fetchWorkspaceName = async () => {
      const docRef = doc(db, 'Workspace', params.workspaceid);  // Fetching based on ID
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setWorkspaceName(docSnap.data().workSpaceName);  // Assuming workSpaceName is the field name
      } else {
        console.log("No such document!");
      }
    };

    fetchWorkspaceName();
  }, [params.workspaceid]);

  return (
    <div>
      <SideNav params={params} isVisible={isSideNavVisible} setIsVisible={setIsSideNavVisible}/>
      <div className={`md:flex-1 md:ml-72 md:transition-all md:duration-300 ${isSideNavVisible ? 'ml-0' : ''}`}>
        <DocumentHeader setIsVisible={setIsSideNavVisible} />
        <div className="flex items-center justify-center h-full mt-[50%] md:mt-[25%]">
          <h2 className="font-semibold text-center">Welcome to {workspaceName}</h2>
        </div>
      </div>
    </div>
  )
}

export default WorkSpace
