# Alterações no Projeto TO-OFF Frontend

## Resumo de Alterações

### 1. Remoção do Sistema de Notificações

Removemos completamente o sistema de notificações do frontend, uma vez que não existiam endpoints correspondentes na API do backend, conforme documentado em `endpoints.md`.

#### Arquivos Removidos:
- `app/notificacoes/page.tsx`
- `components/layout/notification-dropdown.tsx`
- `contexts/notification-context.tsx`

#### Arquivos Modificados:
- `app/layout.tsx` - Removida a importação e uso do `NotificationProvider`
- `components/layout/header.tsx` - Removida a importação e uso do componente `NotificationDropdown`
- `config/navigation.ts` - Removido o item de menu "Notificações" da navegação

### 2. Correção dos Endpoints de API

Para resolver o problema de redirecionamento 308 (Permanent Redirect), adicionamos a barra final (/) aos endpoints de UFs e tipos de ausência no cliente de API.

#### Arquivos Modificados:
- `lib/api.ts` - Corrigidos os seguintes métodos para incluir a barra final nos endpoints:

```typescript
// Antes
async getUFs(): Promise<ApiResponse<UF[]>> {
  return this.request<UF[]>("/api/ufs")
}

// Depois
async getUFs(): Promise<ApiResponse<UF[]>> {
  return this.request<UF[]>("/api/ufs/")
}

// Similar para os endpoints:
// - getUF()
// - createUF()
// - getTiposAusencia()
// - getTipoAusencia()
// - createTipoAusencia()
```

## Justificativa das Alterações

### Sistema de Notificações

A remoção do sistema de notificações foi necessária porque:
1. Não havia endpoints correspondentes na API documentada
2. O sistema não poderia funcionar corretamente sem o backend apropriado
3. Simplifica a manutenção do código ao remover recursos não suportados

### Correção de Endpoints

A adição da barra final (/) aos endpoints foi necessária porque:
1. O servidor Flask estava configurado para exigir barras finais nas rotas
2. As requisições sem a barra final resultavam em redirecionamentos 308 (Permanent Redirect)
3. Estes redirecionamentos estavam causando problemas na autenticação e nas requisições

## Impacto das Alterações

### Impacto Funcional
- Remoção do sistema de notificações: Não há impacto funcional, pois o recurso não estava funcionando por falta de endpoints
- Correção de endpoints: Melhora na estabilidade e confiabilidade das requisições à API

### Impacto Visual
- Remoção do ícone de notificações do cabeçalho
- Remoção do item "Notificações" do menu lateral

## Próximos Passos Recomendados

1. Atualizar a documentação do projeto (README.md) para remover as referências ao sistema de notificações
2. Considerar a implementação de um sistema de notificações no backend e frontend no futuro, se necessário
3. Padronizar todos os endpoints da API para seguir a mesma convenção (com ou sem barra final) 