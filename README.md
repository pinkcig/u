# 🔖 u

Minimalistic URL shortener as a microservice.  
Also Klein's successor.

# 🔨 stack

-   Node.js
    -   TypeScript
    -   Express
    -   Prisma
-   PostgreSQL
-   Redis
-   Docker

# 🐋 docker

Modify the `.env` to have the correct hostnames

Run `yarn dev:docker` to start the development environment.  
`docker exec -it <PLACEHOLDER> /bin/sh` to enter the container, then run `yarn prisma generate` and `yarn prisma migrate dev` to create the database.

Run `docker build -t u .` to start the production environment.

# 📚 might do

-   Switch to [tsup](https://tsup.egoist.sh/)
-   Make database agnostic(?)
