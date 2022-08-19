import prisma from "@/lib/prisma";
import type { ParsedUrlQuery } from "querystring";
import type { _SiteSlugData } from "@/types";

interface PathProps extends ParsedUrlQuery {
    site: string;
    slug: string;
}

export const _getStaticPaths = async () => {
    const data = await prisma.post.findMany({
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
      paths: data.flatMap((row) => {
        if (row.site === null || row.site.subdomain === null) return [];
  
        if (row.site.customDomain) {
          return [
            {
              params: {
                site: row.site.customDomain,
                slug: row.slug,
              },
            },
            {
              params: {
                site: row.site.subdomain,
                slug: row.slug,
              },
            },
          ];
        } else {
          return {
            params: {
              site: row.site.subdomain,
              slug: row.slug,
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
  
    const data = (await prisma.post.findFirst({
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
  