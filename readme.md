# Build images without cache
docker-compose build --no-cache

# Start services using the newly built images
docker-compose up

# local env notes:
- shopify app setup > url needs to be set to http://localhost:3000. http://127.0.0.1:3000 will not work since shopify resolves it to its own url
- 