FROM node:lts-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
copy prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build

FROM builder as runner
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma


EXPOSE 3000
CMD ["node", "server.js"]