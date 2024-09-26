"use client";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/nextjs";
import { AlignLeft, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import WorkSpaceListItem from "./WorkSpaceListItem";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

function WorkSpaceList() {
  const { user } = useUser();
  const [workSpaceList, setWorkSpaceList] = useState([]);
  const {orgId} = useAuth();

  useEffect(()=>{
    user&&getWorkSpaceList()
  },[orgId, user]);

  const getWorkSpaceList =async()=>{
    const q=query(collection(db,'Workspace'),where('orgId','==',orgId?orgId:user?.primaryEmailAddress?.emailAddress));
    const querySnapshot=await getDocs(q);
    setWorkSpaceList([]);
    querySnapshot.forEach((doc) => {
      console.log(doc.data());
      setWorkSpaceList((prev) => [...prev, doc.data()]);
    });
  };
  return (
    <div className="my-10 p-10 md:px-24 lg:px-36 xl:px-52">
      <div className="flex justify-between">
        <h2 className="font-bold text-2xl">Hello, {user?.fullName}!</h2>
        <Link href={"./createworkspace"}>
          <Button>+</Button>
        </Link>
        
      </div>
      <div className="mt-10 flex justify-between">
        <div>
          <h2 className="font-semibold text-primary">Workspaces</h2>
        </div>
        <div className="flex gap-2">
          <LayoutGrid />
          <AlignLeft />
        </div>
      </div>
      {workSpaceList?.length == 0 ? 
      <div className="flex flex-col justify-center items-center my-10">
        <Image src={"/workspace.png"} height={200} width={200} alt="Workspace Image"/>
        <h2 className="font-semibold">Create a new workspace!</h2>
        <Link href={"./createworkspace"}>
          <Button className="my-3">+ New Workspace</Button> 
        </Link>
       
      </div> : <div><WorkSpaceListItem workSpaceList={workSpaceList}/></div>}
    </div>
  );
}

export default WorkSpaceList;
