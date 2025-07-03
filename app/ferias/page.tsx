"use client"

import { useEffect, useState } from "react"
import { RouteGuard } from "@/components/auth/route-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type DiasFerias } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Palmtree } from "lucide-react"
import { Loader2 } from "lucide-react"
import { format, addYears, parseISO, differenceInMonths } from "date-fns"
import { pt } from "date-fns/locale"

export default function FeriasPage() {
  const { user } = useAuth()
  const [feriasInfo, setFeriasInfo] = useState<DiasFerias | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodoAquisitivo, setPeriodoAquisitivo] = useState({
    inicio: "",
    fim: "",
    progresso: 0,
    mesesTrabalhados: 0,
  })

  useEffect(() => {
    const fetchFeriasInfo = async () => {
      setIsLoading(true)
      setError(null)
      
      if (!user) return
      
      try {
        const response = await apiClient.getDiasFerias(user.cpf)
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setFeriasInfo(response.data)
          
          // Calcular período aquisitivo baseado na data de início na empresa
          if (user.inicio_na_empresa) {
            const dataInicio = parseISO(user.inicio_na_empresa)
            
            // Encontrar o período aquisitivo atual
            const dataAtual = new Date()
            const anosTrabalho = Math.floor(differenceInMonths(dataAtual, dataInicio) / 12)
            
            const inicioAtual = addYears(dataInicio, anosTrabalho)
            const fimAtual = addYears(inicioAtual, 1)
            
            // Calcular progresso do período aquisitivo atual
            const mesesTrabalhados = differenceInMonths(dataAtual, inicioAtual)
            const progresso = Math.min(Math.round((mesesTrabalhados / 12) * 100), 100)
            
            setPeriodoAquisitivo({
              inicio: format(inicioAtual, 'dd/MM/yyyy'),
              fim: format(fimAtual, 'dd/MM/yyyy'),
              progresso,
              mesesTrabalhados
            })
          }
        }
      } catch (err) {
        console.error("Erro ao buscar informações de férias:", err)
        setError("Erro ao buscar informações de férias. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeriasInfo()
  }, [user])

  return (
    <RouteGuard>
      <AppLayout title="Minhas Férias" subtitle="Gerencie suas férias e períodos aquisitivos">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando informações de férias...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      <Palmtree className="h-6 w-6 mr-2 text-blue-600" />
                      Saldo de Férias
                    </CardTitle>
                    <CardDescription>
                      Dias disponíveis para agendamento
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xl bg-white">
                    {feriasInfo?.dias_disponiveis || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Colaborador
                    </h3>
                    <p className="mt-1 text-base">
                      {user?.nome}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Data de Admissão
                    </h3>
                    <p className="mt-1 text-base flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {user?.inicio_na_empresa ? format(parseISO(user.inicio_na_empresa), 'dd/MM/yyyy', { locale: pt }) : "Não informada"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Último Período Aquisitivo
                    </h3>
                    <p className="mt-1 text-base">
                      {feriasInfo?.ultimo_periodo_aquisitivo_fim ? 
                        format(parseISO(feriasInfo.ultimo_periodo_aquisitivo_fim), 'dd/MM/yyyy', { locale: pt }) : 
                        "Não informado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Período Aquisitivo Atual
                </CardTitle>
                <CardDescription>
                  Acompanhe o progresso do seu período aquisitivo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Período
                    </h3>
                    <p className="mt-1 text-base">
                      {periodoAquisitivo.inicio} até {periodoAquisitivo.fim}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Progresso
                    </h3>
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${periodoAquisitivo.progresso}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 flex justify-between">
                        <span>{periodoAquisitivo.mesesTrabalhados} meses trabalhados</span>
                        <span>{periodoAquisitivo.progresso}% concluído</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Informações
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      A cada 12 meses de trabalho (período aquisitivo), você adquire o direito a 30 dias de férias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AppLayout>
    </RouteGuard>
  )
} 