import { useRouter } from "next/router";
import Layout from "@/components/sites/Layout";
import Loader from "@/components/sites/Loader";
import type { Meta, _SiteSlugData } from "@/types";
import type { GetStaticPaths, GetStaticProps } from "next";
import { _getStaticPaths, _getStaticProps } from '../../../utils/pages'
import type { ParsedUrlQuery } from "querystring";

interface PathProps extends ParsedUrlQuery {
  site: string;
  slug: string;
  type: string;
}

import type { WithSitePage } from "@/types";
interface PageProps {
  data: WithSitePage;
}

export default function Page({
  data,
}: PageProps) {
  const router = useRouter();
  if (router.isFallback) return <Loader />;

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

export const getStaticProps: GetStaticProps<PageProps, PathProps> = async ({
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