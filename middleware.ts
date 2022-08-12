import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/",
    "/([^/.]*)", // exclude `/public` files by matching all paths except for paths containing `.` (e.g. /logo.png)
    "/site/:path*",
    "/page/:path*",
    "/post/:path*",
    "/_sites/:path*",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = (req.headers.get("host") || "demo.localhost:3000").replace(":" + url.port, '')
  const ROOT_DOMAIN = process.env.ROOT_DOMAIN?.replace(":" + url.port, '')

  /*  You have to replace ".vercel.pub" with your own domain if you deploy this example under your domain.
      You can also use wildcard subdomains on .vercel.app links that are associated with your Vercel team slug
      in this case, our team slug is "platformize", thus *.platformize.vercel.app works. Do note that you'll
      still need to add "*.platformize.vercel.app" as a wildcard domain on your Vercel dashboard. */
  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname
          .replace(`.${ROOT_DOMAIN}`, "")
      : hostname.replace(`.localhost`, "");

  // rewrites for app pages
  if (currentHost == "app") {
    if (
      url.pathname === "/login" &&
      (req.cookies.get("next-auth.session-token") ||
        req.cookies.get("__Secure-next-auth.session-token"))
    ) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // rewrite for preview pages
  if ((currentHost.split('.')).includes('preview')) {
    // rewrite preview paths to `/_preview/[site] dynamic route
    const _currentHost = currentHost.replace("preview.", '');
    url.pathname = `/_preview/${_currentHost}${url.pathname}`;
    // url.searchParams.set('view','preview');
    return NextResponse.rewrite(url);
  }

  // rewrite root application to `/home` folder
  if (hostname ===  ROOT_DOMAIN) {
    url.pathname = `/home${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  // rewrite everything else to `/_sites/[site] dynamic route
  url.pathname = `/_sites/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(url);
}
