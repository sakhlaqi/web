import remarkMdx from "remark-mdx";
import { MDXRemote } from "next-mdx-remote";
import { remark } from "remark";
import { serialize } from "next-mdx-remote/serialize";
import { useRouter } from "next/router";

import BlogCard from "@/components/BlogCard";
import BlurImage from "@/components/BlurImage";
import Date from "@/components/Date";
import Examples from "@/components/mdx/Examples";
import Layout from "@/components/sites/Layout";
import Loader from "@/components/sites/Loader";
import prisma from "@/lib/prisma";
import Tweet from "@/components/mdx/Tweet";
import {
  replaceExamples,
  replaceLinks,
  replaceTweets,
} from "@/lib/remark-plugins";

import type { AdjacentPage, Meta, _SiteSlugData } from "@/types";
import type { GetStaticPaths, GetStaticProps } from "next";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { ParsedUrlQuery } from "querystring";

const components = {
  a: replaceLinks,
  BlurImage,
  Examples,
  Tweet,
};

interface PathProps extends ParsedUrlQuery {
  site: string;
  slug: string;
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
  console.log(data);
  return (
    <Layout meta={meta} subdomain={data.site?.subdomain ?? undefined}>
      {data.content || ''}
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const pages = await prisma.page.findMany({
    where: {
      published: true,
      // you can remove this if you want to generate all sites at build time
      site: {
        subdomain: "salman",
      },
    },
    select: {
      slug: true,
      site: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  return {
    paths: pages.flatMap((page) => {
      if (page.site === null || page.site.subdomain === null) return [];

      if (page.site.customDomain) {
        return [
          {
            params: {
              site: page.site.customDomain,
              slug: page.slug,
            },
          },
          {
            params: {
              site: page.site.subdomain,
              slug: page.slug,
            },
          },
        ];
      } else {
        return {
          params: {
            site: page.site.subdomain,
            slug: page.slug,
          },
        };
      }
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PageProps, PathProps> = async ({
  params,
}) => {
  console.log('params',params);
  if (!params) throw new Error("No path parameters found");

  const { site, slug } = params;

  let filter: {
    subdomain?: string;
    customDomain?: string;
  } = {
    subdomain: site,
  };

  if (site.includes(".")) {
    filter = {
      customDomain: site,
    };
  }

  const data = (await prisma.page.findFirst({
    where: {
      site: {
        ...filter,
      },
      slug,
    },
    include: {
      site: {
        include: {
          user: true,
        },
      },
    },
  })) as _SiteSlugData | null;

  if (!data) return { notFound: true, revalidate: 10 };

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
    revalidate: 3600,
  };
};
