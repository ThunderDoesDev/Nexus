import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Nexus Permissions Calculator</title>
        <meta name="robots" content="all" />
        <meta name="description" content="Calculate Discord bot permissions easily with Nexus Permissions Calculator. Generate invite links and manage scopes for your Discord bot." />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#6c47ff" />
        <meta httpEquiv="content-language" content="en" />
        <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
        <meta property="og:title" content="Nexus Permissions Calculator" />
        <meta property="og:description" content="Calculate Discord bot permissions easily with Nexus Permissions Calculator. Generate invite links and manage scopes for your Discord bot." />
        <meta property="og:url" content="https://thunderdoesdev.gg/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/favicon.ico" />
        <meta property="og:image:width" content="80" />
        <meta property="og:image:height" content="80" />
        <meta name="keywords" content="discord, bot, permissions, calculator, nexus" />
        <meta name="author" content="ThunderDoesDev" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="twitter:title" content="Nexus Permissions Calculator" />
        <meta name="twitter:description" content="Calculate Discord bot permissions easily with Nexus Permissions Calculator." />
        <meta name="twitter:image" content="/favicon.ico" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="subject" content="Discord bot permissions calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Nexus Permissions Calculator",
            description: "Calculate Discord bot permissions easily with Nexus Permissions Calculator. Generate invite links and manage scopes for your Discord bot.",
          })}
        </script>
      </Head>
      <Component {...pageProps} />
    </>
  );
}


