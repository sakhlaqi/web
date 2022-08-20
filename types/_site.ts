import type { Page, Site, User } from "@prisma/client";
  export interface AdjacentPage
  extends Pick<
    Page,
    "createdAt" | "description" | "slug" | "title"
  > {}

export interface _SiteData extends Site {
  user: User | null;
  pages: Array<Page>;
}

export interface _SiteSlugData extends Page {
  site: _SiteSite | null;
}

interface _SiteSite extends Site {
  user: User | null;
}
