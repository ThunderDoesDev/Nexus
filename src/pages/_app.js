import "@/styles/globals.css";
import App from "next/app";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SiteUrlProvider } from "@/context/SiteUrlContext";
import { resolveSiteUrl } from "@/lib/siteUrl";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export default function MyApp({ Component, pageProps, siteUrl }) {
  return (
    <SiteUrlProvider value={siteUrl}>
      <ThemeProvider>
        <AuthProvider>
          <div className={`${manrope.variable} ${spaceGrotesk.variable}`}>
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </SiteUrlProvider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return {
    ...appProps,
    siteUrl: resolveSiteUrl(appContext.ctx?.req),
  };
};
