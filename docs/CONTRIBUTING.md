# 🤝 Guia de Contribuição - MangoBeat AI Backend

## 🎯 Como Contribuir

Obrigado pelo interesse em contribuir com o **MangoBeat AI Backend**! Este guia vai te ajudar a começar.

---

## 📋 Código de Conduta

### Nossos Valores

- **Respeito**: Trate todos com cortesia e profissionalismo
- **Inclusão**: Bem-vindos desenvolvedores de todos os níveis
- **Colaboração**: Trabalhamos juntos para criar algo incrível
- **Qualidade**: Código limpo, testado e documentado
- **Inovação**: Sempre buscamos melhorar e evoluir

### Comportamentos Esperados

- ✅ Use linguagem respeitosa e inclusiva
- ✅ Seja receptivo a feedback construtivo
- ✅ Foque no que é melhor para a comunidade
- ✅ Demonstre empatia com outros membros
- ✅ Respeite diferentes pontos de vista

### Comportamentos Inaceitáveis

- ❌ Linguagem ou imagens ofensivas
- ❌ Ataques pessoais ou políticos
- ❌ Assédio público ou privado
- ❌ Publicar informações privadas sem permissão
- ❌ Conduta inadequada em ambiente profissional

---

## 🚀 Primeiros Passos

### 1. Setup do Ambiente

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU_USERNAME/mangobeat-ai-backend.git
cd mangobeat-ai-backend

# Adicione o upstream
git remote add upstream https://github.com/mangobeat/mangobeat-ai-backend.git

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
# Edite .env com suas configurações

# Setup do banco
npm run db:generate
npm run db:migrate

# Rode os testes
npm test
```

### 2. Estrutura do Projeto

Familiarize-se com a [Arquitetura](./ARCHITECTURE.md) antes de contribuir:

```
src/
├── domain/         # Entidades e regras de negócio
├── application/    # Casos de uso
├── infrastructure/ # Implementações técnicas  
├── presentation/   # Controllers e DTOs
└── modules/        # Módulos NestJS
```

### 3. Workflow de Desenvolvimento

```bash
# Sempre sincronize com upstream
git checkout main
git pull upstream main

# Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade

# Faça suas mudanças
# ... código ...

# Teste suas mudanças
npm test
npm run lint
npm run build

# Commit suas mudanças (use conventional commits)
git add .
git commit -m "feat: adicionar nova funcionalidade"

# Push para seu fork
git push origin feature/nova-funcionalidade

# Abra um Pull Request no GitHub
```

---

## 🛠️ Tipos de Contribuição

### 🐛 Reportar Bugs

Antes de reportar, verifique se já não existe uma issue similar.

**Template para Bug Reports:**

```markdown
## 🐛 Descrição do Bug

Descrição clara e concisa do problema.

## 🔄 Para Reproduzir

Passos para reproduzir:
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## ✅ Comportamento Esperado

O que deveria acontecer.

## 📱 Screenshots

Se aplicável, adicione screenshots.

## 🌐 Ambiente

- OS: [e.g. Windows 10, macOS 12, Ubuntu 20.04]
- Node.js: [e.g. 18.17.0]
- npm: [e.g. 9.6.7]
- Browser: [e.g. Chrome 116, Firefox 117]

## 📝 Contexto Adicional

Qualquer informação adicional sobre o problema.
```

### 💡 Sugerir Melhorias

**Template para Feature Requests:**

```markdown
## 🚀 Feature Request

### Problema
Descrição clara do problema que esta feature resolveria.

### Solução Proposta
Descrição clara da solução desejada.

### Alternativas Consideradas
Outras soluções que você considerou.

### Contexto Adicional
Screenshots, mockups, ou contexto adicional.
```

### 🔧 Contribuir com Código

#### Tipos de Contribuições Aceitas

- **Features**: Novas funcionalidades
- **Bugfixes**: Correções de bugs
- **Performance**: Melhorias de performance
- **Refactoring**: Melhorias na estrutura do código
- **Tests**: Adição/melhoria de testes
- **Docs**: Melhorias na documentação

#### Guidelines de Código

1. **Siga a Clean Architecture**
2. **Use TypeScript rigorosamente**
3. **Escreva testes para novo código**
4. **Documente APIs públicas**
5. **Siga as convenções de nomenclatura**

---

## 📝 Padrões de Commit

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para histórico consistente:

```bash
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

#### Tipos Permitidos

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat(auth): adicionar 2FA` |
| `fix` | Correção de bug | `fix(tracks): corrigir validação` |
| `docs` | Documentação | `docs(api): atualizar endpoints` |
| `style` | Formatação | `style: formatar código` |
| `refactor` | Refatoração | `refactor(entities): melhorar User` |
| `test` | Testes | `test(usecases): adicionar testes` |
| `chore` | Manutenção | `chore: atualizar deps` |
| `perf` | Performance | `perf(db): otimizar queries` |
| `ci` | CI/CD | `ci: adicionar workflow` |
| `build` | Build system | `build: configurar webpack` |

#### Escopos Sugeridos

- `auth` - Autenticação
- `tracks` - Gerenciamento de tracks
- `trends` - Análise de tendências
- `jobs` - Sistema de filas
- `db` - Banco de dados
- `api` - Endpoints da API
- `tests` - Testes
- `docs` - Documentação

#### Exemplos

```bash
# Feature simples
git commit -m "feat(auth): adicionar refresh token"

# Bugfix com breaking change
git commit -m "fix(api): corrigir formato de resposta

BREAKING CHANGE: response format changed from array to object"

# Múltiplas mudanças
git commit -m "feat(tracks): adicionar upload de áudio

- Implementar upload multipart
- Adicionar validação de formato
- Atualizar testes

Closes #123"
```

---

## 🧪 Padrões de Testes

### Estrutura de Testes

```
test/
├── unit/           # Testes unitários
│   ├── entities/   # Teste de entidades
│   ├── usecases/   # Teste de casos de uso
│   └── services/   # Teste de serviços
├── integration/    # Testes de integração
│   ├── repositories/ # Teste de repositórios
│   └── external/   # Teste de APIs externas
├── e2e/           # Testes end-to-end
│   ├── auth/      # Fluxos de autenticação
│   ├── tracks/    # Fluxos de tracks
│   └── trends/    # Fluxos de tendências
└── fixtures/      # Dados de teste
```

### Nomenclatura de Testes

```typescript
describe('CreateUserUseCase', () => {
  describe('execute', () => {
    it('should create user with valid data', async () => {
      // Test implementation
    });

    it('should throw ConflictException when email exists', async () => {
      // Test implementation  
    });

    it('should throw BadRequestException when invalid data', async () => {
      // Test implementation
    });
  });
});
```

### Cobertura de Testes

- **Mínimo**: 80% de cobertura geral
- **Use Cases**: 100% de cobertura
- **Entities**: 100% de cobertura  
- **Controllers**: 90% de cobertura
- **Repositories**: 85% de cobertura

### Executar Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes com coverage
npm run test:cov

# Testes específicos
npm test -- --testNamePattern="CreateUserUseCase"

# Watch mode
npm run test:watch
```

---

## 📚 Padrões de Documentação

### Documentação de Código

```typescript
/**
 * Caso de uso para criar um novo usuário
 * 
 * @example
 * ```typescript
 * const usecase = new CreateUserUseCase(userRepository);
 * const user = await usecase.execute({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * ```
 * 
 * @author MangoBeat AI Team
 * @since 1.0.0
 */
@Injectable()
export class CreateUserUseCase {
  /**
   * Executa o caso de uso para criar usuário
   * 
   * @param dto - Dados para criação do usuário
   * @returns Promise com o usuário criado
   * 
   * @throws {BadRequestException} Quando dados inválidos
   * @throws {ConflictException} Quando email já existe
   */
  async execute(dto: CreateUserDto): Promise<User> {
    // Implementation
  }
}
```

### Documentação da API (OpenAPI)

```typescript
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário com email e senha'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email já existe' 
  })
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    // Implementation
  }
}
```

---

## 🔍 Code Review

### Para Contribuidores

#### Antes de Submeter PR

- [ ] Código segue os padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Build passa sem erros
- [ ] Linting passa sem erros
- [ ] Commits seguem conventional commits
- [ ] Branch atualizada com main

#### Descrição do PR

```markdown
## 📋 Resumo

Breve descrição das mudanças.

## 🔄 Tipo de Mudança

- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Melhoria de performance
- [ ] Refatoração
- [ ] Atualização de documentação

## 🧪 Como Testar

Passos para testar as mudanças:

1. Faça checkout da branch
2. Execute `npm install`
3. Execute `npm test`
4. Teste manualmente: ...

## 📝 Checklist

- [ ] Código segue padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Build passa
- [ ] Linting passa
- [ ] Self-review realizado

## 📸 Screenshots

Se aplicável, adicione screenshots.

## 🔗 Issues Relacionadas

Closes #123
Refs #456
```

### Para Reviewers

#### O que Verificar

1. **Funcionalidade**: O código faz o que deveria?
2. **Testes**: Há testes adequados?
3. **Performance**: Há impactos de performance?
4. **Segurança**: Há vulnerabilidades?
5. **Arquitetura**: Segue Clean Architecture?
6. **Estilo**: Segue padrões do projeto?

#### Como dar Feedback

- **Seja construtivo**: Sugira melhorias específicas
- **Seja respeitoso**: Critique o código, não a pessoa
- **Seja específico**: Aponte linhas e dê exemplos
- **Aprove quando apropriado**: Reconheça bom trabalho

#### Template de Review

```markdown
## ✅ Aprovação Geral

Excelente trabalho! O código está bem estruturado e segue os padrões.

## 🔍 Comentários Específicos

### Sugestões de Melhoria

- Linha 42: Considere extrair esta lógica para um método separado
- Considere adicionar validação para o caso edge X

### Questões

- Como isso se comporta quando Y acontece?
- Podemos otimizar esta query?

### Elogios

- Ótima implementação da validação!
- Testes muito bem estruturados
```

---

## 🏷️ Processo de Release

### Versionamento Semântico

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): Novas features compatíveis
- **PATCH** (0.0.1): Bug fixes compatíveis

### Fluxo de Release

```bash
# 1. Checkout main e pull latest
git checkout main
git pull upstream main

# 2. Crie branch de release
git checkout -b release/v1.2.0

# 3. Atualize CHANGELOG.md
# 4. Atualize version no package.json
npm version minor # ou major/patch

# 5. Commit mudanças
git commit -m "chore: release v1.2.0"

# 6. Push e crie PR
git push origin release/v1.2.0

# 7. Após merge, crie tag
git tag v1.2.0
git push upstream v1.2.0
```

### Changelog

Mantemos um `CHANGELOG.md` seguindo [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

## [1.2.0] - 2024-11-07

### Added
- Nova funcionalidade de análise de tendências
- Suporte para upload de imagens
- Integração com TikTok API

### Changed
- Melhor performance nas queries do banco
- UI atualizada do dashboard

### Fixed
- Correção no bug de autenticação
- Fix na validação de uploads

### Security
- Atualização de dependências com vulnerabilidades
```

---

## 💬 Comunicação

### Canais Oficiais

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas e discussões gerais
- **Discord**: Para chat em tempo real (link em breve)
- **Email**: dev@mangobeat.com para questões privadas

### Labels do GitHub

| Label | Descrição | Cor |
|-------|-----------|-----|
| `bug` | Algo não está funcionando | `#d73a4a` |
| `feature` | Nova funcionalidade | `#0075ca` |
| `documentation` | Melhorias na documentação | `#0075ca` |
| `good first issue` | Bom para iniciantes | `#7057ff` |
| `help wanted` | Ajuda externa é bem-vinda | `#008672` |
| `priority: high` | Alta prioridade | `#b60205` |
| `priority: low` | Baixa prioridade | `#0e8a16` |
| `status: in progress` | Sendo trabalhado | `#fbca04` |
| `status: needs review` | Precisa de review | `#006b75` |

---

## 🎉 Reconhecimento

### Contributors

Todos os contribuidores são reconhecidos no README e no site oficial.

### Tipos de Contribuição Reconhecidas

- 💻 **Code**: Contribuições de código
- 📖 **Documentation**: Documentação
- 🐛 **Bug reports**: Reportar bugs
- 💡 **Ideas**: Ideias e sugestões
- 🎨 **Design**: Design e UX
- 📢 **Outreach**: Divulgação e marketing
- 🧪 **Tests**: Testes
- 🔧 **Tools**: Ferramentas e infraestrutura

### Hall of Fame

Contribuidores especiais recebem menção no nosso Hall of Fame:

- **🥇 Top Contributors**: Maiores contribuidores
- **🌟 Quality Champions**: Código de alta qualidade
- **📚 Documentation Heroes**: Documentação excelente
- **🐛 Bug Hunters**: Encontradores de bugs
- **🎓 Mentors**: Ajudam novos contribuidores

---

## 📋 Checklist Final

Antes de contribuir, certifique-se de:

### Setup
- [ ] Fork do repositório feito
- [ ] Ambiente local configurado
- [ ] Testes passando localmente
- [ ] Familiarizado com a arquitetura

### Durante Desenvolvimento
- [ ] Branch criada a partir da main
- [ ] Commits seguem padrão conventional
- [ ] Testes adicionados/atualizados
- [ ] Código documentado adequadamente
- [ ] Linting passa sem erros

### Antes do PR
- [ ] Branch sincronizada com upstream/main
- [ ] Self-review realizado
- [ ] Descrição do PR completa
- [ ] Issues relacionadas referenciadas
- [ ] Ready for review

---

## ❓ FAQ

### Como posso começar a contribuir?

1. Veja issues marcadas com `good first issue`
2. Leia a documentação
3. Configure o ambiente local
4. Faça uma pequena contribuição primeiro

### Minhas mudanças são muito pequenas, vale a pena um PR?

Sim! Pequenas melhorias são muito bem-vindas:
- Correções de typos
- Melhorias na documentação
- Pequenos refactorings
- Adição de testes

### Como posso reportar uma vulnerabilidade de segurança?

Para questões de segurança, **não** abra uma issue pública. 
Envie email para: security@mangobeat.com

### Posso trabalhar em uma feature grande?

Claro! Mas recomendamos:
1. Abrir uma issue primeiro para discutir
2. Dividir em PRs menores quando possível
3. Manter comunicação regular

---

**Obrigado por contribuir com o MangoBeat AI! 🥭🎵**

*Juntos, criamos o futuro da música com IA!*