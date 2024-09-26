import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import DocumentOptions from './DocumentOptions';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { toast } from 'sonner';

function DocumentList({ documentList, params }) {
  const router = useRouter();

  const DeleteDocument = async (docId) => {
    await deleteDoc(doc(db, "workspaceDocuments", docId));
    await deleteDoc(doc(db, "documentOutput", docId));
    toast('Document Deleted!');
  };

  return (
    <div>
      {documentList.map((doc, index) => (
        <div
          key={index}
          onClick={() => router.push('/workspace/' + params?.workspaceid + "/" + doc?.id)}
          className={`mt-3 p-2 px-3 hover:bg-gray-200 
            rounded-lg cursor-pointer flex justify-between items-center
            ${doc?.id === params?.documentid && 'bg-white'}
          `}
        >
          <div className='flex gap-2 items-center'>
            {!doc.emoji && <Image src={'/loopdocument.svg'} width={20} height={20} alt='loopdocumenticon' />}
            <div className='flex items-center relative overflow-hidden whitespace-nowrap'>
              <span className={`inline-block ${doc.documentName.length > 15 ? 'mr-2' : ''}`}>
                {doc.documentName.length > 15 ? doc.documentName.slice(0, 15) + '...' : doc.documentName}
              </span>
              {doc.documentName.length > 15 && (
                <span className='absolute right-0 h-full w-16 bg-gradient-to-l from-white to-transparent transition-opacity duration-300 ease-in-out opacity-50'></span>
              )}
            </div>
            {doc.emoji && <span>{doc.emoji}</span>}
          </div>
          <DocumentOptions doc={doc} deleteDocument={(docId) => DeleteDocument(docId)} />
        </div>
      ))}
    </div>
  );
}

export default DocumentList;
