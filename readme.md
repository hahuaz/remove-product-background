
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

## How to run prisma migration manually in host machine
First of all, you need to create migration files in your host machine (not in docker container) to persist them.

### 1. Reset the db
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate reset
```

This will delete all the tables and data in the db. So, we can start from scratch. 

Be aware that localhost is used instead of db container name (postgres) since we are in host machine terminal. Providing the DATABASE_URL in the command line is important. Otherwise, prisma will use the DATABASE_URL in .env file which is for docker container automatically and you will end up with errors.

### 2. Create migration files

```bash	
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public" npx prisma migrate dev --name test-model
```

This will create migration files in prism/migrations folder and also will populate the db with the new schema.


## Shopify Oauth Flow
1. Shopify will redirect user to app root url without any additional path. It will provide necessary query params such as hmac, host, shop, timestamp for you to validate the request.
It's app's responsibility to redirect the user to Shopify's oauth consent screen if shop is not authorized yet. Otherwise, it should serve the app.
2. Shopify API doesn't save any info in session storage about oauth in oauth begin. It uses secure cookies to verify the nonce to prevent CSRF attacks. It has no alternative since it didn't save any info in session storage in oauth begin. it implements safe compare, etc. to increase security. So it's good idea to use shopify api for oauth process. You can see the implementation in [here](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/lib/auth/index.ts).
3. At the end of oauth callback, it saves session in session storage with access token, shop name, etc.
4. If the app is installed in store on shopify side but somehow you lost the session in your db, user won't go through oauth consent again. Your app will redirect user to consent screen but Shopify will handle oauth process under the hood and will call your oauth callback url so you can save the session in your db again.
5. You need to expose your backend port to world to go through oauth process since Shopify forces to use https. Vscode port forwarding is good choice since it gives you a random URL that won't change on restart. It releases you from the burden that setting the URL of your app in both app setup of shopify partners dashboard and .env file. 
6. You can't redirect the client to different URL. Doing so will throw error because AppBridge checks the URL of the app that resides in app setup against the redirected URL. So in your design system, work with only one entry point to the app.

# TODO:
