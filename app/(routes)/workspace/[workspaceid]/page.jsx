"use client";
import React, { useState, useEffect } from 'react';
import SideNav from '../_components/SideNav';
import DocumentHeader from '../_components/DocumentHeader';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useFirebaseAuthBridge } from '@/app/providers/FirebaseAuthBridge';

function WorkSpace({ params }) {
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [loadStatus, setLoadStatus] = useState('loading');
  const { status: bridgeStatus, error: bridgeError } = useFirebaseAuthBridge();

  useEffect(() => {
    let active = true;
    if (bridgeStatus === 'loading') {
      setLoadStatus('loading');
      setWorkspaceName('');
      return () => { active = false; };
    }
    if (bridgeStatus !== 'authenticated') {
      setLoadStatus(bridgeStatus === 'error' ? 'error' : 'blocked');
      setWorkspaceName('');
      return () => { active = false; };
    }

    setLoadStatus('loading');
    const fetchWorkspaceName = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'Workspace', params.workspaceid));
        if (!active) return;
        if (snapshot.exists()) {
          setWorkspaceName(snapshot.data().workSpaceName || '');
          setLoadStatus('ready');
        } else {
          setLoadStatus('not-found');
        }
      } catch (error) {
        if (!active) return;
        console.error('Failed to load workspace:', error);
        setLoadStatus('error');
      }
    };
    fetchWorkspaceName();
    return () => { active = false; };
  }, [bridgeStatus, params.workspaceid]);

  const message = loadStatus === 'loading' ? 'Synchronizing authentication and loading workspace…'
    : loadStatus === 'blocked' ? 'Workspace access is unavailable until Firebase authentication is ready.'
    : loadStatus === 'error' ? bridgeError || 'Unable to load workspace.'
    : loadStatus === 'not-found' ? 'Workspace not found.'
    : null;

  return (
    <div>
      <SideNav params={params} isVisible={isSideNavVisible} setIsVisible={setIsSideNavVisible}/>
      <div className={`md:flex-1 md:ml-72 md:transition-all md:duration-300 ${isSideNavVisible ? 'ml-0' : ''}`}>
        <DocumentHeader setIsVisible={setIsSideNavVisible} />
        <div className="flex items-center justify-center h-full mt-[50%] md:mt-[25%]">
          {message ? <p className="font-medium text-center text-muted-foreground">{message}</p> : <h2 className="font-semibold text-center">Welcome to {workspaceName}</h2>}
        </div>
      </div>
    </div>
  );
}
export default WorkSpace;
