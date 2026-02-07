export const metadata = {
  title: 'VIVL',
  description: 'VIVL Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
