# Dockerfile para Furry Friends Agenda Backend

# ---- Estágio de Build ----
FROM node:20-slim AS builder

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Variáveis de ambiente para o Prisma
ENV PRISMA_TELEMETRY_INFORMATION='disable' \
    PRISMA_UPDATE_NOTIFIER='disable'

# Copiar package.json e package-lock.json (ou yarn.lock, etc.)
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build e Prisma)
RUN npm ci

# Copiar todo o código da aplicação
COPY . .

# Gerar o Prisma Client (requer o schema.prisma e as dependências)
# Este passo pode falhar se DATABASE_URL não estiver disponível em tempo de build
# para alguns provedores de banco de dados que o Prisma tenta contatar.
# Para PostgreSQL, geralmente funciona sem uma DATABASE_URL real aqui, pois ele gera baseado no schema.
# Se precisar de uma DATABASE_URL para este passo, ela pode ser passada como build arg.
RUN npx prisma generate

# Fazer o build da aplicação TypeScript para JavaScript
RUN npm run build

# Remover devDependencies para preparar para o estágio de produção
# Isso ajuda a copiar apenas as dependências de produção para o próximo estágio
RUN npm prune --production

# ---- Estágio de Produção ----
FROM node:20-alpine AS runner

# Criar usuário e grupo não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Variáveis de ambiente
ENV NODE_ENV=production
# A PORTA será definida pelo .env ou docker-compose
# A DATABASE_URL será definida pelo .env ou docker-compose
# O JWT_SECRET será definido pelo .env ou docker-compose
# O JWT_EXPIRES_IN será definido pelo .env ou docker-compose

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

# Expor a porta que a aplicação vai rodar (definida no .env ou aqui)
# Este valor deve corresponder à variável de ambiente PORT usada pela sua aplicação
# EXPOSE 3000 # Será exposto pelo docker-compose

# Healthcheck - Certifique-se que sua aplicação tem um endpoint /api/health ou ajuste
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Comando para iniciar a aplicação em modo de produção
# Executa as migrações do Prisma e então inicia a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"] 