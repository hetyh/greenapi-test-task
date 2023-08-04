# greenapi-test-task

## Local deployment

```bash
pnpm i          # npm works as well
pnpm run start  # starts services
pnpm run stop   # stops services
pnpm run delete # delete services
```

## Routes

Method | Path  | Description     
-------|-------|------------------
GET    | /time | Gets current time

## Enviroment variables

Variable         | Description
-----------------|-----------------------------------------
RABBIT_MQ_URL    | URL path for the RabbitMQ message broker
HTTP_SERVER_PORT | Port for HTTP server listener

