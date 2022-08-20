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
// import { _getStaticPaths, _getStaticProps } from '../../../../utils/pages'
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
  type: string;
}

import type { WithSitePage } from "@/types";
interface PageProps {
  data: WithSitePage;
}

export default function Page({
  data,
}: PageProps) {
  console.log('data',data);
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
  const pages = await prisma.page.findMany({
    where: {
      published: true,
      // you can remove this if you want to generate all sites at build time
      // site: {
      //   subdomain: "salman",
      // },
    },
    select: {
      slug: true,
      type: true,
      site: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  return {
    paths: pages.flatMap((data) => {
      // console.log('data', data);
      if (data.site === null || data.site.subdomain === null) return [];

      if (data.site.customDomain) {
        return [
          {
            params: {
              site: data.site.customDomain,
              slug: data.slug,
              type: data.type || '',
            },
          },
          {
            params: {
              site: data.site.subdomain,
              slug: data.slug,
              type: data.type || '',
            },
          },
        ];
      } else {
        return {
          params: {
            site: data.site.subdomain,
            slug: data.slug,
            type: data.type || '',
          },
        };
      }
    }),
    fallback: true,
  };
};


export const getStaticProps: GetStaticProps<PageProps, PathProps> = async (
  params
) => {

  if (!params) throw new Error("No path parameters found");

  
  //params.slug = params.type;
  const { site, slug, type } = params;
  

  // console.log('params',site, type, slug);

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

  const _filter = {
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
  }

  // console.log('_filter', _filter);

  const data = (await prisma.page.findFirst()) as _SiteSlugData | null;

  console.log('data', data);

  // if (!data) return { notFound: true, revalidate: 10 };

  return data;
};














// export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
//   return await _getStaticPaths();
// };

// export const getStaticProps: GetStaticProps<PageProps, PathProps> = async ({
//   params
// }) => {
//   const data = await _getStaticProps(params)
//   return {
//     props: {
//       data: JSON.parse(JSON.stringify(data)),
//     },
//     revalidate: 3600,
//   };
// };