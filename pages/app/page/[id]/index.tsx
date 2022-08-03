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

import type { WithSitePage } from "@/types";

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
          <Builder page={page}></Builder>
        </div>
      </Layout>
    </>
  );
}
