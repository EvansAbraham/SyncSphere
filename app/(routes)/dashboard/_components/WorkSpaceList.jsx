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
import { useFirebaseAuthBridge } from "@/app/providers/FirebaseAuthBridge";

function WorkSpaceList() {
  const { user, isLoaded } = useUser();
  const [workSpaceList, setWorkSpaceList] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [listError, setListError] = useState(null);
  const { orgId } = useAuth();
  const { status: bridgeStatus, error: bridgeError } = useFirebaseAuthBridge();

  useEffect(() => {
    let active = true;
    if (!isLoaded || bridgeStatus === "loading") {
      setListStatus("loading");
      setWorkSpaceList([]);
      return () => { active = false; };
    }
    if (bridgeStatus !== "authenticated" || !user) {
      setWorkSpaceList([]);
      setListStatus(bridgeStatus === "error" ? "error" : "blocked");
      setListError(bridgeError || null);
      return () => { active = false; };
    }

    setListStatus("loading");
    setListError(null);
    const ownerScope = orgId || user.primaryEmailAddress?.emailAddress;
    const loadWorkspaces = async () => {
      try {
        const q = query(collection(db, "Workspace"), where("orgId", "==", ownerScope));
        const snapshot = await getDocs(q);
        if (!active) return;
        setWorkSpaceList(snapshot.docs.map((workspace) => workspace.data()));
        setListStatus("ready");
      } catch (error) {
        if (!active) return;
        console.error("Failed to load workspaces:", error);
        setWorkSpaceList([]);
        setListStatus("error");
        setListError("Unable to load workspaces.");
      }
    };
    loadWorkspaces();
    return () => { active = false; };
  }, [orgId, user, isLoaded, bridgeStatus, bridgeError]);

  return (
    <div className="my-10 p-10 md:px-24 lg:px-36 xl:px-52">
      <div className="flex justify-between">
        <h2 className="font-bold text-2xl">Hello, {user?.fullName}!</h2>
        <Link href="./createworkspace"><Button disabled={bridgeStatus !== "authenticated"}>+</Button></Link>
      </div>
      <div className="mt-10 flex justify-between">
        <div><h2 className="font-semibold text-primary">Workspaces</h2></div>
        <div className="flex gap-2"><LayoutGrid /><AlignLeft /></div>
      </div>
      {listStatus === "loading" ? (
        <p className="my-10 text-center text-muted-foreground">Synchronizing your account and loading workspaces…</p>
      ) : listStatus === "blocked" ? (
        <p className="my-10 text-center text-muted-foreground">Workspace access is unavailable until Firebase authentication is ready.</p>
      ) : listStatus === "error" ? (
        <p className="my-10 text-center text-destructive">{listError || "Unable to load workspaces."}</p>
      ) : workSpaceList.length === 0 ? (
        <div className="flex flex-col justify-center items-center my-10">
          <Image src={"/workspace.png"} height={200} width={200} alt="Workspace Image"/>
          <h2 className="font-semibold">Create a new workspace!</h2>
          <Link href="./createworkspace"><Button className="my-3" disabled={bridgeStatus !== "authenticated"}>+ New Workspace</Button></Link>
        </div>
      ) : (
        <div><WorkSpaceListItem workSpaceList={workSpaceList}/></div>
      )}
    </div>
  );
}
export default WorkSpaceList;
