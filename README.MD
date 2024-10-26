Aqui está um exemplo de **README.md** para o seu projeto:

---

# Oden Monorepo

Este repositório é um **monorepo** que contém dois pacotes: um backend chamado `oden-api` e um frontend chamado `oden-front`. O objetivo do projeto é transcrever áudio para texto em tempo real utilizando a API do **Google Speech-to-Text**. A comunicação entre o frontend e o backend é feita via **WebSocket** para enviar dados de áudio e receber a transcrição.

## Estrutura do Repositório

- **oden-api (Backend)**: Um servidor Node.js que utiliza **Socket.io** para receber streams de áudio do cliente, transcrevê-los usando o **Google Cloud Speech-to-Text** e retornar a transcrição.
- **oden-front (Frontend)**: Um aplicativo React (Next.js) que grava o áudio do usuário via WebRTC, envia os dados para o backend via WebSocket e exibe a transcrição recebida em tempo real.

## Tecnologias Utilizadas

### Backend (`oden-api`)
- **Node.js**
- **Express**
- **Socket.io**
- **Google Cloud Speech-to-Text**
- **TypeScript**
- **Cors**

### Frontend (`oden-front`)
- **Next.js**
- **React**
- **Socket.io-client**
- **Tailwind CSS**
- **WebRTC (MediaStream API)**

## Instalação

### Pré-requisitos
1. Certifique-se de ter o **Node.js** instalado (versão 18 ou superior).
2. Instale o **Google Cloud SDK** e configure suas credenciais para a API de **Google Speech-to-Text**.
3. Configure as variáveis de ambiente com as credenciais do Google Cloud (`GOOGLE_APPLICATION_CREDENTIALS`).

### Passos

1. Clone o repositório:

   ```bash
   git clone https://github.com/fernandes-dev/oden
   cd oden
   ```

2. Instale as dependências no diretório raiz para ambos os pacotes (backend e frontend):

   ```bash
   cd oden-api
   yarn
   cd ../oden-front
   yarn
   ```

### Executando o Backend (`oden-api`)

1. Certifique-se de que você possui as credenciais do Google Cloud configuradas corretamente.
2. Inicie o servidor backend:

   ```bash
   cd oden-api
   npm run dev
   ```

O backend estará rodando em `http://localhost:3333`.

### Executando o Frontend (`oden-front`)

1. Inicie o servidor frontend:

   ```bash
   cd oden-front
   npm run dev
   ```

O frontend estará rodando em `http://localhost:3000`.

## Funcionamento

1. **Conexão Inicial**: O frontend se conecta ao servidor WebSocket do backend e começa a enviar dados de áudio.
2. **Gravação de Áudio**: O usuário inicia a gravação de áudio no frontend. O áudio capturado é enviado ao backend em blocos via WebSocket.
3. **Transcrição**: O backend processa o áudio utilizando a API do **Google Cloud Speech-to-Text** e envia a transcrição de volta para o frontend.
4. **Exibição de Transcrição**: O frontend exibe a transcrição recebida em tempo real.

## Arquitetura

### Backend (`oden-api`)
- O backend utiliza **Socket.io** para gerenciar a comunicação com o frontend.
- Quando o cliente se conecta e começa a enviar áudio, o backend inicia um stream de reconhecimento de fala com a API do Google.
- As transcrições são enviadas de volta ao frontend à medida que o áudio é processado.
- Ao final de uma sessão ou em caso de erro, o stream de reconhecimento é encerrado.

### Frontend (`oden-front`)
- O frontend usa a API **MediaStream** para capturar áudio do microfone do usuário.
- Os dados de áudio são processados e enviados ao backend via **Socket.io**.
- A transcrição de áudio é exibida em tempo real à medida que o backend retorna os resultados.

## Variáveis de Ambiente

No backend, você precisa definir a variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` para apontar para o arquivo de credenciais do Google Cloud:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
```