# :books: MyFlowchart

## :thinking: O que é?

MyFlowchart é uma aplicação na qual estudantes podem ter um controle mais dinâmico das disciplinas de seu curso, através de status (a fazer, fazendo, feita), anotações sobre a disciplina, e também o compartilhamento de seu fluxograma para que outras pessoas possam acompanhar.

## :gear: Como Instalar

Tendo o Node.js, o Docker e o Docker-Compose instalados, para executar uma instância própria do MyFlowchart, basta ir até a pasta `api/` e configurar as variáveis de ambiente para o Back-End do projeto. Isso pode ser feito criando uma cópia do arquivo `.env.example` chamada `.env`, e substituindo os dados de exemplo pelos dados que você quer para o projeto.

Após isso, podemos executar os seguintes commandos:

```console
foo@bar:~$ npm install
foo@bar:~$ npm run dev
```

Em seguida, em uma aba diferente do terminal, se dirija até a pasta `web/` e execute os seguintes comandos:

```console
foo@bar:~$ npm install
foo@bar:~$ npm start
```

Feito! Agora você pode testar a aplicação em `http://localhost:3000` :partying_face:
