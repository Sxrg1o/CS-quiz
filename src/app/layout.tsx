import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "POSCOMP Quiz",
  description: "Herramienta para practicar para el examen POSCOMP",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} dark bg-gray-950`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
