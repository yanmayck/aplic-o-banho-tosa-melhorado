# Dockerfile para Furry Friends Agenda Backend

# ---- Estágio de Build ----
FROM node:20-slim AS builder

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Variáveis de ambiente para o Prisma
ENV PRISMA_TELEMETRY_INFORMATION='disable' \
    PRISMA_UPDATE_NOTIFIER='disable'

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências.
# Adicionar openssl para resolver o aviso do Prisma sobre libssl/openssl.
RUN apt-get update && apt-get install -y openssl --no-install-recommends
RUN npm ci

# Copiar TODO o código da aplicação (incluindo a pasta prisma/schema.prisma) AGORA
COPY . .

# Gerar o Prisma Client (agora o schema.prisma está presente)
RUN npx prisma generate

# Fazer o build da aplicação TypeScript para JavaScript
RUN npm run build

# Remover devDependencies para preparar para o estágio de produção
# Isso ajuda a copiar apenas as dependências de produção para o próximo estágio
RUN npm prune --production

# ---- Estágio de Produção ----
FROM node:20-alpine AS runner

# Instalar curl para o healthcheck
RUN apk add --no-cache curl

# Criar usuário e grupo não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Variáveis de ambiente
ENV NODE_ENV=production

# Copiar schema.prisma para o diretório de produção (Prisma Client precisa dele em runtime)
COPY --from=builder /usr/src/app/prisma ./prisma

# Mudar propriedade dos arquivos para o usuário não-root antes de copiar o resto
# É importante que o WORKDIR exista e seja propriedade do novo usuário
RUN mkdir -p ./node_modules/.prisma/client ./dist ./node_modules && chown -R appuser:appgroup /usr/src/app
COPY --from=builder --chown=appuser:appgroup /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copiar os artefatos de build (dist) do estágio builder
COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist ./dist

# Copiar as dependências de produção do estágio builder
COPY --from=builder --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules

# Copiar package.json (alguns frameworks ou ferramentas podem precisar dele)
COPY --chown=appuser:appgroup package.json .

# Mudar para usuário não-root
USER appuser

# Healthcheck - Certifique-se que sua aplicação tem um endpoint /api/health ou ajuste
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-3000}/api/health || exit 1

# Comando para iniciar a aplicação em modo de produção
# Executa as migrações do Prisma e então inicia a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]