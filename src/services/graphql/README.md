# GraphQL Layer

This folder contains the shared GraphQL infrastructure and feature modules.

## Core modules

- `client.ts`: endpoint resolution and GraphQL client caching.
- `auth.ts`: token/header providers and auth session helpers.
- `errors.ts`: normalized GraphQL error model.
- `requester.ts`: shared request execution with middleware-style hooks.

## Feature modules

Each feature follows a simple structure:

- `*.queries.ts`: GraphQL operations only.
- `*.types.ts`: request/response domain types.
- `*.service.ts`: use-case focused API functions.
- `use*.ts`: React hooks that consume feature services.

## OAuth extension point

Register your OAuth provider once:

```ts
import { setGraphQLTokenProvider } from "@/services/graphql/auth";

setGraphQLTokenProvider({
  getAccessToken: async () => tokenManager.getAccessToken(),
  refreshAccessToken: async () => tokenManager.refreshAccessToken(),
});
```

No feature service changes are needed because services call the shared `requestGraphQL` function.

