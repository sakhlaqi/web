import { useState, useEffect } from "react";
import Layout from "@/components/sites/Layout";
import Loader from "@/components/sites/Loader";
import {useSelector, useDispatch} from 'react-redux';

import type { GetStaticPaths, GetStaticProps } from "next";
import { _getStaticPaths, _getStaticProps } from '../../../../../utils/pages'
import type { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import type { AdjacentPage, Meta } from "@/types";

interface PathProps extends ParsedUrlQuery {
  site: string;
  slug: string;
  type: string;
}


import type { WithSitePage } from "@/types";
interface DataProps {
  data: WithSitePage;
}

export default function Page({
  data,
}: DataProps) {
  const router = useRouter();
  if (router.isFallback) return <Loader />;

  // const data = JSON.parse(stringifiedData) as _SiteSlugData & {
  //   mdxSource: MDXRemoteSerializeResult<Record<string, unknown>>;
  // };
  // const adjacentPages = JSON.parse(
  //   stringifiedAdjacentPage
  // ) as Array<AdjacentPage>;

  const meta = {
    description: data.description,
    logo: "/logo.png",
    ogImage: '',
    ogUrl: `https://${data.site?.subdomain}.${process.env.ROOT_DOMAIN}/${data.slug}`,
    title: data.title,
  } as Meta;
  return (
    <Layout meta={meta} subdomain={data.site?.subdomain ?? undefined}>
      <div dangerouslySetInnerHTML={{ __html: data.content || '' }} />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  return await _getStaticPaths();
};

export const getStaticProps: GetStaticProps<DataProps, PathProps> = async ({
  params
}) => {
  const data = await _getStaticProps(params)
  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
    revalidate: 3600,
  };
}
