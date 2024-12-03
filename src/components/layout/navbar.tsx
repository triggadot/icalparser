'use client'

import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function Navbar() {
  const { user, signOut, isLoading } = useSupabase()
  const router = useRouter()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex-1">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="font-bold text-xl"
          >
            Calendar App
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="outline"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => router.push('/auth')}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
} 