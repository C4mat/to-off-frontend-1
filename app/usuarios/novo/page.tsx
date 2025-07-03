"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/auth/route-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type Grupo, type UF } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Save, 
  ArrowLeft, 
  CalendarIcon 
} from "lucide-react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function NovoUsuarioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [ufs, setUfs] = useState<UF[]>([])
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    grupo_id: "",
    tipo_usuario: "comum",
    flag_gestor: "N",
    inicio_na_empresa: "",
    uf: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar UFs
        const ufsResponse = await apiClient.getUFs()
        if (ufsResponse.data) {
          setUfs(ufsResponse.data)
        }

        // Carregar grupos
        let gruposResponse
        if (user?.tipo_usuario === "rh") {
          gruposResponse = await apiClient.getGrupos()
        } else if (user?.flag_gestor === "S") {
          gruposResponse = await apiClient.getGrupos({ grupo_id: user.grupo_id })
        }

        if (gruposResponse?.data) {
          setGrupos(gruposResponse.data)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários",
          variant: "destructive",
        })
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Verificar se o usuário tem permissão para criar usuários
  useEffect(() => {
    const checkPermissions = () => {
      if (!user) return

      const hasPermission = user.tipo_usuario === "rh" || user.flag_gestor === "S"
      if (!hasPermission) {
        toast({
          title: "Sem permissão",
          description: "Você não tem permissão para criar usuários",
          variant: "destructive",
        })
        router.push("/usuarios")
      }
    }

    checkPermissions()
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Se for CPF, remover caracteres não numéricos
    if (name === "cpf") {
      const numericValue = value.replace(/\D/g, "")
      setFormData({ ...formData, [name]: numericValue })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
    
    // Limpar erro do campo quando o usuário seleciona algo
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd")
      setFormData({ ...formData, inicio_na_empresa: formattedDate })
      
      // Limpar erro do campo quando o usuário seleciona uma data
      if (errors.inicio_na_empresa) {
        setErrors({ ...errors, inicio_na_empresa: "" })
      }
    }
    
    setDatePickerOpen(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.cpf || formData.cpf.length !== 11) {
      newErrors.cpf = "CPF deve conter 11 dígitos"
    }
    
    if (!formData.nome) {
      newErrors.nome = "Nome é obrigatório"
    }
    
    if (!formData.email) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }
    
    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória"
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres"
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não conferem"
    }
    
    if (!formData.grupo_id) {
      newErrors.grupo_id = "Grupo é obrigatório"
    }
    
    if (!formData.inicio_na_empresa) {
      newErrors.inicio_na_empresa = "Data de início é obrigatória"
    }
    
    if (!formData.uf) {
      newErrors.uf = "UF é obrigatória"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const usuarioData = {
        cpf: parseInt(formData.cpf, 10),
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        grupo_id: parseInt(formData.grupo_id, 10),
        tipo_usuario: formData.tipo_usuario,
        flag_gestor: formData.flag_gestor,
        inicio_na_empresa: formData.inicio_na_empresa,
        uf: formData.uf
      }
      
      const response = await apiClient.createUsuario(usuarioData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      })
      
      router.push("/usuarios")
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      
      let errorMessage = "Não foi possível criar o usuário"
      if (error instanceof Error) {
        if (error.message.includes("Email já cadastrado")) {
          errorMessage = "Este email já está cadastrado"
        } else if (error.message.includes("CPF já cadastrado")) {
          errorMessage = "Este CPF já está cadastrado"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RouteGuard>
      <AppLayout title="Novo Usuário" subtitle="Cadastrar um novo colaborador no sistema">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Usuário</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Informações pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Pessoais</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        placeholder="Digite apenas números"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        maxLength={11}
                        className={errors.cpf ? "border-red-500" : ""}
                      />
                      {errors.cpf && (
                        <p className="text-sm text-red-500">{errors.cpf}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        name="nome"
                        placeholder="Nome completo"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className={errors.nome ? "border-red-500" : ""}
                      />
                      {errors.nome && (
                        <p className="text-sm text-red-500">{errors.nome}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="inicio_na_empresa">Data de Início</Label>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              errors.inicio_na_empresa ? "border-red-500" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.inicio_na_empresa ? (
                              format(new Date(formData.inicio_na_empresa), "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.inicio_na_empresa ? new Date(formData.inicio_na_empresa) : undefined}
                            onSelect={handleDateChange}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.inicio_na_empresa && (
                        <p className="text-sm text-red-500">{errors.inicio_na_empresa}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Informações de acesso */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Informações de Acesso</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha</Label>
                      <Input
                        id="senha"
                        name="senha"
                        type="password"
                        placeholder="******"
                        value={formData.senha}
                        onChange={handleInputChange}
                        className={errors.senha ? "border-red-500" : ""}
                      />
                      {errors.senha && (
                        <p className="text-sm text-red-500">{errors.senha}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <Input
                        id="confirmarSenha"
                        name="confirmarSenha"
                        type="password"
                        placeholder="******"
                        value={formData.confirmarSenha}
                        onChange={handleInputChange}
                        className={errors.confirmarSenha ? "border-red-500" : ""}
                      />
                      {errors.confirmarSenha && (
                        <p className="text-sm text-red-500">{errors.confirmarSenha}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Informações organizacionais */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Informações Organizacionais</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="grupo_id">Grupo</Label>
                      <Select
                        value={formData.grupo_id}
                        onValueChange={(value) => handleSelectChange("grupo_id", value)}
                      >
                        <SelectTrigger className={errors.grupo_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {grupos.map((grupo) => (
                            <SelectItem key={grupo.id} value={String(grupo.id)}>
                              {grupo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.grupo_id && (
                        <p className="text-sm text-red-500">{errors.grupo_id}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="uf">UF</Label>
                      <Select
                        value={formData.uf}
                        onValueChange={(value) => handleSelectChange("uf", value)}
                      >
                        <SelectTrigger className={errors.uf ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione uma UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ufs.map((uf) => (
                            <SelectItem key={uf.cod_uf} value={uf.uf}>
                              {uf.uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.uf && (
                        <p className="text-sm text-red-500">{errors.uf}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tipo_usuario">Tipo de Usuário</Label>
                      <Select
                        value={formData.tipo_usuario}
                        onValueChange={(value) => handleSelectChange("tipo_usuario", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comum">Usuário Comum</SelectItem>
                          <SelectItem value="gestor">Gestor</SelectItem>
                          {user?.tipo_usuario === "rh" && (
                            <SelectItem value="rh">RH</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="flag_gestor">É Gestor?</Label>
                      <Select
                        value={formData.flag_gestor}
                        onValueChange={(value) => handleSelectChange("flag_gestor", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N">Não</SelectItem>
                          <SelectItem value="S">Sim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/usuarios">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </AppLayout>
    </RouteGuard>
  )
} 