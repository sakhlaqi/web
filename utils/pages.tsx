import prisma from "@/lib/prisma";
import type { ParsedUrlQuery } from "querystring";
import type { _SiteSlugData } from "@/types";

interface PathProps extends ParsedUrlQuery {
    site: string;
    slug: string;
    type: string;
}

export const _getStaticPaths = async () => {
    const rows = await prisma.page.findMany({
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
      paths: rows.flatMap((row) => {
        if (row.site === null || row.site.subdomain === null) return [];
  
        if (row.site.customDomain) {
          return [
            {
              params: {
                site: row.site.customDomain,
                slug: row.slug,
                type: row.type,
              },
            },
            {
              params: {
                site: row.site.subdomain,
                slug: row.slug,
                type: row.type,
              },
            },
          ];
        } else {
          return {
            params: {
              site: row.site.subdomain,
              slug: row.slug,
              type: row.type,
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
  
    const { site } = params;

    const slug = params.type && ! params.slug ? params.type : params.slug
    const type = params.slug && params.type || undefined
  
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

    let _filter = {
      where: {
        site: {
          ...filter,
        },
        type,
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
  
    const data = (await prisma.page.findFirst(_filter)) as _SiteSlugData | null;
  
    if (!data) return { notFound: true, revalidate: 10 };

    return data;
};
  