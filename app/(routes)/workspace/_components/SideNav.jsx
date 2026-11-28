"use client";
import Logo from "@/app/_components/Logo";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { collection, onSnapshot, query, writeBatch, doc, where } from "firebase/firestore";
import { Loader2Icon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import DocumentList from "./DocumentList";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useFirebaseAuthBridge } from "@/app/providers/FirebaseAuthBridge";
const MAX_FILE = Number(process.env.NEXT_PUBLIC_MAX_FILE_COUNT);

function SideNav({ params, isVisible, setIsVisible }) {
  const [documentList, setDocumentList] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [listStatus, setListStatus] = useState('loading');
  const router = useRouter();
  const { status: bridgeStatus, error: bridgeError } = useFirebaseAuthBridge();

  useEffect(() => {
    let active = true;
    if (bridgeStatus === 'loading') {
      setListStatus('loading');
      setDocumentList([]);
      return () => { active = false; };
    }
    if (bridgeStatus !== 'authenticated') {
      setDocumentList([]);
      setListStatus(bridgeStatus === 'error' ? 'error' : 'blocked');
      return () => { active = false; };
    }
    if (!params?.workspaceid) return () => { active = false; };
    setListStatus('loading');
    const q = query(collection(db, "workspaceDocuments"), where("workspaceId", "==", Number(params.workspaceid)));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!active) return;
      setDocumentList(snapshot.docs.map((item) => item.data()));
      setListStatus('ready');
    }, (error) => {
      if (!active) return;
      console.error('Failed to listen to documents:', error);
      setListStatus('error');
      toast.error('Unable to load workspace documents.');
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [bridgeStatus, params?.workspaceid]);

  const CreateNewDocument = async () => {
    if (bridgeStatus !== 'authenticated') {
      toast.error(bridgeError || 'Document creation is unavailable until authentication is ready.');
      return;
    }
    if (documentList.length >= MAX_FILE) {
      toast("Upgrade to add new file", {
        description: "You reached the maximum file count. Upgrade for unlimited file creation.",
        action: { label: "Upgrade", onClick: () => console.log("Upgrade selected") },
      });
      return;
    }
    setLoading(true);
    const docId = uuid4();
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "workspaceDocuments", docId), {
        workspaceId: Number(params?.workspaceid),
        createdBy: user?.primaryEmailAddress?.emailAddress,
        coverImage: null,
        emoji: null,
        id: docId,
        documentName: "Untitled Document",
        documentOutput: [],
      });
      batch.set(doc(db, "documentOutput", docId), { docId, output: [] });
      await batch.commit();
      router.replace("/workspace/" + params?.workspaceid + "/" + docId);
    } catch (error) {
      console.error('Document creation failed:', error);
      toast.error('Unable to create document.');
    } finally {
      setLoading(false);
    }
  };

  const message = listStatus === 'loading' ? 'Loading documents…'
    : listStatus === 'blocked' ? 'Document list is unavailable until authentication is ready.'
    : listStatus === 'error' ? bridgeError || 'Unable to load documents.'
    : null;

  return (
    <div className={`h-screen md:w-72 ${isVisible ? "" : "hidden"} transition-all z-10 md:block fixed bg-blue-50 p-5 shadow-md`}>
      <div className="flex justify-between items-center">
        <Logo />
        <X className="h-5 w-5 text-gray-500 md:hidden cursor-pointer" onClick={() => setIsVisible(false)} />
      </div>
      <hr className="my-5"></hr>
      <div>
        <div className="flex justify-between items-center gap-2">
          <h2 className="font-semibold">Workspace Name</h2>
          <Button size="sm" onClick={CreateNewDocument} disabled={bridgeStatus !== 'authenticated' || loading}>
            {loading ? <Loader2Icon className='h-4 w-4 animate-spin' /> : '+'}
          </Button>
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : <DocumentList documentList={documentList} params={params}/>}
      <div className="absolute bottom-36 md:bottom-28">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
      </div>
      <div className='absolute bottom-10 w-[85%]'>
        <Progress value={MAX_FILE ? (documentList.length / MAX_FILE) * 100 : 0} />
        <h2 className='text-sm font-medium my-2'><strong>{documentList.length}</strong> Out of <strong>{MAX_FILE}</strong> files used</h2>
        <h2 className='text-sm font-medium '>Upgrade your plan for unlimited access</h2>
      </div>
    </div>
  );
}
export default SideNav;
