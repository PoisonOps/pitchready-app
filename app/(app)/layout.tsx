import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Nav } from '@/components/nav'
import { ToastProvider } from '@/components/toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user?.id ?? '')
    .single()

  return (
    <ToastProvider>
      <div className="app-shell">
        <Header name={profile?.name} />
        <main>{children}</main>
      </div>
      <Nav />
    </ToastProvider>
  )
}
