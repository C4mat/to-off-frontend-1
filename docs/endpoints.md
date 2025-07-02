  --- FUNÇÕES DOS ENDPOINTS DA API ---
1. 🔐 AUTENTICAÇÃO
Método	Endpoint	Função
POST	/api/auth/login	Autentica o usuário e retorna access/refresh token e dados (com CPF).
POST	/api/auth/refresh	Gera um novo access token com o refresh token atual.
GET	/api/auth/me	Retorna os dados do usuário autenticado.
POST	/api/auth/logout	Invalida o token atual (logout).

2. 🏢 EMPRESAS
Método	Endpoint	Função
GET	/api/empresas	Lista todas as empresas.
GET	/api/empresas/{id}	Retorna os dados de uma empresa específica.
POST	/api/empresas	Cria uma nova empresa (com CNPJ).
PUT	/api/empresas/{id}	Atualiza os dados de uma empresa.
DELETE	/api/empresas/{id}	Remove uma empresa existente.

3. 👥 GRUPOS
Método	Endpoint	Função
GET	/api/grupos	Lista todos os grupos.
GET	/api/grupos/{id}	Detalha um grupo específico.
POST	/api/grupos	Cria um novo grupo.
PUT	/api/grupos/{id}	Atualiza um grupo existente.
DELETE	/api/grupos/{id}	Deleta um grupo.

4. 👤 USUÁRIOS
Método	Endpoint	Função
GET	/api/usuarios	Lista usuários conforme permissão (RH vê todos, gestor vê grupo, comum vê só ele).
GET	/api/usuarios/{id}	Retorna um usuário específico.
POST	/api/usuarios	Cria novo usuário.
PUT	/api/usuarios/{id}	Atualiza dados do usuário.
DELETE	/api/usuarios/{id}	Deleta usuário.

⚠️ Flag de gestor = true define se o usuário gerencia um grupo.

5. 📅 EVENTOS
Método	Endpoint	Função
GET	/api/eventos	Lista eventos de acordo com a permissão do usuário.
GET	/api/eventos/{id}	Detalha um evento específico.
POST	/api/eventos	Cria novo evento (férias, folga, etc).
PUT	/api/eventos/{id}	Atualiza evento.
DELETE	/api/eventos/{id}	Deleta evento.

6. ✅ APROVAÇÃO DE EVENTOS
Método	Endpoint	Função
PUT	/api/eventos/{id}/aprovar	Aprova evento (gestor ou RH).
PUT	/api/eventos/{id}/reprovar	Reprova evento.

7. 🌎 UFs (Estados)
Método	Endpoint	Função
GET	/api/ufs	Lista todos os estados (UFs).
GET	/api/ufs/{id}	Retorna dados de uma UF específica.
POST	/api/ufs	Cria uma nova UF.

8. 📌 TIPOS DE AUSÊNCIA
Método	Endpoint	Função
GET	/api/tipos-ausencia	Lista tipos de ausência (férias, atestado, folga, etc).
GET	/api/tipos-ausencia/{id}	Retorna um tipo específico.
POST	/api/tipos-ausencia	Cria novo tipo.

9. 🕒 TURNOS
Método	Endpoint	Função
GET	/api/turnos	Lista turnos de trabalho (manhã, tarde, integral, etc).
GET	/api/turnos/{id}	Detalha um turno específico.
POST	/api/turnos	Cria novo turno.

10. 🎉 FERIADOS
Método	Endpoint	Função
GET	/api/feriados	Lista feriados (nacionais e estaduais).
GET	/api/feriados/{id}	Detalha um feriado.
POST	/api/feriados	Cria um novo feriado.
DELETE	/api/feriados/{id}	Remove um feriado.

11. 🧪 VALIDAÇÃO
Método	Endpoint	Função
POST	/api/validar-vinculo	Verifica se usuário está vinculado a um grupo.
POST	/api/validar-evento	Valida regras de evento (como sobreposição de datas).

12. 📆 CALENDÁRIO
Método	Endpoint	Função
GET	/api/calendario	Retorna eventos em formato para FullCalendar.
GET	/api/calendario-grupo/{id}	Retorna eventos do grupo para exibição em calendário.

13. 🌴 FÉRIAS - CONTROLE
Método	Endpoint	Função
GET	/api/ferias/dias-disponiveis	Retorna os dias de férias disponíveis do usuário.
GET	/api/ferias/dias-indisponiveis	Retorna feriados e folgas já usados.
-----------------------------------------

-- 🔒 Sistema de Permissões V2.0 --
Usuário RH
✅ CRUD completo em empresas (por CNPJ)
✅ CRUD completo em grupos
✅ CRUD completo em usuários (por CPF)
✅ Criação de UFs, tipos de ausência, turnos, feriados
✅ Visualização de todos os eventos
✅ Aprovação/rejeição de qualquer evento
✅ Acesso ao sistema de validação de integridade
✅ Visualização do calendário geral e de todos os grupos
Usuário Gestor (flag_gestor = 'S')
❌ Sem acesso a empresas
✅ Visualização de grupos
✅ CRUD de usuários do seu grupo
✅ CRUD de eventos do seu grupo
✅ Aprovação/rejeição de eventos do grupo
❌ Sem acesso ao sistema de validação
✅ Visualização do calendário geral e do seu grupo
Usuário Comum (flag_gestor = 'N')
❌ Sem acesso a empresas/grupos
✅ Visualização de usuários do grupo
✅ CRUD dos próprios eventos
❌ Sem permissão de aprovação
❌ Sem acesso ao sistema de validação
✅ Visualização do calendário geral e do seu grupo
