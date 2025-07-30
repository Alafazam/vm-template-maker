import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Template Automation</title>
        <meta name="description" content="Modern template automation platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp; 