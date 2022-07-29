import type { Page, Post, Site, User } from "@prisma/client";

export interface AdjacentPost
  extends Pick<
    Post,
    "createdAt" | "description" | "image" | "imageBlurhash" | "slug" | "title"
  > {}

  export interface AdjacentPage
  extends Pick<
    Page,
    "createdAt" | "description" | "slug" | "title"
  > {}

export interface _SiteData extends Site {
  user: User | null;
  posts: Array<Post>;
  pages: Array<Page>;
}

export interface _SiteSlugData extends Page {
  site: _SiteSite | null;
}

interface _SiteSite extends Site {
  user: User | null;
}
