
import { useState, useEffect, useCallback } from "react";
import { HttpMethod } from "@/types";
import { mutate } from "swr";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";

import 'grapesjs-preset-webpage';
import GrapesjsReact  from './GrapesjsReact';
import GrapesJS from 'grapesjs';
import LoadingDots from "@/components/app/loading-dots";
import toast from "react-hot-toast";

import type { WithSitePage } from "@/types";

interface PageData {
  title: string;
  description: string;
  content: string;
}

export default function Builder (props:any) {
  
  const router = useRouter();

  // const page = props.page || false;

  const onEditorInit = (editor:GrapesJS.Editor) => {
    console.log('onEditorInit', editor);
  };
  
  console.log(props)
  
  const [page, setPage] = useState<WithSitePage>(props.page);

  const [data, setData] = useState<PageData>({
    title: "",
    description: "",
    content: "",
  });

  useEffect(() => {
    if (page)
      setData({
        title: page.title ?? "",
        description: page.description ?? "",
        content: page.content ?? "",
      });
  }, [page]);


  const [savedState, setSavedState] = useState(
    page
      ? `Last saved at ${Intl.DateTimeFormat("en", { month: "short" }).format(
          new Date(page.updatedAt)
        )} ${Intl.DateTimeFormat("en", { day: "2-digit" }).format(
          new Date(page.updatedAt)
        )} ${Intl.DateTimeFormat("en", {
          hour: "numeric",
          minute: "numeric",
        }).format(new Date(page.updatedAt))}`
      : "Saving changes..."
  );

  const saveChanges = useCallback(
    async (data: PageData) => {
      setSavedState("Saving changes...");

      try {
        const response = await fetch("/api/page", {
          method: HttpMethod.PUT,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: page.id,
            title: data.title,
            description: data.description,
            content: data.content,
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
        } else {
          setSavedState("Failed to save.");
          toast.error("Failed to save");
        }
      } catch (error) {
        console.error(error);
      }
    },
    [page.id]
  );

  const [debouncedData] = useDebounce(data, 1000);
  useEffect(() => {
    if (debouncedData.title) saveChanges(debouncedData);
  }, [debouncedData, saveChanges]);

  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (data.title && data.description && data.content && !publishing)
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

  async function publish() {
    setPublishing(true);
    try {
      const response = await fetch(`/api/page`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: page.id || data?.id,
          title: data.title,
          description: data.description,
          content: data.content,
          published: true,
          subdomain: page?.site?.subdomain,
          customDomain: page?.site?.customDomain,
          slug: page?.slug,
        }),
      });

      if (response.ok) {
        mutate(`/api/page?pageId=${page?.id}`);
        router.push(
          `http://${page?.site?.subdomain}.${process.env.ROOT_DOMAIN}/${page?.slug}`
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-10 sm:px-20 h-full flex justify-between items-center">
        <div className="text-sm">
          <strong>
            <p>{page?.published ? "Published" : "Draft"}</p>
          </strong>
          <p>{savedState}</p>
        </div>
        <button
          onClick={async () => {
            await publish();
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
              : "bg-black hover:bg-white hover:text-black border-black"
          } mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
        >
          {publishing ? <LoadingDots /> : "Publish  →"}
        </button>
      </div>

      <GrapesjsReact onInit={onEditorInit} id='grapesjs-react'/>
    </>
  )
};