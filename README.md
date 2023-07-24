# Rancher ECP QA Cypress Library

[![Unit tests](https://github.com/rancher-sandbox/rancher-ecp-qa/actions/workflows/unit-tests.yaml/badge.svg?branch=main)](https://github.com/rancher-sandbox/rancher-ecp-qa/actions/workflows/unit-tests.yaml)

This npm package includes functions and custom Cypress commands shared between different Rancher products.

## Installation
Installation can be done with CLI:

```bash
npm install @rancher-ecp-qa/cypress-library
```

Or you can add the package to your package.json file:

```json
  "dependencies": {
    "@rancher-ecp-qa/cypress-library": "1.0.0"
  }
```

## Configuration

For Cypress configuration, I add this line to the  `e2e.ts` file:

```typescript
require('@rancher-ecp-qa/cypress-library');
```

The `tsconfig.json` file must be also updated with the new package:

```json
    "types": [
      "@types/node",
      "@nuxt/types",
      "cypress",
      "cy-verify-downloads",
      "@rancher-ecp-qa/cypress-library",
      "cypress-file-upload"
    ]
```

Finally, import the package in your Cypress spec file where you want to use it:

```typescript
import * as cypressLib from '@rancher-ecp-qa/cypress-library';`
```