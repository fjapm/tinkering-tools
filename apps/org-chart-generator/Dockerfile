# Dev/test image for JavaScript & Next.js projects.
# Not production-grade: installs full deps (incl. devDependencies) and runs
# `next dev` / whatever "dev" script the project defines.
#
# Build (run from inside the app directory, i.e. the one with package.json):
#   docker build -t myapp-dev .
# Run with live-reload by bind-mounting your source:
#   docker run --rm -it -p 3000:3000 -v "$PWD":/app -v /app/node_modules -v /app/.next myapp-dev

FROM node:22-slim

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install deps first so this layer is cached unless manifests change.
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy the rest of the source. When bind-mounting for local dev this gets
# overridden by the volume anyway.
COPY . .

EXPOSE 3000

# Override with `docker run ... myapp-dev pnpm test` etc. for one-off test runs.
CMD ["pnpm", "dev"]
