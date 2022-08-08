
import { useState, useEffect, useCallback } from "react";
import { HttpMethod } from "@/types";
import toast from "react-hot-toast";
import type { WithSitePage } from "@/types";
import CheckIcon from "../../public/icons/check.svg";
import SaveIcon from "../../public/icons/save.svg";

import {State} from '../../store';
import {useSelector} from 'react-redux';
import { useRouter } from "next/router";
import GrapesJS from 'grapesjs';

import type { WithSitePost } from "@/types";
interface AutoSaveProps {
  page? : WithSitePage,
  post? : WithSitePost,
  editor? : GrapesJS.Editor
}

export default function AutoSave (props: AutoSaveProps) {

  const router = useRouter();
  
  const _key = router.asPath.split("/")[1];
  const _type = _key == 'page' ? _key : 'post';
  const data = useSelector<State, State[typeof _type]>(state => state[_type]);
  const { editor } = useSelector<State, State>(state => state);

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
    async (_data:typeof data) => {
      setSaveState("Saving...");

      try {
        const response = await fetch("/api/" + _type, {
          method: HttpMethod.PUT,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: _data?.id,
            title: _data?.title,
            description: _data?.description,
            content: editor && JSON.stringify(editor?.getProjectData()) || _data?.content,
          }),
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
    saveChanges(data)
  }

  //uncomment to enable Auto Save
  // const [debouncedData] = useDebounce(data, 1000);
  // useEffect(() => {
  //   if (debouncedData.title) saveChanges(debouncedData);
  // }, [debouncedData, saveChanges]);

  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (data?.title && data.description && !publishing)
      setDisabled(false);
    else setDisabled(true);
  }, [publishing, data]);

  useEffect(() => {
    function clickedSave(e: KeyboardEvent) {
      let charCode = String.fromCharCode(e.which).toLowerCase();

      if ((e.ctrlKey || e.metaKey) && charCode === "s") {
        e.preventDefault();
        saveChanges(data);
      }
    }
    window.addEventListener("keydown", clickedSave);

    return () => window.removeEventListener("keydown", clickedSave);
  }, [data, saveChanges]);

  async function publish(_data:typeof data) {
    setPublishing(true);
    try {
      const response = await fetch(`/api/` + _type, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: _data?.id,
          title: _data?.title,
          description: _data?.description,
          content: editor && JSON.stringify(editor?.getProjectData()) || _data?.content,
          published: true,
          subdomain: _data?.site?.subdomain,
          customDomain: _data?.site?.customDomain,
          slug: _data?.slug,
        }),
      });

      if (response.ok) {
        // mutate(`/api/page?pageId=${page?.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }
    return (
      <>
        <div className="font-cal flex items-center space-x-2 text-gray-700 pl-5 sm:hover:text-black sm:hover:bg-white">
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
            } inline-flex items-center px-4 py-2 rounded-md shadow-sm text-medium font-thin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
          >
            <SaveIcon className="-ml-1 mr-2 h-5 w-5" /> {saveState}
          </button>

          <button
            onClick={async () => {
              await publish(data);
            }}
            title={
              disabled
                ? "Page must have a title, description, and content to be published."
                : "Publish"
            }
            disabled={disabled}
            className={`${
              disabled
                ? "cursor-not-allowed bg-gray-300 border-gray-300"
                : "bg-green-700 hover:bg-green-600 hover:text-white border-black"
            } inline-flex items-center px-4 py-2 rounded-md shadow-sm text-medium font-thin text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
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
