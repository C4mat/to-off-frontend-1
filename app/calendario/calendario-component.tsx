"use client"

import React, { useState, useEffect } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "moment/locale/pt-br"
import "react-big-calendar/lib/css/react-big-calendar.css"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

// Configurar localização para português
moment.locale("pt-br")
const localizer = momentLocalizer(moment)

// Mensagens em português
const messages = {
  today: "hoje",
  previous: "anterior",
  next: "próximo",
  month: "mês",
  week: "semana",
  day: "dia",
  agenda: "agenda",
  date: "data",
  time: "hora",
  event: "evento",
  allDay: "dia inteiro",
  noEventsInRange: "Nenhum evento neste período",
}

// Cores para diferentes tipos de eventos
const COLORS = {
  aprovado: "#4CAF50",    // Verde
  pendente: "#FFC107",    // Amarelo
  rejeitado: "#F44336",   // Vermelho
  feriado_nacional: "#E53935", // Vermelho escuro
  feriado_estadual: "#FB8C00", // Laranja
  ferias: "#4CAF50",      // Verde
  assiduidade: "#FF9800", // Laranja
  plantao: "#2196F3",     // Azul
  licenca_maternidade: "#E91E63", // Rosa
  licenca_paternidade: "#E91E63", // Rosa
  evento_especial: "#9C27B0", // Roxo
  licenca_geral: "#607D8B", // Cinza
  outros: "#795548",      // Marrom
}

export default function CalendarioComponent() {
  const { user } = useAuth()
  
  const [events, setEvents] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"todos" | "aprovados">("todos")
  const [viewType, setViewType] = useState(Views.MONTH)
  
  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // 1. Buscar eventos do calendário
        const apenasAprovados = viewMode === "aprovados"
        let eventosResponse;
        
        console.log("Buscando eventos para usuário:", user?.tipo_usuario, user?.flag_gestor, user?.grupo_id)
        
        if (user?.tipo_usuario === "rh") {
          // RH vê todos os eventos
          eventosResponse = await apiClient.getCalendario(apenasAprovados)
        } else if (user?.flag_gestor === "S" && user?.grupo_id) {
          // Gestores veem eventos de seu grupo
          eventosResponse = await apiClient.getCalendarioGrupo(user.grupo_id, apenasAprovados)
        } else {
          // Usuários comuns veem apenas seus próprios eventos
          eventosResponse = await apiClient.getCalendario(apenasAprovados)
        }
        
        console.log("Resposta eventos:", eventosResponse)
        
        if (eventosResponse.error) {
          throw new Error(`Erro ao buscar eventos: ${eventosResponse.error}`)
        }
        
        // Processar eventos do calendário
        let eventosCalendario: any[] = []
        
        // A API pode retornar eventos diretamente ou dentro de uma propriedade 'eventos'
        const eventosData = Array.isArray(eventosResponse.data) 
          ? eventosResponse.data 
          : (eventosResponse.data?.eventos || [])
        
        console.log("Dados dos eventos:", eventosData)
        
        if (eventosData && eventosData.length > 0) {
          eventosCalendario = eventosData.map(formatEvent)
        }
        
        // 2. Buscar feriados nacionais
        console.log("Buscando feriados nacionais")
        const feriadosNacionaisResponse = await apiClient.getFeriadosNacionais()
        console.log("Resposta feriados nacionais:", feriadosNacionaisResponse)
        
        if (!feriadosNacionaisResponse.error && Array.isArray(feriadosNacionaisResponse.data)) {
          const feriadosNacionais = feriadosNacionaisResponse.data.map(feriado => 
            formatFeriado(feriado, true)
          )
          
          eventosCalendario = [...eventosCalendario, ...feriadosNacionais]
        }
        
        // 3. Buscar feriados estaduais se o usuário tiver UF
        if (user?.UF) {
          console.log("Buscando feriados estaduais para UF:", user.UF)
          const feriadosEstaduaisResponse = await apiClient.getFeriadosEstaduais(user.UF)
          console.log("Resposta feriados estaduais:", feriadosEstaduaisResponse)
          
          if (!feriadosEstaduaisResponse.error && Array.isArray(feriadosEstaduaisResponse.data)) {
            const feriadosEstaduais = feriadosEstaduaisResponse.data.map(feriado => 
              formatFeriado(feriado, false)
            )
            
            eventosCalendario = [...eventosCalendario, ...feriadosEstaduais]
          }
        }
        
        console.log("Eventos formatados para calendário:", eventosCalendario)
        setEvents(eventosCalendario)
      } catch (error) {
        console.error("Erro detalhado ao carregar dados do calendário:", error)
        setError("Ocorreu um erro ao carregar o calendário. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCalendarData()
  }, [viewMode, user])
  
  // Formatar evento para o calendário
  const formatEvent = (evento: any) => {
    console.log("Formatando evento:", evento)
    
    // Garantir que as datas são objetos Date
    const start = new Date(evento.start)
    let end = new Date(evento.end || evento.start)
    
    // Para eventos de dia inteiro, adicionar um dia ao final para visualização correta
    if (evento.allDay !== false) {
      end.setDate(end.getDate() + 1)
    }
    
    // Determinar cor baseada no status ou tipo
    let color = evento.color || evento.backgroundColor || COLORS.outros
    
    // Se tiver status, usar a cor do status
    if (evento.extendedProps?.status && COLORS[evento.extendedProps.status as keyof typeof COLORS]) {
      color = COLORS[evento.extendedProps.status as keyof typeof COLORS]
    }
    
    // Criar um título significativo baseado nos dados disponíveis
    const tipoAusencia = evento.extendedProps?.tipo_ausencia || '';
    const usuarioNome = evento.extendedProps?.usuario_nome || '';
    
    // Verificar se já tem título no evento ou criar um baseado nos dados disponíveis
    let title = evento.title;
    if (!title || title === 'Desconhecido') {
      if (tipoAusencia && usuarioNome) {
        title = `${tipoAusencia} - ${usuarioNome}`;
      } else if (tipoAusencia) {
        title = tipoAusencia;
      } else if (usuarioNome) {
        title = `Evento - ${usuarioNome}`;
      } else {
        title = "Evento";
      }
    }
    
    // Se tiver tipo de ausência, verificar se tem uma cor específica
    if (tipoAusencia) {
      const tipoLower = tipoAusencia.toLowerCase()
      
      if (tipoLower.includes('féria')) color = COLORS.ferias
      else if (tipoLower.includes('assidu')) color = COLORS.assiduidade
      else if (tipoLower.includes('plant')) color = COLORS.plantao
      else if (tipoLower.includes('matern')) color = COLORS.licenca_maternidade
      else if (tipoLower.includes('patern')) color = COLORS.licenca_paternidade
      else if (tipoLower.includes('licen')) color = COLORS.licenca_geral
      else if (tipoLower.includes('espec')) color = COLORS.evento_especial
    }
    
    return {
      id: evento.id,
      title: title,
      start,
      end,
      allDay: true,
      color,
      extendedProps: evento.extendedProps || {}
    }
  }
  
  // Formatar feriado para o calendário
  const formatFeriado = (feriado: any, isNacional: boolean) => {
    console.log("Formatando feriado:", feriado)
    
    const dataFeriado = new Date(feriado.data_feriado)
    const dataFimFeriado = new Date(feriado.data_feriado)
    dataFimFeriado.setDate(dataFimFeriado.getDate() + 1) // Adicionar um dia para exibição correta
    
    const tipo = isNacional ? "feriado_nacional" : "feriado_estadual"
    const prefix = isNacional ? "Nacional" : feriado.uf
    
    return {
      id: `feriado-${tipo}-${feriado.data_feriado}`,
      title: `Feriado ${prefix}: ${feriado.descricao_feriado}`,
      start: dataFeriado,
      end: dataFimFeriado,
      allDay: true,
      color: COLORS[tipo],
      extendedProps: {
        tipo: "feriado",
        nacional: isNacional,
        descricao: feriado.descricao_feriado,
        uf: feriado.uf
      }
    }
  }
  
  // Navegação entre datas
  const navigate = (direction: number) => {
    const newDate = new Date(currentDate)
    
    switch (viewType) {
      case Views.MONTH:
        newDate.setMonth(newDate.getMonth() + direction)
        break
      case Views.WEEK:
        newDate.setDate(newDate.getDate() + direction * 7)
        break
      case Views.DAY:
        newDate.setDate(newDate.getDate() + direction)
        break
      default:
        newDate.setMonth(newDate.getMonth() + direction)
    }
    
    setCurrentDate(newDate)
  }
  
  // Voltar para hoje
  const goToToday = () => setCurrentDate(new Date())
  
  // Formatar título do período atual
  const formatViewTitle = () => {
    switch (viewType) {
      case Views.MONTH:
        return moment(currentDate).format('MMMM YYYY')
      case Views.WEEK:
        const startOfWeek = moment(currentDate).startOf('week')
        const endOfWeek = moment(currentDate).endOf('week')
        return `${startOfWeek.format('DD')} - ${endOfWeek.format('DD')} ${endOfWeek.format('MMMM YYYY')}`
      case Views.DAY:
        return moment(currentDate).format('DD MMMM YYYY')
      default:
        return moment(currentDate).format('MMMM YYYY')
    }
  }
  
  // Componente de evento personalizado com tooltip
  const EventComponent = ({ event }: { event: any }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="text-xs truncate text-white px-1 py-0.5 rounded"
            style={{ backgroundColor: event.color }}
          >
            {event.title}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm p-1 space-y-1">
            <p className="font-semibold">{event.title}</p>
            <p>Data: {moment(event.start).format('DD/MM/YYYY')}</p>
            {event.extendedProps?.status && (
              <p>Status: {event.extendedProps.status}</p>
            )}
            {event.extendedProps?.tipo_ausencia && (
              <p>Tipo: {event.extendedProps.tipo_ausencia}</p>
            )}
            {event.extendedProps?.total_dias && (
              <p>Total de dias: {event.extendedProps.total_dias}</p>
            )}
            {event.extendedProps?.usuario_nome && (
              <p>Usuário: {event.extendedProps.usuario_nome}</p>
            )}
            {event.extendedProps?.aprovado_por_nome && (
              <p>Aprovado por: {event.extendedProps.aprovado_por_nome}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        {/* Controles superiores */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-y-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              title="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={goToToday}
            >
              hoje
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(1)}
              title="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <span className="font-medium ml-2">
              {formatViewTitle()}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Filtro: todos/aprovados */}
            <Tabs 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as "todos" | "aprovados")}
            >
              <TabsList>
                <TabsTrigger value="todos">Todos os Eventos</TabsTrigger>
                <TabsTrigger value="aprovados">Apenas Aprovados</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Seleção de visualização */}
            <Tabs 
              value={viewType} 
              onValueChange={(value) => setViewType(value)}
            >
              <TabsList>
                <TabsTrigger value={Views.MONTH}>mês</TabsTrigger>
                <TabsTrigger value={Views.WEEK}>semana</TabsTrigger>
                <TabsTrigger value={Views.DAY}>dia</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Mensagem de erro */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Calendário */}
        {loading ? (
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Carregando calendário...</p>
            </div>
          </div>
        ) : (
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              date={currentDate}
              onNavigate={(date: Date) => setCurrentDate(date)}
              view={viewType}
              onView={(view: string) => setViewType(view)}
              toolbar={false}
              eventPropGetter={(event: any) => ({
                style: {
                  backgroundColor: event.color
                }
              })}
              components={{
                event: EventComponent
              }}
              popup
            />
          </div>
        )}
        
        {/* Legenda */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded" style={{ backgroundColor: COLORS.aprovado }}></div>
            <span className="text-sm">Aprovado</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded" style={{ backgroundColor: COLORS.pendente }}></div>
            <span className="text-sm">Pendente</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded" style={{ backgroundColor: COLORS.rejeitado }}></div>
            <span className="text-sm">Rejeitado</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded" style={{ backgroundColor: COLORS.feriado_nacional }}></div>
            <span className="text-sm">Feriado Nacional</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded" style={{ backgroundColor: COLORS.feriado_estadual }}></div>
            <span className="text-sm">Feriado Estadual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 