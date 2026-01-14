FROM node:22-alpine AS base

WORKDIR /workspace

RUN apk add --no-cache bash git
RUN echo "export PS1='\w # '" >> ~/.bashrc

RUN corepack enable && corepack use pnpm@latest-10
RUN echo "export CMD=\"node /workspace/dist/bin/index.cjs --pnpm --verbose\"" >> ~/.bashrc

COPY csd.sh /usr/local/bin/csd

COPY package.json pnpm-lock.yaml /workspace/
RUN pnpm install --frozen-lockfile

ENTRYPOINT ["bash"]
