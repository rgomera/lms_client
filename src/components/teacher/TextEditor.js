import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './TextEditor.css';

const TextEditor = ({ textEditorContent, onSetTextEditorContent }) => {
   const handleChange = (e, editor) => {
      const data = editor.getData();
      onSetTextEditorContent(data);
   };

   return (
      <div>
         <CKEditor
            data={textEditorContent}
            editor={ClassicEditor}
            onChange={handleChange}
            config={{
               placeholder: 'Tell something to your class.. ',
               toolbar: ['heading', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
               shouldNotGroupWhenFull: true,
               link: {
                  // Automatically add target="_blank" and rel="noopener noreferrer" to all external links.
                  addTargetToExternalLinks: true,
               },
            }}
         />
      </div>
   );
};

export default TextEditor;
