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
import Table from '@editorjs/table';
import SimpleImage from 'simple-image-editorjs';
import List from "@editorjs/list";
import Checklist from '@editorjs/checklist';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useUser } from '@clerk/nextjs';
import GenerateAITemplate from './GenerateAITemplate';

function RichTextEditor({ params }) {
  const ref = useRef(); // Reference for the EditorJS instance
  let editor; // EditorJS instance
  const { user } = useUser(); // User information from Clerk
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
        if (data.editedBy !== user?.primaryEmailAddress?.emailAddress || !isFetched) {
          console.log("Fetching document output...");

          if (data.output) {
            try {
              const parsedOutput = data.output.trim() ? JSON.parse(data.output) : null;

              if (parsedOutput) {
                editor?.render(parsedOutput); // Render the parsed output
                console.log("Document rendered in the editor.");
              } else {
                console.log("Output is empty, no content to render.");
              }
            } catch (error) {
              console.error("Error parsing JSON from Firestore:", error);
            }
          } else {
            console.log("No output found in the document.");
          }

          isFetched = true; // Mark document as fetched
        }
      } else {
        console.log("No document found!");
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
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
            toggleCheckbox: (event) => {
              try {
                const checkbox = event.target.querySelector('input[type="checkbox"]');
                if (checkbox) {
                  checkbox.click();
                } else {
                  console.error('Checkbox not found!');
                }
              } catch (error) {
                console.error('Error interacting with checkbox:', error);
              }
            }
          },
        },
      });

      ref.current = editor; // Assign the editor instance to the ref
    }
  };

  return (
    <div className='lg:-ml-20'>
      <div id="editorjs" className=''></div>
      <div className='fixed bottom-10 md:ml-80 left-0 z-10'>
        <GenerateAITemplate setGenerateAIOutput={(output) => {
          try {
            // Process blocks to ensure they are in the correct format for Editor.js
            output.blocks = output.blocks.map(block => {
              // Adjust table block formatting
              if (block.type === 'table' && block.data?.content) {
                block.data.content = block.data.content.map(row =>
                  Array.isArray(row) ? row.map(cell => (typeof cell === 'object' ? Object.values(cell).join(', ') : cell)) : [row]
                );
              }
              return block; // Return the modified block
            });

            // Fetch the current content of the editor
            ref.current.save().then(existingContent => {
              const mergedOutput = {
                blocks: [...existingContent.blocks, ...output.blocks] // Append the new blocks to the existing ones
              };

              // Render the merged content in the editor
              editor.render(mergedOutput);
              console.log("AI content appended successfully.");
            });
          } catch (error) {
            console.error("Error rendering AI content:", error);
          }
        }} />
      </div>
    </div>
  );
}

export default RichTextEditor;
