FROM oven/bun

WORKDIR /app

COPY . .

RUN bun install 

EXPOSE 3001

CMD ["bun", "run", "dev"]
