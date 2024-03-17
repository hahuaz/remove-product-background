
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

## How to sync the schema changes that are made by PostgreSQLSessionStorage into the migration files


First of all, you need to create migration files in your host machine (not in docker container) to persist them. So make sure you are in host terminal.

### 1. Reset the database
Below command will delete all the tables and data in the database. So, we can start from scratch. 

```bash
cd backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate reset
```


Be aware that `localhost` is used instead of database container name (postgres) since we are in host terminal. Providing the DATABASE_URL in the command line is important. Otherwise, prisma would automatically use the DATABASE_URL in .env file which is for docker container  and you will end up with errors.

### 2. Start the app and create models from the drift

```bash
cd ..
docker-compose up --force-recreate
```

When app is started PostgreSQLSessionStorage will create the necessary table for sessions. After that, you can use below command to pull the schema changes that are made by PostgreSQLSessionStorage into the schema.prisma file and create models for them.

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma db pull
```

### 3. Create migration files with the name of introspected_change

Below comand will create migration files in prisma/migrations folder.

```bash	
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate dev --name introspected_change
```

### 4. Remove the container and app image and restart the docker-compose


```bash
docker-compose down
docker rmi remove-product-background-app
docker-compose up --force-recreate
```

## Shopify Oauth Flow
1. Shopify will redirect user to app root url without any additional path. It will provide necessary query params such as hmac, host, shop, timestamp for you to validate the request.
It's app's responsibility to redirect the user to Shopify's oauth consent screen if shop is not authorized yet. Otherwise, it should serve the app.
2. Shopify API doesn't save any info in session storage about oauth in oauth begin. It uses secure cookies to verify the nonce to prevent CSRF attacks. It implements safe compare, etc. to increase security. So it's good idea to use shopify api for oauth process. You can see the implementation in [here](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/lib/auth/index.ts).
3. At the end of oauth callback, it saves session in session storage with access token, shop name, etc.
4. If the app is installed in store on shopify side but somehow you lost the session in your db, user won't go through oauth consent again. Your app will redirect user to consent screen but Shopify will handle oauth process under the hood and will call your oauth callback url so you can save the session in your db again.
5. You need to expose your backend port to world to go through oauth process since Shopify forces to use https. Vscode port forwarding is good choice since it gives you a random URL that won't change on restart. It releases you from the burden that setting the URL of your app in both app setup of shopify partners dashboard and .env file. 
6. You can't redirect the client to different URL. Doing so will throw error because AppBridge checks the URL of the app that resides in app setup against the redirected URL. So in your design system, work with only one entry point to the app.
7. PostgreSQLSessionStorage class will be used to manage sessions. You don't need to create models or anything. It will create the necessary table when app is started.

# TODO:
