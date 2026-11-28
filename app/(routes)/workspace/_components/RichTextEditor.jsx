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
import { useFirebaseAuthBridge } from '@/app/providers/FirebaseAuthBridge';
import { createAutosaveQueue } from '@/lib/document-autosave';
import { createDocumentSnapshotCoordinator } from '@/lib/document-snapshot-coordinator';
import { executeDocumentSaveSession } from '@/lib/document-save-session';

function RichTextEditor({ params }) {
  const editorRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const snapshotCoordinatorRef = useRef(null);
  const suppressEditorChangeRef = useRef(false);
  const { user } = useUser();
  const { status: bridgeStatus } = useFirebaseAuthBridge();
  const [documentOutput, setDocumentOutput] = useState(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    let active = true;
    let editorInstance = null;
    snapshotCoordinatorRef.current = createDocumentSnapshotCoordinator();
    setEditorReady(false);
    setDocumentOutput(null);

    if (bridgeStatus !== 'authenticated' || !user || !params?.documentid) {
      return () => { active = false; };
    }

    const autosaveQueue = createAutosaveQueue(async () => {
      if (!active || bridgeStatus !== 'authenticated' || !user || !editorRef.current || !snapshotCoordinatorRef.current?.initialized) return;
      const currentEditor = editorRef.current;
      const coordinator = snapshotCoordinatorRef.current;
      const documentId = params.documentid;
      const userEmail = user.primaryEmailAddress?.emailAddress;
      const revision = coordinator.localRevision;
      const isCurrentSession = () => active
        && bridgeStatus === 'authenticated'
        && Boolean(user)
        && editorRef.current === currentEditor
        && snapshotCoordinatorRef.current === coordinator;
      try {
        await executeDocumentSaveSession({
          isCurrent: isCurrentSession,
          prepare: async () => ({
            revision,
            outputData: await currentEditor.save(),
          }),
          persist: ({ outputData }) => updateDoc(doc(db, 'documentOutput', documentId), {
            output: JSON.stringify(outputData),
            editedBy: userEmail,
          }),
          onPersisted: () => coordinator.markPersisted(revision),
        });
      } catch (error) {
        if (isCurrentSession()) console.error('Unable to save document:', error);
      }
    }, () => active && bridgeStatus === 'authenticated' && Boolean(user));

    const saveDocument = () => {
      if (suppressEditorChangeRef.current) return;
      if (!active || bridgeStatus !== 'authenticated' || !user || !editorRef.current || !snapshotCoordinatorRef.current?.initialized) return;
      snapshotCoordinatorRef.current.markLocalEdit();
      autosaveQueue.notify();
    };

    const listenForDocumentOutput = () => {
      unsubscribeRef.current = onSnapshot(doc(db, 'documentOutput', params.documentid), (snapshot) => {
        if (!active) return;
        const data = snapshot.exists() ? snapshot.data() : {};
        const isLocalWrite = data.editedBy === user.primaryEmailAddress?.emailAddress;
        const decision = snapshotCoordinatorRef.current?.receiveSnapshot({ isLocalWrite });
        if (!decision) return;
        if (decision.shouldRender && data.output) {
          try {
            const parsed = typeof data.output === 'string' ? (data.output.trim() ? JSON.parse(data.output) : null) : data.output;
            if (parsed) {
              suppressEditorChangeRef.current = true;
              Promise.resolve(editorInstance?.render(parsed)).catch((error) => {
                console.error('Unable to render document snapshot:', error);
              }).finally(() => {
                suppressEditorChangeRef.current = false;
              });
            }
          } catch (error) {
            suppressEditorChangeRef.current = false;
            console.error('Error parsing document output:', error);
          }
        }
        if (!editorReady) setEditorReady(true);
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
      autosaveQueue.dispose();
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      editorRef.current = null;
      snapshotCoordinatorRef.current = null;
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
      <div id="editorjs" className={!editorReady ? 'hidden' : ''}></div>
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
