# Visys Web

Visys é um sistema de consciência vocabular em inglês, focado em leitura ativa de textos reais.
Ele não traduz automaticamente: o aprendizado acontece quando o usuário interpreta, registra e acompanha seu próprio vocabulário.

Construído com **React + TypeScript + Vite**, 100% frontend.

---

## Funcionalidades

### Leitura de texto em inglês
- O usuário cola ou digita um texto real.
- O sistema processa o texto e o exibe de forma interativa.

### Palavras clicáveis
- Cada palavra pode ser selecionada individualmente.
- Pontuação é preservada e não tratada como palavra.

### Contexto e frases
- Seleção de múltiplas palavras abre um modal de contexto.
- É possível copiar a frase original em inglês.
- Traduções individuais podem ser editadas dentro do modal de frase.

### Registro manual de significado
- Ao clicar em uma palavra, abre-se um modal flutuante.
- O usuário escreve o significado com suas próprias palavras.
- **Não há tradução automática.**

### Sinais heurísticos e recomendação de contexto
- O sistema detecta sinais de ambiguidade (ex.: sufixos, posição, palavras vizinhas).
- Identifica candidatos a phrasal verbs/chunks e sugere salvar por contexto.
- Mostra explicações em português do porquê da recomendação.

### Busca em dicionário (opcional)
- Integração com `api.dictionaryapi.dev` para detectar expressões conhecidas.
- Quando encontrado, reforça a recomendação de salvar por contexto.

### Classificação de aprendizado
- 🔴 Não aprendida
- 🟡 Em aprendizado
- 🟢 Aprendida

### Persistência de progresso
- Palavras, significados e status são salvos no Firestore.
- Cache em memória evita leituras desnecessárias durante a sessão.

### Tradução via BFF
- Para evitar expor chaves no frontend, a tradução usa um BFF (visys-bff).
- O frontend chama `VITE_TRANSLATION_ENDPOINT` apontando para o BFF.

### Resumo de estatísticas
- Total de palavras
- Distribuição por status

### Interface moderna
- Tema escuro
- CSS com variáveis customizadas
- Componentes simples e responsivos

---

## Estrutura de Pastas

```
src/
  app/                # App principal e rotas
  components/         # Componentes reutilizáveis
  domain/             # Entidades e enums de negócio
  hooks/              # Hooks customizados de estado
  pages/              # Páginas (Home, TextInteractive)
  services/           # Processamento de texto e sinais de contexto
  storage/            # Integração com Firestore
  styles/             # Estilos globais e tema
  main.tsx            # Entry point
```

---

## BFF (visys-bff)

O BFF roda separado do frontend e expõe o endpoint `POST /translate` para uso do DeepL.

Configuração rápida:

```
VITE_TRANSLATION_ENDPOINT=http://localhost:8787/translate
```

Veja detalhes em `visys-bff/README.md`.

---

## Instalação e Uso

1. **Clone o repositório**

```bash
git clone <repo-url>
cd visys-web
```

2. **Instale as dependências**

```bash
yarn
# ou npm install
```

3. **Configure o Firebase**

Crie um arquivo `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

4. **Rode o projeto**

```bash
yarn dev
```

Acesse:
👉 http://localhost:5173

---

## Principais Componentes

- **Home**: Entrada de texto e visão geral.
- **TextInteractive**: Texto renderizado palavra por palavra.
- **Word**: Representação visual de uma palavra.
- **WordModal**: Modal flutuante para registrar significado e definir status de aprendizado.
- **ContextPhraseModal**: Modal para registrar significado por contexto e editar palavras.
- **WordInPhrase**: Edição rápida de tradução de palavra dentro de um contexto.
- **StatsSummary**: Estatísticas de vocabulário.

---

## Persistência (Firestore)

- Firestore é usado como banco principal.
- Não há backend intermediário.
- Regras simples para desenvolvimento:

```js
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Sinais de contexto (heurísticas)

- Regras simples por texto: sufixos, posição na frase, artigos, partículas e preposições.
- Recomenda salvar por contexto quando o risco é alto.
- Explicações aparecem no modal para manter transparência da decisão.

## Dicionário externo

- Integração com `https://api.dictionaryapi.dev`
- Usado para detectar expressões conhecidas e reforçar a recomendação de contexto.

---

## Scripts

- `yarn dev` — desenvolvimento
- `yarn build` — build de produção
- `yarn lint` — lint

---

## Filosofia do Projeto

Visys não ensina inglês.
Ele cria consciência vocabular a partir de textos reais.

O aprendizado acontece quando o usuário:
- lê
- percebe
- interpreta
- registra
- acompanha
