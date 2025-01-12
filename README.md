# VOX POLLPULI

## Membros do Grupo
- André Alves de Souza Barros
- Ramiro Noronha Reis Ribeiro

## Explicação do Sistema
O VOX POLLPULI é um sistema de enquetes que permite aos usuários criar, votar e visualizar resultados de enquetes. Na etapa atual, foi implementado o back-end do projeto. 

### Funcionalidades Principais
- **Criação de Enquetes**: Usuários autenticados podem criar enquetes, especificando título, descrição, opções de voto e data de expiração.
- **Votação em Enquetes**: Usuários podem votar nas enquetes disponíveis, desde que a enquete haja expirado.
- **Visualização de Resultados**: Resultados das enquetes são apresentados em tempo real, mostrando a quantidade de votos para cada opção.
- **Comentários**: Usuários podem adicionar comentários às enquetes, promovendo discussões e interações.
- **Gerenciamento de Usuários**: Funções de registro, login e gerenciamento de perfis de usuários.

## Tecnologias Utilizadas
- **Node.js**: Utilizado como ambiente de execução do JavaScript no servidor, escolhido por sua eficiência e capacidade de lidar com um grande número de conexões simultâneas.
- **Express.js**: Framework para Node.js que facilita a criação de APIs RESTful, escolhido por sua simplicidade e flexibilidade.
- **MySQL**: Banco de dados relacional utilizado para armazenar informações das enquetes, votos e usuários, escolhido por sua robustez e desempenho.
- **TypeScript**: Linguagem de programação que adiciona tipagem estática ao JavaScript, escolhida para melhorar a qualidade do código e facilitar a manutenção.
- **Jest**: Framework de testes utilizado para garantir a qualidade e a confiabilidade do código, escolhido por sua facilidade de uso e integração com TypeScript.
- **Supertest**: Biblioteca utilizada para testar APIs HTTP, escolhida por sua compatibilidade com Jest e facilidade de uso.
- **Docker**: Utilizado para containerização da aplicação, facilitando o desenvolvimento, teste e implantação em diferentes ambientes.
- **act**: Utilizado para testar os workflows do github antes de subir as alterações dele.
