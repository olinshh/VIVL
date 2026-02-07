import MenuShell from './components/MenuShell'

export const metadata = {
  title: 'VIVL — Real-Time Fraud Intelligence',
  description: 'AI-powered transaction monitoring platform with explainable risk scoring and automated case generation for fraud prevention.',
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
