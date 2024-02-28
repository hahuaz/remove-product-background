FROM node:18

# go inside frontend and backend directories and install dependencies. they have both package.json files

WORKDIR /app/frontend
COPY /frontend/package.json /app/frontend/package.json
RUN npm install

WORKDIR /app/backend
COPY /backend/package.json /app/backend/package.json
# copy prisma
COPY /backend/prisma /app/backend/prisma/
RUN npm install

# copy the rest of the files
WORKDIR /app
COPY . .

# go inside backend and run the server
WORKDIR /app/backend
# since we are using docker-compose for port mapping, we don't need to expose the ports here but it's good to have it here for easier understanding
EXPOSE 3001
EXPOSE 6666

CMD ["npm", "run", "dev"]