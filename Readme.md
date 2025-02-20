# DBS2

Credit project for DBS2 course at FIM UHK. Backend created with [NestJS](https://nestjs.com/) with PostgreSQL database, frontend using [Astro](https://astro.build/) and [Shadcn UI ](https://ui.shadcn.com/).

To start dev DB run

```shell
cd be/docker
docker compose up
```

To develop BE locally run

```shell
cd be
yarn
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
yarn start:dev
```

Swagger UI should is availible on [http://localhost:3000/docs](http://localhost:3000/docs), OpenAPI json on [http://localhost:3000/docs-json](http://localhost:3000/docs-json)

To develop FE locally run

```shell
cd fe
yarn
cp .env.example .env
yarn dev
```
