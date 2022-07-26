import React from 'react';
import GrapesJS from 'grapesjs';

//@ts-ignore
import tailwindcss from 'grapesjs-tailwind';
import {State} from '../../store';
import {useSelector, useDispatch} from 'react-redux';
import Loader from "@/components/app/Loader";

import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css';
import 'grapesjs/dist/grapes.min';
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min';

export default function GrapesjsReact(props:any) {
    var id = props.id,
        onInit = props.onInit,
        children = props.children;
  
    const [builder, setBuilder] = React.useState<GrapesJS.Editor>();
    const { page } = useSelector<State, State>(state => state);
    const [visibile, setVisibile] = React.useState(false);
    // fixes problem with tailwind (use of slashes in css class names)
    const escapeName = (name: any) : any => `${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, '-');
    const dispatch = useDispatch();

    React.useEffect(function () {
      var selector = "#" + id;
      if (!builder) {
        var _builder = GrapesJS.init({
            // Indicate where to init the builder. You can also pass an HTMLElement
            container: selector,
            // Get the content for the canvas directly from the element
            // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
            fromElement: true,
            height: '100%',
            /** Show the wrapper component in the final code, eg. in builder.getHtml() */
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
        
        setBuilder(_builder);

        //Adding _cat_... class to predefined blocks
        const blocks = _builder.BlockManager.getAll();
        blocks.map( (block:any) => {
            if(['Basic','Extra','Forms'].includes(block.attributes.category)){
                block.attributes.attributes.class += ' _cat_' + block.attributes.category
            }
        })
        // Close all the categories on start.
        setTimeout(() => {
          const categories: any = _builder.BlockManager.getCategories();
          categories.each((category : any) => { category.set('open', false); });
        }, 500);

        _builder.loadProjectData( page?.previewData && JSON.parse(page?.previewData ) || {});

        dispatch({type: 'BUILDER', payload: _builder});

        if (typeof onInit === 'function') {
          onInit(_builder);
        }
        _builder.on('load', (some, argument) => {
            setTimeout(() => setVisibile(true), 500);
        })

      }
    }, [children, builder, id, onInit]);
    return  (
      <>
        {!visibile && <Loader />}
        <div id={id} className="mx-auto absolute top-0 bottom-0 left-0 right-0" style={{ visibility: visibile ? 'visible' : 'hidden' }}>
          {children}
        </div>
      </>
    )
}
