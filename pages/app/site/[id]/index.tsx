import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import BlurImage from "@/components/BlurImage";
import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";

import type { Page, Site } from "@prisma/client";

interface SitePageData {
  pages: Array<Page>;
  site: Site | null;
}

export default function SiteIndex() {
  const [creatingPage, setCreatingPage] = useState(false);

  const router = useRouter();
  const { id: siteId } = router.query;

  const { data } = useSWR<SitePageData>(
    siteId && `/api/page?siteId=${siteId}`,
    fetcher,
    {
      onSuccess: (data) => !data?.site && router.push("/"),
    }
  );

  async function createPage(siteId: string) {
    try {
      const res = await fetch(`/api/page?siteId=${siteId}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/page/${data.pageId}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Layout>
      <div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
        Dashboard
      </div>
    </Layout>
  );
}
