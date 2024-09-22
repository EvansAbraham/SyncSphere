import React from 'react'
import DocumentHeader from './DocumentHeader'
import DocumentInfo from './DocumentInfo'
import RichTextEditor from './RichTextEditor'

function DocumentEditorSection({ params, setIsVisible }) {
  return (
    <div>
      {/* Header */}
      <DocumentHeader setIsVisible={setIsVisible} />
      <div className='p-5'>
        {/* Document Info */}
        <DocumentInfo params={params} />
        {/* Editor */}
        <RichTextEditor />
      </div>
    </div>
  );
}

export default DocumentEditorSection
