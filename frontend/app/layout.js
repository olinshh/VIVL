import MenuShell from './components/MenuShell'

export const metadata = {
  title: 'VIVL',
  description: 'VIVL Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ height: '100%', overflow: 'hidden' }}>
      <body suppressHydrationWarning style={{ height: '100%', overflow: 'hidden' }}>
        <MenuShell>{children}</MenuShell>
      </body>
    </html>
  )
}
