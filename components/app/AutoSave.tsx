
import { useState, useEffect, useCallback } from "react";
import { HttpMethod } from "@/types";
import toast from "react-hot-toast";
import CheckIcon from "../../public/icons/check.svg";
import SaveIcon from "../../public/icons/save.svg";
import {State} from '../../store';
import {useSelector} from 'react-redux';
import { useRouter } from "next/router";

import type { WithSitePage } from "@/types";
interface AutoSaveProps {
  page? : WithSitePage,
}

export default function AutoSave (props: AutoSaveProps) {

  const router = useRouter();
  const _key = router.asPath.split("/")[1];
  const _type = _key == 'page' ? _key : 'post';
  const data = useSelector<State, State[typeof _type]>(state => state[_type]);
  const { builder, editor } = useSelector<State, State>(state => state);
  const [savedState, setSavedState] = useState(
    data
      ? `Last saved at ${Intl.DateTimeFormat("en", { month: "short" }).format(
          new Date(data.updatedAt)
        )} ${Intl.DateTimeFormat("en", { day: "2-digit" }).format(
          new Date(data.updatedAt)
        )} ${Intl.DateTimeFormat("en", {
          hour: "numeric",
          minute: "numeric",
        }).format(new Date(data.updatedAt))}`
      : ""
  );

  const [saveState, setSaveState] = useState(
    data ? `Save` : "Saving..."
  );

  const saveChanges = useCallback(
    async (_data:typeof data, _builder:typeof builder, _editor:typeof editor) => {
      setSaveState("Saving...");
      let body = {
        id: _data?.id,
        type: _data?.type || _type,
        slug: _data?.slug,
        subdomain: _data?.site?.subdomain,
        customDomain: _data?.site?.customDomain,
        title: _data?.title,
        description: _data?.description,
      }
      switch (_type) { 
        case "post" :
          body = {
            ...body,
            ... {
              preview : _editor && _editor?.getData() || _data?.content,
            }
          }
          break;
        case "page" :
          body = {
            ...body,
            ... {
              preview : _builder && _builder?.getHtml() || _data?.content,
              previewData : _builder && JSON.stringify(_builder?.getProjectData()) || _data?.data,
            }
          }
          break;
      }
      // if ()
      // _builder && _builder.runCommand('get-tailwindCss', {
      //   callback: (_twcss:string) => { body.twcss = _twcss; },
      // });
      try {
        const response = await fetch("/api/page", {
          method: HttpMethod.PUT,
          headers: {
            "Content-Type": "application/json",
          },
          body:  
          JSON.stringify(body),
        });

        if (response.ok) {
          const responseData = await response.json();
          setSavedState(
            `Last save ${Intl.DateTimeFormat("en", { month: "short" }).format(
              new Date(responseData.updatedAt)
            )} ${Intl.DateTimeFormat("en", { day: "2-digit" }).format(
              new Date(responseData.updatedAt)
            )} at ${Intl.DateTimeFormat("en", {
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(responseData.updatedAt))}`
          );
          setSaveState("Save");
          toast.success("Successfully Saved!");
        } else {
          setSaveState("Save");
          toast.error("Failed to save");
        }
      } catch (error) {
        console.error(error);
      }
    },
    [data?.id]
  );

  const triggerSave = () => {
    saveChanges(data, builder, editor)
  }

  //uncomment to enable Auto Save
  // const [debouncedData] = useDebounce(data, 1000);
  // useEffect(() => {
  //   if (debouncedData.title) saveChanges(debouncedData);
  // }, [debouncedData, saveChanges]);

  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (data?.slug && !publishing)
      setDisabled(false);
    else setDisabled(true);
  }, [publishing, data]);

  useEffect(() => {
    function clickedSave(e: KeyboardEvent) {
      let charCode = String.fromCharCode(e.which).toLowerCase();

      if ((e.ctrlKey || e.metaKey) && charCode === "s") {
        e.preventDefault();
        saveChanges(data, builder, editor);
      }
    }
    window.addEventListener("keydown", clickedSave);

    return () => window.removeEventListener("keydown", clickedSave);
  }, [data, saveChanges]);

  async function publish(_data:typeof data, _builder:typeof builder, _editor:typeof editor) {
    setPublishing(true);
    try {
      let body = {
        id: _data?.id,
        type: _data?.type || _type,
        slug: _data?.slug,
        subdomain: _data?.site?.subdomain,
        customDomain: _data?.site?.customDomain,
        title: _data?.title,
        description: _data?.description,
        published: true,
      }
      switch (_type) { 
        case "post" :
          body = {
            ...body,
            ... {
              content : _editor && _editor?.getData() || _data?.content,
              preview : _editor && _editor?.getData() || _data?.content,
            }
          }
          break;
        case "page" :
          body = {
            ...body,
            ... {
              data : _builder && JSON.stringify(_builder?.getProjectData()) || _data?.data,
              content : _builder && _builder?.getHtml() || _data?.content,
              previewData : _builder && JSON.stringify(_builder?.getProjectData()) || _data?.data,
              preview : _builder && _builder?.getHtml() || _data?.content
            }
          }
          break;
      }
      const response = await fetch(`/api/page`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        // mutate(`/api/page?pageId=${page?.id}`);
        toast.success("Successfully Published!");
      } else {
        toast.error("Failed to publish");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }
    return (
      <>
        <div className="font-cal flex items-center text-gray-700 pl-5 sm:hover:text-black sm:hover:bg-white">
          <button
            onClick={async () => {
              await triggerSave();
            }}
            title={
              disabled
                ? "Page must have a title, description, and content to be published."
                : savedState
            }
            disabled={disabled}
            className={`${
              disabled
                ? "cursor-not-allowed bg-gray-300 border-gray-300"
                : "bg-gray-200 text-black hover:bg-[#333] hover:text-white border-black"
            } inline-flex items-center px-4 py-2 shadow-sm text-medium font-thin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
          >
            <SaveIcon className="-ml-1 mr-2 h-5 w-5" /> {saveState}
          </button>

          <a href={`http://${data.site?.subdomain}.${process.env.ROOT_DOMAIN}/${_type != 'page' ?  _type + '/' : ''}${data?.slug != 'home' ? data?.slug : ''}`}
            rel="noreferrer" target="_blank"
            className={`bg-gray-200 text-black hover:bg-[#333] hover:text-white inline-flex items-center px-4 py-2 border-l border-r border-gray-50  shadow-sm text-medium font-thin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
          >
            Preview ↗
          </a>

          <button
            onClick={async () => {
              await publish(data, builder, editor);
            }}
            title={
              disabled
                ? "Page must have a title, and content to be published."
                : "Publish"
            }
            disabled={disabled}
            className={`${
              disabled
                ? "cursor-not-allowed bg-gray-300 border-gray-300"
                : "bg-green-700 hover:bg-green-600 hover:text-white border-black"
            } inline-flex items-center px-4 py-2 shadow-sm text-medium font-thin text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {!publishing && data?.published &&
              <CheckIcon className="-ml-1 mr-2 h-5 w-5" />
            }
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </>
    )
}
