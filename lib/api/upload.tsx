import cuid from "cuid";
import prisma from "@/lib/prisma";

import type { NextApiRequest, NextApiResponse } from "next";
import type { Site } from ".prisma/client";
import type { Session } from "next-auth";

/**
 * Upload File
 *
 * Upload new site from a set of provided query parameters.
 * These include:
 *  - name
 *  - description
 *  - subdomain
 *  - userId
 *
 * Once created, the sites new `siteId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function uploadFile(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  siteId: string;
}>> {
    const { siteId } = req.query;

    if (Array.isArray(siteId))
        return res
        .status(400)
        .end("Bad request. siteId parameter cannot be an array.");

    if (!session.user.id)
        return res.status(500).end("Server failed to get session user ID");

        

  try {

    return res.status(201).json({
    //   siteId: response.id,
    siteId : siteId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
