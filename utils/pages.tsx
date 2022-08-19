import prisma from "@/lib/prisma";
import type { ParsedUrlQuery } from "querystring";
import type { _SiteSlugData } from "@/types";

interface PathProps extends ParsedUrlQuery {
    site: string;
    slug: string;
}

export const _getStaticPaths = async () => {
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
  
export const _getStaticProps = async (
    params:PathProps|undefined
  ) => {
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

    return data;
};
  