FROM node:12-slim
LABEL description="Pet Shelter image"

USER root
WORKDIR /pet-shelter

COPY package.json package-lock.json ./
COPY src/ ./src

RUN npm ci --only=prod --no-audit

EXPOSE 8080

CMD node src/app.js
