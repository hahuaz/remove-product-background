
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

# TODO:
- shopify app setup > url needs to be set to http://localhost:3000. http://127.0.0.1:3000 will not work since shopify resolves it to its own url
- 