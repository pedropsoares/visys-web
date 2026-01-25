# Visys Web

Visys é um sistema de consciência vocabular em inglês, focado em leitura ativa de textos reais.
Ele não traduz automaticamente: o aprendizado acontece quando o usuário interpreta, registra e acompanha seu próprio vocabulário.
A tradução existe apenas como apoio sob demanda (botão), nunca como preenchimento automático obrigatório.

Frontend em **React + TypeScript + Vite**, com **Firebase** (Firestore para persistência e Functions para tradução opcional).

---

## Como funciona (fluxo rápido)

1. Cole ou digite um texto em inglês (limite de 1665 caracteres).
2. O texto é tokenizado e exibido palavra por palavra, preservando pontuação.
3. Clique para selecionar uma palavra ou um trecho contínuo e use **"Traduzir seleção"** para abrir o modal.
4. Registre o significado e o status de aprendizado.
5. As palavras e contextos ficam salvos e são destacados quando você volta ao texto.

---

## Funcionalidades

### Texto em andamento
- O texto colado é salvo como "ativo" e pode ser retomado depois.
- O botão **Concluir texto** remove o texto ativo e libera um novo.

### Leitura interativa por tokens
- Palavras clicáveis; pontuação é exibida mas não vira palavra.
- Seleções são contíguas, permitindo salvar uma palavra ou uma frase inteira.

### Modais de palavra e de contexto
- 1 palavra → **WordModal**.
- 2+ palavras → **ContextPhraseModal**.
- No modal de frase, cada palavra pode ter tradução/nota própria via **WordInPhrase**.

### Registro de significado + status
- O usuário escreve o significado com suas próprias palavras.
- Status: 🔴 Não aprendida, 🟡 Em aprendizado, 🟢 Aprendida.

### Tradução assistida (opcional)
- Botão de tradução usa DeepL via Firebase Functions.
- Contador de uso de caracteres (janela de 30 dias) salvo no navegador.

### Sinais heurísticos e recomendação de contexto
- Heurísticas de sufixos, posição e partículas sugerem salvar por contexto.
- A recomendação mostra o motivo em português e marca a palavra com um indicador visual.

### Busca em dicionário (opcional)
- Integração com `api.dictionaryapi.dev` para detectar expressões.
- Reforça a recomendação de salvar por contexto quando encontra um match.

### Estatísticas rápidas
- A Home mostra contadores de **aprendidas** e **em aprendizado**.

### Interface moderna
- Tema escuro com CSS variables, componentes simples e responsivos.

---

## Estrutura de Pastas

```
src/
  app/                # App principal e rotas
  components/         # Componentes reutilizáveis
  core/semantic/      # Tokenização e normalização
  domain/             # Entidades e enums de negócio
  hooks/              # Hooks customizados de estado
  pages/              # Páginas (Home, TextInteractive)
  services/           # Processamento de texto e sinais de contexto
  storage/            # Integração com Firestore
  styles/             # Estilos globais e tema
  main.tsx            # Entry point
functions/            # Cloud Functions (DeepL)
```

---

## Tradução via Firebase Functions (opcional)

O backend de tradução fica em `functions/` e expõe:
- `translateHttp` (HTTP) — usado pelo frontend via `VITE_TRANSLATION_ENDPOINT`.
- `translate` (callable) — disponível para uso futuro.

Variáveis necessárias:

Frontend (`.env`):
```
VITE_TRANSLATION_ENDPOINT=...
```

Functions (`functions/.env`):
```
DEEPL_AUTH_KEY=...
```

Para rodar localmente com emulador:

```
DEEPL_AUTH_KEY=... firebase emulators:start --only functions --project visys-23d3c
```

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

3. **Configure o Firebase (frontend)**

Crie um arquivo `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=... # opcional
VITE_FIREBASE_FUNCTIONS_EMULATOR=localhost:5002 # opcional
VITE_TRANSLATION_ENDPOINT=http://127.0.0.1:5002/visys-23d3c/us-central1/translateHttp # opcional
```

4. **Rode o projeto**

```bash
yarn dev
```

Acesse:
👉 http://localhost:5173

Se quiser rodar tudo junto (app + emulador de Functions):

```bash
yarn dev:all
```

---

## Principais Componentes

- **Home**: Entrada de texto, estatísticas e acesso ao texto em andamento.
- **TextInteractive**: Texto renderizado palavra por palavra com seleção.
- **TextInput**: Campo de texto com limite de caracteres.
- **Word**: Representação visual de uma palavra/pontuação.
- **WordModal**: Modal para registrar significado e status.
- **ContextPhraseModal**: Modal para salvar contexto de frases.
- **WordInPhrase**: Edição rápida de tradução por palavra dentro do contexto.
- **TranslationButton**: Botão de tradução sob demanda.
- **TranslationUsageCounter**: Contador de uso de caracteres da tradução.
- **ReasonList**: Lista de motivos para recomendação de contexto.
- **StatsSummary**: Estatísticas rápidas de aprendizado.

---

## Persistência (Firestore)

- Firestore é usado como banco principal.
- Coleções: `words`, `contexts`, `texts`, `context_links`.
- `texts` guarda o texto ativo; `context_links` mapeia contexto → índices do texto.
- Cache em memória evita leituras repetidas de palavras; uso de tradução fica no `localStorage`.
- Regras simples para desenvolvimento (arquivo `firestore.rules`):

```js
service cloud.firestore {
  match /databases/{database}/documents {
    match /words/{docId} {
      allow read, write: if true;
    }
    match /contexts/{docId} {
      allow read, write: if true;
    }
    match /texts/{docId} {
      allow read, write: if true;
    }
    match /context_links/{docId} {
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
- `yarn dev:all` — app + emulador de Functions
- `yarn build` — build de produção
- `yarn lint` — lint
- `yarn preview` — preview do build

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
