"use client"

import { RouteGuard } from "@/components/auth/route-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/contexts/auth-context"
import CalendarioComponent from "./calendario-component"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CalendarioPage() {
  const { user } = useAuth()

  return (
    <RouteGuard>
      <AppLayout 
        title="Calendário" 
        subtitle="Visualize eventos, férias e ausências no calendário"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/eventos/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Link>
            </Button>
          </div>
          
          <CalendarioComponent />
        </div>
      </AppLayout>
    </RouteGuard>
  )
} 