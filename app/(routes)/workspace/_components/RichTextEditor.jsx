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
import SimpleImage from 'simple-image-editor';
import List from "@editorjs/list";
import Checklist from '@editorjs/checklist';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useUser } from '@clerk/nextjs';
import GenerateAITemplate from './GenerateAITemplate';
import { useFirebaseAuthBridge } from '@/app/providers/FirebaseAuthBridge';

function RichTextEditor({ params }) {
  const editorRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const isFetchedRef = useRef(false);
  const savingRef = useRef(false);
  const { user } = useUser();
  const { status: bridgeStatus } = useFirebaseAuthBridge();
  const [documentOutput, setDocumentOutput] = useState(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    let active = true;
    let editorInstance = null;
    isFetchedRef.current = false;
    setEditorReady(false);
    setDocumentOutput(null);

    if (bridgeStatus !== 'authenticated' || !user || !params?.documentid) {
      return () => { active = false; };
    }

    const saveDocument = async () => {
      if (!active || bridgeStatus !== 'authenticated' || !user || !editorRef.current || !isFetchedRef.current || savingRef.current) return;
      savingRef.current = true;
      try {
        const outputData = await editorRef.current.save();
        if (!active || bridgeStatus !== 'authenticated') return;
        await updateDoc(doc(db, 'documentOutput', params.documentid), {
          output: JSON.stringify(outputData),
          editedBy: user.primaryEmailAddress?.emailAddress,
        });
      } catch (error) {
        if (active) console.error('Unable to save document:', error);
      } finally {
        savingRef.current = false;
      }
    };

    const listenForDocumentOutput = () => {
      unsubscribeRef.current = onSnapshot(doc(db, 'documentOutput', params.documentid), (snapshot) => {
        if (!active || !snapshot.exists()) return;
        const data = snapshot.data();
        if (data.editedBy !== user.primaryEmailAddress?.emailAddress || !isFetchedRef.current) {
          if (data.output) {
            try {
              const parsed = typeof data.output === 'string' ? (data.output.trim() ? JSON.parse(data.output) : null) : data.output;
              if (parsed) editorInstance?.render(parsed);
            } catch (error) {
              console.error('Error parsing document output:', error);
            }
          }
          isFetchedRef.current = true;
        }
      }, (error) => {
        if (active) console.error('Document output subscription failed:', error);
      });
    };

    editorInstance = new EditorJS({
      holder: 'editorjs',
      onChange: saveDocument,
      onReady: () => {
        if (!active) return;
        editorRef.current = editorInstance;
        setEditorReady(true);
        listenForDocumentOutput();
      },
      tools: {
        header: Header,
        delimiter: Delimiter,
        alert: Alert,
        Marker: { class: Marker },
        inlineCode: { class: InlineCode },
        underline: Underline,
        hyperlink: { class: Hyperlink },
        quote: Quote,
        code: CodeTool,
        table: { class: Table, inlineToolbar: true, config: { rows: 2, cols: 2 } },
        image: SimpleImage,
        list: { class: List, inlineToolbar: true, config: { defaultStyle: 'unordered' } },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
          toggleCheckbox: (event) => {
            try {
              const checkbox = event.target.querySelector('input[type="checkbox"]');
              if (checkbox) checkbox.click();
              else console.error('Checklist checkbox not found.');
            } catch (error) {
              console.error('Checklist interaction failed:', error);
            }
          },
        },
      },
    });
    editorRef.current = editorInstance;

    return () => {
      active = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      editorRef.current = null;
      if (editorInstance && typeof editorInstance.destroy === 'function') {
        editorInstance.destroy();
      }
      setEditorReady(false);
    };
  }, [bridgeStatus, user, params?.documentid]);

  const message = bridgeStatus === 'loading' ? 'Synchronizing authentication…'
    : bridgeStatus !== 'authenticated' ? 'Editor is unavailable until Firebase authentication is ready.'
    : !editorReady ? 'Loading editor…' : null;

  return (
    <div className='lg:-ml-20'>
      {message && <p className='mb-4 text-sm text-muted-foreground'>{message}</p>}
      <div id="editorjs" className={message ? 'hidden' : ''}></div>
      {bridgeStatus === 'authenticated' && editorReady && (
        <div className='fixed bottom-10 md:ml-80 left-0 z-10'>
          <GenerateAITemplate setGenerateAIOutput={(output) => {
            if (bridgeStatus !== 'authenticated' || !editorRef.current) return;
            try {
              const normalizedBlocks = output.blocks.map((block) => {
                if (block.type === 'table' && block.data?.content) {
                  block.data.content = block.data.content.map((row) =>
                    Array.isArray(row) ? row.map((cell) => (typeof cell === 'object' ? Object.values(cell).join(', ') : cell)) : [row]
                  );
                }
                return block;
              });
              editorRef.current.save().then((existingContent) => {
                if (!editorRef.current || bridgeStatus !== 'authenticated') return;
                editorRef.current.render({ blocks: [...existingContent.blocks, ...normalizedBlocks] });
              }).catch((error) => console.error('Failed to append generated content:', error));
            } catch (error) {
              console.error('Error preparing AI output for editor:', error);
            }
          }} />
        </div>
      )}
    </div>
  );
}
export default RichTextEditor;
