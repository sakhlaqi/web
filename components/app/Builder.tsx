import { useState, useEffect, useCallback } from "react";

import 'grapesjs-preset-webpage';
import GrapesjsReact  from './GrapesjsReact';
import GrapesJS from 'grapesjs';

export default function Builder (props:any) {
  
  const onEditorInit = (editor:GrapesJS.Editor) => {
    
    // console.log('onEditorInit', editor, props.page);
    // console.log('isAutosave',editor.StorageManager.getCurrentStorage());
  };

  return (
    <>
      <GrapesjsReact onInit={onEditorInit} id='grapesjs-react'/>
    </>
  )
};
