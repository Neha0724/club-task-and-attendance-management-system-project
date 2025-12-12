import './globals.css'

export const metadata = {
  title: 'GFG MEMBER NEXUS',
  description: 'Project Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono">{children}</body>
    </html>
  );
}