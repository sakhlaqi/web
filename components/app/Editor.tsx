import React from 'react'
import {useDispatch} from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import toast from "react-hot-toast";

export default function Editor (props:any) {
    let _editor:any = null;
    const dispatch = useDispatch();
    return (
        <CKEditor
            onReady={ (editor:any) => {
                // console.log(`toolbar`,editor.ui.view.toolbar);
                // Insert the toolbar before the editable area.
                editor.ui.getEditableElement().parentElement.insertBefore(
                    editor.ui.view.toolbar.element,
                    editor.ui.getEditableElement()
                );
                _editor = editor;
                dispatch({type: 'EDITOR', payload: editor});
            } }
            onError={ ( error:any ) => {
                toast.error("Failed to launch the editor");
                console.error(error);
            }}
            // onChange={ ( event, editor ) => console.log( { event, editor } ) }
            editor={ DecoupledEditor }
            data={props.data}
            config={{
                placeholder : 'Write something, start here...',
            }}
        />
    )
}
