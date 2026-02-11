import "./styles.css";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";

const berlingskeSans = localFont({
  src: [
    {
      path: "../../public/fonts/BerlingskeSans.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/BerlingskeSansBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-berlingske-sans",
  display: "swap",
});

const berlingskeSerif = localFont({
  src: [
    {
      path: "../../public/fonts/BerlingskeSerif.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-berlingske-serif",
  display: "swap",
});

export const metadata = {
  title: "Kontaktar - Service Marketplace",
  description: "Connect with professional service providers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${berlingskeSans.variable} ${berlingskeSerif.variable}`}
      >
        <body className={berlingskeSans.className}>
          <NextTopLoader color="#b91c1c" height={3} showSpinner={false} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
