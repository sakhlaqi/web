import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";

import Layout from "@/components/app/Layout";
import Loader from "@/components/app/Loader";
import Builder from "@/components/app/Builder";
import LoadingDots from "@/components/app/loading-dots";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";

import type { WithSitePage } from "@/types";

interface PageData {
  title: string;
  description: string;
  content: string;
}

export default function Page() {
  const router = useRouter();

  // TODO: Undefined check redirects to error
  const { id: pageId } = router.query;

  const { data: page, isValidating } = useSWR<WithSitePage>(
    router.isReady && `/api/page?pageId=${pageId}`,
    fetcher,
    {
      dedupingInterval: 1000,
      onError: () => router.push("/"),
      revalidateOnFocus: false,
    }
  );

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

  const [debouncedData] = useDebounce(data, 1000);

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
            id: pageId,
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
    [pageId]
  );

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
          id: pageId,
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
        mutate(`/api/page?pageId=${pageId}`);
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

  if (isValidating)
    return (
      <Layout>
        <Loader />
      </Layout>
    );

  return (
    <>
      <Layout siteId={page?.site?.id}>
        <div className="mx-auto">
          <Builder></Builder>
        </div>
        {/* <footer className="h-20 z-5 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
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
        </footer> */}
      </Layout>
    </>
  );
}
