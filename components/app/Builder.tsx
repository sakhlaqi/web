import 'grapesjs-preset-webpage';
import GrapesjsReact  from './GrapesjsReact';
import GrapesJS from 'grapesjs';
// import {State} from '../../store';
// import {useSelector} from 'react-redux';

export default function Builder (props:any) {
  // const { page } = useSelector<State, State>(state => state);
  const onEditorInit = (builder:GrapesJS.Editor) => {};
  return (
    <div className="mx-auto absolute top-0 bottom-0 left-0 right-0">
      <GrapesjsReact onInit={onEditorInit} id='grapesjs-react'/>
    </div>
  )
};
