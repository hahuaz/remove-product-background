
## Docker Compose Usage

### 1. Build images without cache
```bash	
docker-compose build --no-cache
```
The --no-cache flag is important when you made changes to dependencies for your app. Otherwise, docker will use the cached version and you may end up with errors.

### 2. Start containers

```bash
docker-compose up --force-recreate
```

The --force-recreate is important flag to use when you want to recreate containers from scratch. Otherwise, docker will use the cached version and you may end up with errors due to stalled dependencies.

## how to migrate db that is running in docker container
First of all, you need to create migration files in your host machine (not in docker container) to persist them.

### 1. reset db
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate reset
```

This will delete all the tables and data in the db. So, we can start from scratch.

### 2. create a new migration file in your host machine
Following db url for migrating manually on host machine. Since we are in host, we use localhost instead of db container name (postgres).
Providing the DATABASE_URL in the command line is important. Otherwise, prisma will use the DATABASE_URL in .env file which is for docker container automatically and you will end up with errors.

```bash	
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate dev --name test-model
```

This will create migration files in prism/migrations folder and also will populate the db with the new schema.

## OAuth is responsibility of the app
Shopify will redirect user to your root url without any additional path. It will provide necessary query params such as hmac, host, shop, timestamp for you to validate the request.
It's app's responsibility to redirect the user to Shopify's oauth page if shop is not authorized yet. Otherwise, it should serve the app.

For example, shopify-node-starter template uses `ensureInstalledOnShop` function provided by @shopify-api as a middleware before serving the app to ensure that shop is authorized.



# TODO:


- Backend port should be exposed for shopify to call ouath callback.
./cloudflared.exe tunnel --url http://localhost:3001

## Shopify App Setup
- If you don't have reserved domain and use free plan, tunnel adresses will change on restart. So you always need to set URL of your app again on app setup as well as .env file.
- Shopify won't allow you to work with http protocol. For example, if you set oauth callback url that uses http, it will ignore it and switch to https and your flow will fail.
- You can't redirect the client to different URL. Doing so will throw error because AppBridge checks the URL of the app that resides in app setup against the redirected URL. So in your design system, work with only one entry point to the app.
- 