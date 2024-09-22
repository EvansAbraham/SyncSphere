"use client";
import React, { useState } from "react";
import SideNav from "../../_components/SideNav";
import DocumentEditorSection from "../../_components/DocumentEditorSection";

function WorkSpaceDocument({ params }) {
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  return (
    <div className="flex">
      {/* SideBar */}
      <div className="">
        <SideNav params={params} isVisible={isSideNavVisible} setIsVisible={setIsSideNavVisible}/>
      </div>
      {/* Document */}
      <div className="md:ml-72 font-bold flex-grow">
        <DocumentEditorSection params={params} setIsVisible={setIsSideNavVisible}/>
      </div>
    </div>
  );
}

export default WorkSpaceDocument;