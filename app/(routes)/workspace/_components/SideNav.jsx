"use client";
import Logo from "@/app/_components/Logo";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebaseConfig";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  where,
  doc
} from "firebase/firestore";
import { Loader2Icon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import DocumentList from "./DocumentList";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
const MAX_FILE=process.env.NEXT_PUBLIC_MAX_FILE_COUNT;

function SideNav({ params, isVisible, setIsVisible }) {
  const [documentList, setDocumentList] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState();
  const router = useRouter();
  useEffect(() => {
    params && GetDocumentList();
  }, [params]);


  const GetDocumentList = () => {
    const q = query(
      collection(db, "workspaceDocuments"),
      where("workspaceId", "==", Number(params?.workspaceid))
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setDocumentList([]);

      querySnapshot.forEach((doc) => {
        setDocumentList((documentList) => [...documentList, doc.data()]);
      });
    });
  };

  const CreateNewDocument = async () => {
    if(documentList?.length>=MAX_FILE)
      {
          toast("Upgrade to add new file",{
              description: "You reach max file, Please upgrad for unlimited file creation",
              action: {
                label: "Upgrade",
                onClick: () => console.log("Undo"),
              },
            })
          return;
      }
    setLoading(true);
    const docId = uuid4();
    await setDoc(doc(db, "workspaceDocuments", docId.toString()), {
      workspaceId: Number(params?.workspaceid),
      createdBy: user?.primaryEmailAddress?.emailAddress,
      coverImage: null,
      emoji: null,
      id: docId,
      documentName: "Untitled Document",
      documentOutput: [],
    });

    await setDoc(doc(db, "documentOutput", docId.toString()), {
      docId: docId,
      output: [],
    });

    setLoading(false);
    router.replace("/workspace/" + params?.workspaceid + "/" + docId);
  };

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
          <Button size="sm" onClick={CreateNewDocument}>
            {loading?<Loader2Icon className='h-4 w-4 animate-spin' />:'+'}
          </Button>
        </div>
      </div>
      {/* Document List */}
      <DocumentList documentList={documentList} params={params}/>
      {/* Progress Bar */}
      <div className='absolute bottom-10 w-[85%]'>
        <Progress value={(documentList?.length/MAX_FILE)*100} />
        <h2 className='text-sm font-medium my-2'><strong>{documentList?.length}</strong> Out of <strong>{MAX_FILE}</strong> files used</h2>
        <h2 className='text-sm font-medium '>Upgrade your plan for unlimted access</h2>
        </div>
    </div>
  );
}

export default SideNav;
