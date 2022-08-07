
import { useState, useEffect, useCallback } from "react";
import { HttpMethod } from "@/types";
import toast from "react-hot-toast";
import type { WithSitePage } from "@/types";
import CheckIcon from "../../public/icons/check.svg";
import SaveIcon from "../../public/icons/save.svg";

import {State} from '../../store';
import {useSelector} from 'react-redux';
import { useRouter } from "next/router";

import type { WithSitePost } from "@/types";
interface AutoSaveProps {
  page? : WithSitePage,
  post? : WithSitePost
}

export default function AutoSave (props: AutoSaveProps) {

  const router = useRouter();

  const _key = router.asPath.split("/")[1];
  const _type = _key == 'page' ? _key : 'post';
  const _page = useSelector<State, State[typeof _type]>(state => state[_type]);

  // console.log(`AutoSave`, _type, _page);

  const [savedState, setSavedState] = useState(
    _page
      ? `Last saved at ${Intl.DateTimeFormat("en", { month: "short" }).format(
          new Date(_page.updatedAt)
        )} ${Intl.DateTimeFormat("en", { day: "2-digit" }).format(
          new Date(_page.updatedAt)
        )} ${Intl.DateTimeFormat("en", {
          hour: "numeric",
          minute: "numeric",
        }).format(new Date(_page.updatedAt))}`
      : ""
  );

  const [saveState, setSaveState] = useState(
    _page ? `Save` : "Saving..."
  );

  const saveChanges = useCallback(
    async (data:typeof _page) => {
      setSaveState("Saving...");

      try {
        console.log("Saving...", data);
        const response = await fetch("/api/" + _type, {
          method: HttpMethod.PUT,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: data?.id,
            title: data?.title,
            description: data?.description,
            content: data?.content,
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
    [_page?.id]
  );

  const triggerSave = () => {
    saveChanges(_page)
  }

  //uncomment to enable Auto Save
  // const [debouncedData] = useDebounce(data, 1000);
  // useEffect(() => {
  //   if (debouncedData.title) saveChanges(debouncedData);
  // }, [debouncedData, saveChanges]);

  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (_page?.title && _page.description && _page.content && !publishing)
      setDisabled(false);
    else setDisabled(true);
  }, [publishing, _page]);

  useEffect(() => {
    function clickedSave(e: KeyboardEvent) {
      let charCode = String.fromCharCode(e.which).toLowerCase();

      if ((e.ctrlKey || e.metaKey) && charCode === "s") {
        e.preventDefault();
        saveChanges(_page);
      }
    }
    window.addEventListener("keydown", clickedSave);

    return () => window.removeEventListener("keydown", clickedSave);
  }, [_page, saveChanges]);

  async function publish(data:typeof _page) {
    setPublishing(true);
    try {
      const response = await fetch(`/api/` + _type, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data?.id,
          title: data?.title,
          description: data?.description,
          content: data?.content,
          published: true,
          subdomain: data?.site?.subdomain,
          customDomain: data?.site?.customDomain,
          slug: data?.slug,
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
              await publish(_page);
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
            {!publishing && _page?.published &&
              <CheckIcon className="-ml-1 mr-2 h-5 w-5" />
            }
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </>
    )
}
