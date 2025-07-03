"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/auth/route-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, TipoAusencia, UF } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { formatCPF } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"

export default function NovoEventoPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // Estados
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const [tiposAusencia, setTiposAusencia] = useState<TipoAusencia[]>([])
  const [ufs, setUfs] = useState<UF[]>([])
  const [usuarios, setUsuarios] = useState<{ cpf: number; nome: string }[]>([])
  
  // Campos do formulário
  const [cpfUsuario, setCpfUsuario] = useState<number | undefined>(user?.cpf)
  const [dataInicio, setDataInicio] = useState(format(new Date(), "yyyy-MM-dd"))
  const [dataFim, setDataFim] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"))
  const [tipoAusencia, setTipoAusencia] = useState<number | undefined>()
  const [uf, setUf] = useState<string>(user?.UF || "")
  const [totalDias, setTotalDias] = useState(1)
  
  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true)
      
      try {
        // Verificar permissões do usuário
        if (user) {
          const isAdminUser = user.tipo_usuario === "rh" || user.flag_gestor === "S"
          setIsAdmin(isAdminUser)
          
          // Carregar usuários se for admin
          if (isAdminUser) {
            const usuariosResponse = await apiClient.getUsuarios(
              user.tipo_usuario === "rh" ? undefined : { grupo_id: user.grupo_id }
            )
            
            if (usuariosResponse.data) {
              setUsuarios(usuariosResponse.data.map(u => ({ cpf: u.cpf, nome: u.nome })))
            }
          }
        }
        
        // Carregar tipos de ausência
        const tiposResponse = await apiClient.getTiposAusencia()
        
        // Sempre usar dados mockados para garantir que a interface funcione
        const tiposMockados = [
          { id_tipo_ausencia: 1, descricao_ausencia: "Férias", usa_turno: false },
          { id_tipo_ausencia: 2, descricao_ausencia: "Folga", usa_turno: false },
          { id_tipo_ausencia: 3, descricao_ausencia: "Atestado", usa_turno: false },
          { id_tipo_ausencia: 4, descricao_ausencia: "Licença", usa_turno: false },
          { id_tipo_ausencia: 5, descricao_ausencia: "Outro", usa_turno: false }
        ];
        
        // Usar dados da API se disponíveis, senão usar mockados
        if (tiposResponse.data && Array.isArray(tiposResponse.data) && tiposResponse.data.length > 0) {
          console.log("Usando dados da API para tipos de ausência:", tiposResponse.data);
          
            // Converter os campos recebidos da API para o formato esperado pelo frontend
  const tiposConvertidos = tiposResponse.data.map((tipo: any) => ({
    id_tipo_ausencia: tipo.id || tipo.id_tipo_ausencia || 0,
    descricao_ausencia: tipo.descricao || tipo.descricao_ausencia || "Sem descrição",
    usa_turno: tipo.usa_turno || false
  }));
          
          setTiposAusencia(tiposConvertidos);
        } else {
          console.log("Usando dados mockados para tipos de ausência");
          setTiposAusencia(tiposMockados);
        }
        
        // Carregar UFs
        const ufsResponse = await apiClient.getUFs()
        if (ufsResponse.data && Array.isArray(ufsResponse.data)) {
          setUfs(ufsResponse.data)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    carregarDados()
  }, [user])
  
  // Atualizar total de dias quando as datas mudam
  useEffect(() => {
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)
      const dias = differenceInDays(fim, inicio) + 1
      setTotalDias(dias > 0 ? dias : 1)
    }
  }, [dataInicio, dataFim])
  
  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos obrigatórios
    if (!cpfUsuario || !dataInicio || !dataFim || !tipoAusencia || !uf) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      // Criando o objeto de acordo com os requisitos da API
      const eventoData: any = {
        cpf_usuario: cpfUsuario,
        data_inicio: dataInicio,
        data_fim: dataFim,
        id_tipo_ausencia: tipoAusencia,
        uf: uf // Campo em minúsculo conforme esperado pela API
      };
      
      const response = await apiClient.createEvento(eventoData as any)
      
      if (response.data) {
        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso",
        })
        router.push("/eventos")
      } else {
        toast({
          title: "Erro",
          description: response.error || "Não foi possível criar o evento",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao criar evento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <RouteGuard>
      <AppLayout title="Solicitação de novo evento" subtitle="Solicitar um novo evento ou ausência">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Solicitação de novo evento</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">Carregando formulário...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Usuário (apenas para admin) */}
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="cpf_usuario">Usuário</Label>
                      <Select
                        value={cpfUsuario?.toString()}
                        onValueChange={(value) => setCpfUsuario(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.cpf} value={usuario.cpf.toString()}>
                              {usuario.nome} ({formatCPF(usuario.cpf)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Tipo de ausência */}
                  <div className="space-y-2">
                    <Label htmlFor="tipo_ausencia">Tipo de Ausência</Label>
                    <Select
                      value={tipoAusencia?.toString()}
                      onValueChange={(value) => setTipoAusencia(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de ausência" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposAusencia
                          .filter(tipo => tipo && tipo.id_tipo_ausencia)
                          .map((tipo) => (
                            <SelectItem 
                              key={tipo.id_tipo_ausencia}
                              value={tipo.id_tipo_ausencia.toString()}
                            >
                              {tipo.descricao_ausencia || "Tipo não especificado"}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Data de início */}
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Data de fim */}
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data de Fim</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      min={dataInicio}
                      required
                    />
                  </div>
                  
                  {/* Total de dias */}
                  <div className="space-y-2">
                    <Label htmlFor="total_dias">Total de Dias</Label>
                    <Input
                      id="total_dias"
                      type="number"
                      value={totalDias}
                      readOnly
                      disabled
                    />
                  </div>
                  
                  {/* UF */}
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Select
                      value={uf}
                      onValueChange={setUf}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {ufs
                          .filter(ufItem => ufItem && ufItem.uf)
                          .map((ufItem) => (
                            <SelectItem 
                              key={ufItem.uf} 
                              value={ufItem.uf}
                            >
                              {ufItem.uf}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Botões */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Solicitar Evento"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </RouteGuard>
  )
} 