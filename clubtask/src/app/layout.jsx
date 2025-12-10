import './globals.css'

export const metadata = {
  title: 'GFG Club Management System',
  description: 'Project Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono">{children}</body>
    </html>
  );
}