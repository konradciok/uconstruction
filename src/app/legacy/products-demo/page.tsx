import { redirect } from 'next/navigation'

export default function LegacyProductsDemoPage() {
  // Redirect to the new shop page
  redirect('/shop')
}
