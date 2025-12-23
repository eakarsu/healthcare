import { PublicHeader } from '@/components/marketing/PublicHeader'
import { PublicFooter } from '@/components/marketing/PublicFooter'
import { OrganizationJsonLd, SoftwareApplicationJsonLd, WebsiteJsonLd } from '@/components/marketing/JsonLd'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <WebsiteJsonLd />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
