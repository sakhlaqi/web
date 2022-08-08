import 'grapesjs-preset-webpage';
import GrapesjsReact  from './GrapesjsReact';
import GrapesJS from 'grapesjs';
import {State} from '../../store';
import {useSelector, useDispatch} from 'react-redux';

export default function Builder (props:any) {
  const { page } = useSelector<State, State>(state => state);
  const onEditorInit = (editor:GrapesJS.Editor) => {
    editor.loadProjectData( page?.content && JSON.parse(page?.content ) || {});
  };
  return (
    <>
      <GrapesjsReact onInit={onEditorInit} id='grapesjs-react'/>
    </>
  )
};
