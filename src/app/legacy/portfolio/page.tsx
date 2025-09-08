import { redirect } from 'next/navigation'

export default function LegacyPortfolioPage() {
  // Redirect to the new gallery page
  redirect('/gallery')
}
