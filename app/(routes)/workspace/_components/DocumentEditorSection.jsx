import React from 'react'
import DocumentHeader from './DocumentHeader'
import DocumentInfo from './DocumentInfo'
import RichTextEditor from './RichTextEditor';

function DocumentEditorSection({ params, setIsVisible }) {
  return (
    <div>
      {/* Header */}
      <DocumentHeader setIsVisible={setIsVisible} />
        {/* Document Info */}
        <DocumentInfo params={params} />
        {/* Editor */}
        <RichTextEditor params={params}/>
    </div>
  );
}

export default DocumentEditorSection
