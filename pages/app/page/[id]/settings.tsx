import toast, { Toaster } from "react-hot-toast";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import Layout from "@/components/app/Layout";
import Loader from "@/components/app/Loader";
import LoadingDots from "@/components/app/loading-dots";
import Modal from "@/components/Modal";
import saveImage from "@/lib/save-image";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";

import type { ChangeEvent } from "react";

import type { WithSitePage } from "@/types";

interface SettingsData {
  slug: string;
  id: string;
}

export default function PageSettings() {
  const router = useRouter();

  // TODO: Undefined check redirects to error
  const { id: pageId } = router.query;

  const { data: settings, isValidating } = useSWR<WithSitePage>(
    `/api/page?pageId=${pageId}`,
    fetcher,
    {
      onError: () => router.push("/"),
      revalidateOnFocus: false,
    }
  );

  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPage, setDeletingPage] = useState(false);

  const [data, setData] = useState<SettingsData>({
    slug: settings?.slug ?? "",
    id: settings?.id ?? "",
  });

  useEffect(() => {
    if (settings)
      setData({
        slug: settings.slug,
        id: settings.id,
      });
  }, [settings]);

  async function savePageSettings(data: SettingsData) {
    setSaving(true);

    try {
      const response = await fetch("/api/page", {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: pageId,
          slug: data.slug,
          subdomain: settings?.site?.subdomain,
          customDomain: settings?.site?.customDomain,
        }),
      });

      if (response.ok) toast.success(`Changes Saved`);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function deletePage(pageId: string) {
    setDeletingPage(true);
    try {
      const response = await fetch(`/api/page?pageId=${pageId}`, {
        method: HttpMethod.DELETE,
      });

      if (response.ok) {
        router.push(`/site/${settings?.site?.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingPage(false);
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
      <Layout siteId={settings?.site?.id}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 10000,
          }}
        />
        <div className="max-w-screen-xl mx-auto px-10 sm:px-20 mt-20 mb-16">
          <h1 className="font-cal text-5xl mb-12">Page Settings</h1>
          <div className="mb-28 flex flex-col space-y-12">
            <div className="space-y-6">
              <h2 className="font-cal text-2xl">Page Slug</h2>
              <div className="border border-gray-700 rounded-lg flex items-center max-w-lg">
                <span className="px-5 font-cal rounded-l-lg border-r border-gray-600 whitespace-nowrap">
                  {settings?.site?.subdomain}.${process.env.ROOT_DOMAIN}/
                </span>
                <input
                  className="w-full px-5 py-3 font-cal text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none rounded-r-lg placeholder-gray-400"
                  type="text"
                  name="slug"
                  placeholder="page-slug"
                  value={data?.slug}
                  onInput={(e: ChangeEvent<HTMLInputElement>) =>
                    setData((data) => ({ ...data, slug: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="font-cal text-2xl">Thumbnail Image</h2>

              <div className="w-full h-10" />
              <div className="flex flex-col space-y-6 max-w-lg">
                <h2 className="font-cal text-2xl">Delete Page</h2>
                <p>
                  Permanently delete your page and all of its contents from our
                  platform. This action is not reversible – please continue with
                  caution.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-500 text-white border-red-500 hover:text-red-500 hover:bg-white px-5 py-3 max-w-max font-cal border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150"
                >
                  Delete Page
                </button>
              </div>
            </div>
          </div>
        </div>
        <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await deletePage(pageId as string);
            }}
            className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded-lg"
          >
            <h2 className="font-cal text-2xl mb-6">Delete Page</h2>
            <div className="grid gap-y-5 w-5/6 mx-auto">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete your page? This action is not
                reversible.
              </p>
            </div>
            <div className="flex justify-between items-center mt-10 w-full">
              <button
                type="button"
                className="w-full px-5 py-5 text-sm text-gray-400 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-150"
                onClick={() => setShowDeleteModal(false)}
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={deletingPage}
                className={`${
                  deletingPage
                    ? "cursor-not-allowed text-gray-400 bg-gray-50"
                    : "bg-white text-gray-600 hover:text-black"
                } w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
              >
                {deletingPage ? <LoadingDots /> : "DELETE POST"}
              </button>
            </div>
          </form>
        </Modal>
        <footer className="h-20 z-20 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
          <div className="max-w-screen-xl mx-auto px-10 sm:px-20 h-full flex justify-end items-center">
            <button
              onClick={() => {
                savePageSettings(data);
              }}
              disabled={saving}
              className={`${
                saving
                  ? "cursor-not-allowed bg-gray-300 border-gray-300"
                  : "bg-black hover:bg-white hover:text-black border-black"
              } mx-2 w-36 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
            >
              {saving ? <LoadingDots /> : "Save Changes"}
            </button>
          </div>
        </footer>
      </Layout>
    </>
  );
}
