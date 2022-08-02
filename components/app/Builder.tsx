
import 'grapesjs-preset-webpage';
import { GrapesjsReact } from 'grapesjs-react';
import grapesjs from 'grapesjs';
import tailwindcss from 'grapesjs-tailwind';

import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css';
import 'grapesjs/dist/grapes.min';
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min';

// Handle tailwind's use of slashes in css names
const escapeName = (name:any) =>
  `${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, "-");

export default function Builder () {
  
  const onInit = (editor:grapesjs.Editor) => {
    
    // editor.Selectors.addSelected(escapeName);

    const blocks = editor.BlockManager.getAll();
    blocks.map( (block:any) => {
        if(['Basic','Extra','Forms'].includes(block.attributes.category)){
            block.attributes.attributes.class += ' _cat_' + block.attributes.category
        }
    })


    // editor.addComponents('<div class="cls">New component</div>');
    // const html = editor.getHtml();
    // console.log('sm: ' + );
  };

  const pluginsOpts =  {}

  const PageBuilderInstance = <GrapesjsReact 
    id='grapesjs-react'
    plugins={[
      'gjs-preset-webpage',
      'gjs-blocks-basic',
      tailwindcss,
    ]}
    pluginsOpts = {pluginsOpts}
    onInit = {onInit}
  />;
  
  return PageBuilderInstance;
};