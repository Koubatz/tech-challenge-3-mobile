# Tech Challenge 3 - Mobile

Este é o repositório para a aplicação mobile do Tech Challenge 3, desenvolvida com React Native e Expo.

## 🛠️ Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento de aplicações móveis multiplataforma.
- **Expo**: Plataforma e conjunto de ferramentas para facilitar o desenvolvimento com React Native.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **ESLint**: Ferramenta para identificar e reportar padrões no código, garantindo qualidade e consistência.
- **Jest**: Framework para testes unitários.
- **GitHub Actions**: Para automação do fluxo de Integração Contínua (CI).

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado em sua máquina:

- **Node.js** (versão 20 ou superior - use o `.nvmrc` para garantir a versão correta com `nvm use`).
- **npm** ou **Yarn**.
- **Expo Go**: Aplicativo para Android e iOS que permite visualizar o projeto em um dispositivo físico.

## 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Koubatz/tech-challenge-3-mobile.git
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd tech-challenge-3-mobile
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

## ▶️ Executando o Projeto

1. Inicie o servidor de desenvolvimento do Metro Bundler:
   ```bash
   npm start
   ```

2. Após o servidor iniciar, um QR Code será exibido no terminal.
3. Abra o aplicativo **Expo Go** no seu celular e escaneie o QR Code para carregar o aplicativo.

## 🌿 Fluxo de Desenvolvimento (Obrigatório)

Para manter a integridade e a qualidade do nosso código, a branch `main` é protegida. **Nenhum push direto é permitido.** Todas as alterações devem passar por um processo de Pull Request e revisão.

### 1. Criando uma Nova Branch

Nunca trabalhe diretamente na branch `main`. Crie uma nova branch a partir da `main` atualizada, seguindo o padrão de nomenclatura abaixo:

- **Features**: `feat/nome-da-feature` (ex: `feat/login-screen`)
- **Correções**: `fix/descricao-do-bug` (ex: `fix/button-alignment`)

```bash
# Garanta que sua branch main local está atualizada
git checkout main
git pull origin main

# Crie sua nova branch
git checkout -b feat/sua-nova-funcionalidade
```

### 2. Abrindo um Pull Request (PR)

Após finalizar suas alterações e fazer os commits, envie sua branch para o repositório remoto e abra um Pull Request.

1. Envie sua branch:
   ```bash
   git push origin feat/sua-nova-funcionalidade
   ```
2. Acesse o repositório no GitHub. Um aviso para criar um Pull Request a partir da sua branch recém-enviada aparecerá. Clique nele.
3. Preencha um título e uma descrição clara para o seu PR, explicando o que foi feito.
4. **Aguarde a aprovação**: O fluxo de CI (Integração Contínua) será executado automaticamente para rodar o linter e os testes. Além disso, um dos membros da equipe listados no `CODEOWNERS` precisará revisar e aprovar suas alterações.
5. Após a aprovação e o sucesso da CI, seu Pull Request poderá ser "mergeado" na `main`.

## 🧑‍💻 Equipe (CODEOWNERS)

As seguintes pessoas são responsáveis pela revisão e aprovação de código neste projeto:

- @Koubatz
- @luckasnix
- @Nsingrid
- @jvcorado
- @coelhorafaela