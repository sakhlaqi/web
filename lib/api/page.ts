import prisma from "@/lib/prisma";

import type { NextApiRequest, NextApiResponse } from "next";
import type { Page, Site } from ".prisma/client";
import type { Session } from "next-auth";
import { revalidate } from "@/lib/revalidate";

import type { WithSitePage } from "@/types";

interface AllPages {
  pages: Array<Page>;
  site: Site | null;
}

/**
 * Get Page
 *
 * Fetches & returns either a single or all pages available depending on
 * whether a `pageId` query parameter is provided. If not all pages are
 * returned in descending order.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getPage(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<AllPages | (WithSitePage | null)>> {
  const { pageId, siteId, published } = req.query;

  if (
    Array.isArray(pageId) ||
    Array.isArray(siteId) ||
    Array.isArray(published)
  )
    return res.status(400).end("Bad request. Query parameters are not valid.");

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID");

  try {
    if (pageId) {
      const page = await prisma.page.findFirst({
        where: {
          id: pageId,
          site: {
            user: {
              id: session.user.id,
            },
          },
        },
        include: {
          site: true,
        },
      });

      return res.status(200).json(page);
    }

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        user: {
          id: session.user.id,
        },
      },
    });

    const pages = !site
      ? []
      : await prisma.page.findMany({
          where: {
            site: {
              id: siteId,
            },
            published: JSON.parse(published || "true"),
          },
          orderBy: {
            createdAt: "desc",
          },
        });

    return res.status(200).json({
      pages,
      site,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Page
 *
 * Creates a new page from a provided `siteId` query parameter.
 *
 * Once created, the sites new `pageId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createPage(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<{
  pageId: string;
}>> {
  const { siteId } = req.query;

  if (Array.isArray(siteId))
    return res
      .status(400)
      .end("Bad request. siteId parameter cannot be an array.");

  try {
    const response = await prisma.page.create({
      data: {
        site: {
          connect: {
            id: siteId,
          },
        },
      },
    });

    return res.status(201).json({
      pageId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Page
 *
 * Deletes a page from the database using a provided `pageId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deletePage(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse> {
  const { pageId } = req.query;

  if (Array.isArray(pageId))
    return res
      .status(400)
      .end("Bad request. pageId parameter cannot be an array.");

  try {
    const response = await prisma.page.delete({
      where: {
        id: pageId,
      },
      include: {
        site: {
          select: { subdomain: true, customDomain: true },
        },
      },
    });
    if (response?.site?.subdomain) {
      // revalidate for subdomain
      await revalidate(
        `https://${response.site?.subdomain}.${process.env.ROOT_DOMAIN}`, // hostname to be revalidated
        response.site.subdomain, // siteId
        response.slug // slugname for the page
      );
    }
    if (response?.site?.customDomain)
      // revalidate for custom domain
      await revalidate(
        `https://${response.site.customDomain}`, // hostname to be revalidated
        response.site.customDomain, // siteId
        response.slug // slugname for the page
      );

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update Page
 *
 * Updates a page & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - description
 *  - content
 *  - slug
 *  - image
 *  - imageBlurhash
 *  - published
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updatePage(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<Page>> {
  const {
    id,
    title,
    description,
    content,
    data,
    slug,
    image,
    imageBlurhash,
    published,
    publishedAt,
    subdomain,
    customDomain,
  } = req.body;

  try {
    const page = await prisma.page.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        content,
        data,
        slug,
        published,
      },
    });
    if (subdomain) {
      // revalidate for subdomain
      await revalidate(
        `http://${subdomain}.${process.env.ROOT_DOMAIN}`, // hostname to be revalidated
        subdomain, // siteId
        slug // slugname for the page
      );
    }
    if (customDomain)
      // revalidate for custom domain
      await revalidate(
        `http://${customDomain}`, // hostname to be revalidated
        customDomain, // siteId
        slug // slugname for the page
      );

    return res.status(200).json(page);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
