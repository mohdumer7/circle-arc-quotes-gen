import './globals.css'

export const metadata = {
  title: 'Quote Generator - Business Quote & Purchase Order Management',
  description: 'A comprehensive business application for managing quotes, companies, and purchase orders with PDF export capabilities.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}