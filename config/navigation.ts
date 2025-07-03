import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  UserCheck,
  ClipboardList,
  Briefcase,
  CalendarDays,
  User,
  Palmtree,
} from "lucide-react"
import type { NavigationSection } from "@/types/navigation"

export const navigationConfig: NavigationSection[] = [
  {
    title: "Principal",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Calendário",
        href: "/calendario",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Eventos",
    items: [
      {
        name: "Meus Eventos",
        href: "/eventos",
        icon: ClipboardList,
      },
      {
        name: "Solicitar Evento",
        href: "/eventos/novo",
        icon: CalendarDays,
      },
      {
        name: "Férias",
        href: "/ferias",
        icon: Palmtree,
      },
      {
        name: "Aprovações",
        href: "/aprovacoes",
        icon: UserCheck,
        requireGestor: true,
      },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        name: "Usuários",
        href: "/usuarios",
        icon: Users,
        children: [
          {
            name: "Listar Usuários",
            href: "/usuarios",
            icon: Users,
          },
          {
            name: "Novo Usuário",
            href: "/usuarios/novo",
            icon: Users,
            requiredUserType: "rh",
          },
        ],
      },
      {
        name: "Grupos",
        href: "/grupos",
        icon: Building2,
        requiredUserType: "rh",
        children: [
          {
            name: "Listar Grupos",
            href: "/grupos",
            icon: Building2,
          },
          {
            name: "Novo Grupo",
            href: "/grupos/novo",
            icon: Building2,
          },
        ],
      },
      {
        name: "Empresa",
        href: "/empresa",
        icon: Briefcase,
        requiredUserType: "rh",
      },
    ],
  },
  {
    title: "Conta",
    items: [
      {
        name: "Meu Perfil",
        href: "/perfil",
        icon: User,
      },
    ],
  },
]
