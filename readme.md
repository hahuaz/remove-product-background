
## Docker Compose Usage

### 1. Build images without cache
```bash	
docker-compose build --no-cache
```
Building without cache is specially important when you made changes to dependencies for your app. Otherwise, docker will use the cached version and you may end up with errors.

### 2. Start containers

```bash
docker-compose up
```

### how to migrate db that is running in docker container
First of all, you need to create migration files in your host machine (not in docker container) to persist them.

1. reset db
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate reset
```

This will delete all the tables and data in the db. So, we can start from scratch.

2. create a new migration file in your host machine
Following db url for migrating manually on host machine. Since we are in host, we use localhost instead of db container name (postgres).
Providing the DATABASE_URL in the command line is important. Otherwise, prisma will use the DATABASE_URL in .env file which is for docker container automatically and you will end up with errors.

```bash	
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate dev --name test-model
```

This will create migration files in prism/migrations folder and also will populate the db with the new schema.


# TODO:
- shopify app setup > url needs to be set to http://localhost:3000. http://127.0.0.1:3000 will not work since shopify resolves it to its own url
- Backend port should be exposed for shopify to call ouath callback.
./cloudflared.exe tunnel --url http://localhost:3001

