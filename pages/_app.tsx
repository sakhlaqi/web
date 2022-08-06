import React, {FC} from 'react';
import PlausibleProvider from "next-plausible";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import {wrapper} from '../store';

import "@/styles/globals.css";

const WrappedApp: FC<AppProps> = ({
  Component, 
  pageProps: { session, ...pageProps },
}) => {
  return (
    <PlausibleProvider domain={process.env.ROOT_DOMAIN||""}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </PlausibleProvider>
  );
};

export default wrapper.withRedux(WrappedApp);
