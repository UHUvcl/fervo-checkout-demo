import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "FERVO | Cardapio e encomendas",
  description:
    "Cardapio FERVO para retomada focada em chas gelados de 300 ml.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FBF7EF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <div className="bg-fervo-green p-3 text-center text-white">DEMONSTRACAO • Dados ficticios • Sem transacoes reais — <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/gestor/`}>Explorar gestor</a></div>{children}
      </body>
    </html>
  );
}
