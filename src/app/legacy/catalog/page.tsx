import { redirect } from 'next/navigation'

export default function LegacyCatalogPage() {
  // Redirect to the new shop page
  redirect('/shop')
}
