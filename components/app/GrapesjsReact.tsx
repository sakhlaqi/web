import React from 'react';
import GrapesJS from 'grapesjs';

//@ts-ignore
import tailwindcss from 'grapesjs-tailwind';

import {State} from '../../store';
import {useSelector, useDispatch} from 'react-redux';

import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css';
import 'grapesjs/dist/grapes.min';
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min';

export default function GrapesjsReact(props:any) {
    var id = props.id,
        onInit = props.onInit,
        children = props.children;
  
    const [editor, setEditor] = React.useState<GrapesJS.Editor>();
    const { page } = useSelector<State, State>(state => state);

    // fixes problem with tailwind (use of slashes in css class names)
    const escapeName = (name: any) : any => `${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, '-');
    const dispatch = useDispatch();

    React.useEffect(function () {
      var selector = "#" + id;
      if (!editor) {
        var _editor = GrapesJS.init({
            // Indicate where to init the editor. You can also pass an HTMLElement
            container: selector,
            // Get the content for the canvas directly from the element
            // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
            fromElement: true,
            height: '100%',
            /** Show the wrapper component in the final code, eg. in editor.getHtml() */
            exportWrapper: false,
            wrapperIsBody: false,
            // Disable the storage manager for the moment
            // storageManager: false,
            // Avoid any default panel
            panels: { defaults: [] },
            plugins: [
                'gjs-preset-webpage',
                'gjs-blocks-basic',
                tailwindcss
            ],
            // @ts-ignore
            selectorManager : {escapeName:escapeName},

            storageManager: {
              autosave: true,
              autoload: true,
              onStore: data => ({id:page?.id, data:JSON.stringify(data)}),
              onLoad: result => result.data && JSON.parse(result.data) || {},
              type: 'local',
              options: {
                local: {
                  key: `gjsPage-${page?.id}`
                },
                remote: {
                  urlStore: '/api/page',
                  urlLoad: '/api/page?pageId=' + page?.id,
                  fetchOptions: opts => ({ method: 'PUT' }),
                }
              }
            }
        });
        
        setEditor(_editor);

        //Adding _cat_... class to predefined blocks
        const blocks = _editor.BlockManager.getAll();
        blocks.map( (block:any) => {
            if(['Basic','Extra','Forms'].includes(block.attributes.category)){
                block.attributes.attributes.class += ' _cat_' + block.attributes.category
            }
        })
        // Close all the categories on start.
        // setTimeout(() => {
        //   const categories: any = _editor.BlockManager.getCategories();
        //   categories.each((category : any) => { category.set('open', false); });
        // }, 500);

        _editor.loadProjectData( page?.data && JSON.parse(page?.data ) || {});

        dispatch({type: 'EDITOR', payload: _editor});

        if (typeof onInit === 'function') {
          onInit(_editor);
        }
      }
    }, [children, editor, id, onInit]);

    return React.createElement("div", {
      id: id
    }, children);
}
