# tests/cypress/Dockerfile

FROM cypress/included:12.2.0

WORKDIR /e2e

# 1) Csak a csomagolt fájlok (ez gyorsítja a build cache-t)
COPY package.json package-lock.json ./
RUN npm ci

# 2) Az összes többi fájl beemelése:
COPY . .

# 3) Tesztek futtatása
ENTRYPOINT ["npx", "cypress", "run"]
