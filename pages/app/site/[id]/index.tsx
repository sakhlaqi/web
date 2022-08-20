import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import BlurImage from "@/components/BlurImage";
import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";

import type { Site } from "@prisma/client";

export default function SiteIndex() {

  const router = useRouter();
  const { id: siteId } = router.query;

  return (
    <Layout>
      <div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
        Dashboard
      </div>
    </Layout>
  );
}
