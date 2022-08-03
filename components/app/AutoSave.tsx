
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { mutate } from "swr";
import { HttpMethod } from "@/types";
import LoadingDots from "@/components/app/loading-dots";
import toast from "react-hot-toast";
import type { WithSitePage } from "@/types";

interface PageData {
  title: string;
  description: string;
  content: string;
}

interface AutoSaveProps {
  page? : WithSitePage
}

export default function AutoSave (props: AutoSaveProps) {
  const [page, setPage] = useState<WithSitePage|undefined>(props.page);
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
            id: page?.id,
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
    [page?.id]
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
          id: page?.id,
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
        // mutate(`/api/page?pageId=${page?.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }
    return (
      // 
      // mx-auto px-10 sm:px-20 h-full flex justify-between items-center
      <>
        <div className="font-cal flex items-center space-x-2 text-gray-700 pl-5 sm:hover:text-black sm:hover:bg-white">
          {/* <div className="text-sm transition-all ease-in-out duration-150">
            <strong>
              <p>{page?.published ? "Published" : "Draft"}</p>
            </strong>
            <p>{savedState}</p>
          </div> */}
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
                : "bg-green-700 hover:bg-green-600 hover:text-white border-black hover:bg-green-700"
            } inline-flex items-center px-4 py-2 rounded-md shadow-sm text-medium font-thin text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {!publishing && page?.published &&
              <svg className="-ml-1 mr-2 h-5 w-5" x-description="Heroicon name: solid/check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            }

            {publishing ? <LoadingDots /> : "Publish"}
          </button>
        </div>
      </>
    )
}
