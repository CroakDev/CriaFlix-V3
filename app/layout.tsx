// app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import AppProviders from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Meu Site",
  description: "Descrição do meu site",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster />
      </body>
    </html>
  )
}
