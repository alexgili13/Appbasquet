import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repositori d'Exercicis | Club de Bàsquet",
  description: "Repositori intern d'exercicis d'entrenament del club",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
