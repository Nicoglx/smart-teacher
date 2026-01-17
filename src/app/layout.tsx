import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Teacher - Tu profesor de inglés con IA",
  description: "Practica tu inglés hablado y recibe correcciones personalizadas con inteligencia artificial",
  keywords: ["inglés", "aprender inglés", "práctica oral", "IA", "profesor virtual"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
