import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import QueryProvider from "@/providers/queryProvider";
import { Toaster } from "sonner"

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const poppins = Poppins({
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  style: ["normal", "italic"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Irembo Services",
  description: "e-government/irembo services/irembo agents",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", poppins.variable, poppins.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col ">
        <QueryProvider>
            {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
