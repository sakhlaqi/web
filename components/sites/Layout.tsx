import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

import type { Meta, WithChildren } from "@/types";

interface LayoutProps extends WithChildren {
  meta?: Meta;
  siteId?: string;
  subdomain?: string;
  view?: string;
}

export default function Layout({ meta, children, subdomain, view }: LayoutProps) {

  // const [scrolled, setScrolled] = useState(false);

  // const onScroll = useCallback(() => {
  //   setScrolled(window.pageYOffset > 20);
  // }, []);

  // useEffect(() => {
  //   window.addEventListener("scroll", onScroll);
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, [onScroll]);

  // const [closeModal, setCloseModal] = useState<boolean>(
  //   !!Cookies.get("closeModal")
  // );

  // useEffect(() => {
  //   if (closeModal) {
  //     Cookies.set("closeModal", "true");
  //   } else {
  //     Cookies.remove("closeModal");
  //   }
  // }, [closeModal]);
  
  return (
    <div>
      <Head>
        <title>{meta?.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href={meta?.logo} />
        <link rel="apple-touch-icon" sizes="180x180" href={meta?.logo} />
        <meta name="theme-color" content="#7b46f6" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta itemProp="name" content={meta?.title} />
        <meta itemProp="description" content={meta?.description} />
        <meta itemProp="image" content={meta?.ogImage} />
        <meta name="description" content={meta?.description} />
        <meta property="og:title" content={meta?.title} />
        <meta property="og:description" content={meta?.description} />
        <meta property="og:url" content={meta?.ogUrl} />
        <meta property="og:image" content={meta?.ogImage} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Vercel" />
        <meta name="twitter:creator" content="@StevenTey" />
        <meta name="twitter:title" content={meta?.title} />
        <meta name="twitter:description" content={meta?.description} />
        <meta name="twitter:image" content={meta?.ogImage} />
        {view && view == "preview" && <meta name="robots" content="noindex" />}
      </Head>
      {children}
    </div>
  );
}
