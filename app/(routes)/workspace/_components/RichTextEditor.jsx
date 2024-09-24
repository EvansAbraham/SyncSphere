"use client";
import React, { useRef, useEffect, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Delimiter from '@coolbytes/editorjs-delimiter';
import Alert from 'editorjs-alert';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Underline from '@editorjs/underline';
import Hyperlink from 'editorjs-hyperlink';
import Undo from 'editorjs-undo';
import Table from '@editorjs/table';
import SimpleImage from 'simple-image-editorjs';
import List from "@editorjs/list";
import Checklist from '@editorjs/checklist';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useUser } from '@clerk/nextjs';

function RichTextEditor({ params }) {
  const ref = useRef();
  let editor;
  const { user } = useUser();
  const [documentOutput, setDocumentOutput] = useState(null);
  let isFetched = false; // Track if the document has been fetched

  useEffect(() => {
    if (user) InitEditor(); // Initialize editor when user is available
  }, [user]);

  const SaveDocument = async () => {
    console.log("Updating document...");
    const outputData = await ref.current.save(); // Save current editor content
    const docRef = doc(db, 'documentOutput', params?.documentid);

    await updateDoc(docRef, {
      output: JSON.stringify(outputData), // Save output as a string
      editedBy: user?.primaryEmailAddress?.emailAddress
    });

    console.log("Document saved successfully!"); // Log success
  };

  const GetDocumentOutput = () => {
    const unsubscribe = onSnapshot(doc(db, 'documentOutput', params?.documentid), (docSnapshot) => {
      const data = docSnapshot.data();
      if (data) {
        // Ensure we render the content only if edited by another user or if it's the first fetch
        if (data.editedBy !== user?.primaryEmailAddress?.emailAddress || !isFetched) {
          console.log("Fetching document output...");
          if (data.output) {
            editor?.render(JSON.parse(data.output)); // Render the document in the editor
          }
          isFetched = true; // Set the flag to true after fetching
        }
      } else {
        console.log("No document found!");
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  };

  const InitEditor = () => {
    if (!editor) {
      editor = new EditorJS({
        holder: 'editorjs',
        onChange: (api) => {
          SaveDocument(); // Save on change
        },
        onReady: () => {
          GetDocumentOutput(); // Fetch document data on ready
        },
        tools: {
          header: Header,
          delimiter: Delimiter,
          alert: Alert,
          Marker: {
            class: Marker,
          },
          inlineCode: {
            class: InlineCode,
          },
          underline: Underline,
          hyperlink: {
            class: Hyperlink,
          },
          quote: Quote,
          code: CodeTool,
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 2,
            },
          },
          image: SimpleImage,
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered',
            },
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
        },
      });

      ref.current = editor;
    }
  };

  return (
    <div className='lg:-ml-20'>
      <div id="editorjs" className=''></div>
    </div>
  );
}

export default RichTextEditor;