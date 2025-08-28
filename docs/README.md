# VividInvoice API Documentation

This directory contains the OpenAPI 3.0 specification for the VividInvoice API. The documentation is written in YAML format and can be viewed using any OpenAPI-compatible tool.

## Viewing the Documentation

### Online Viewer

You can view the API documentation online using the following tools:

1. [Swagger Editor](https://editor.swagger.io/) - Paste the contents of `openapi.yaml`
2. [ReDoc](https://redocly.github.io/redoc/) - For a more readable documentation experience

### Local Development

To view the documentation locally, you can use one of these methods:

#### Using `http-server`

1. Install `http-server` if you don't have it:
   ```bash
   npm install -g http-server
   ```

2. Serve the docs directory:
   ```bash
   cd docs
   http-server -p 8080
   ```

3. Open `http://localhost:8080` in your browser

## Documentation Structure

- `openapi.yaml` - Main OpenAPI specification file
- `paths/` - Contains endpoint definitions
  - `auth.yaml` - Authentication endpoints
  - `clients.yaml` - Client management endpoints
  - `client-by-id.yaml` - Client-specific operations
  - `invoices.yaml` - Invoice management endpoints
  - `invoice-by-id.yaml` - Invoice-specific operations
  - `current-user.yaml` - Current user information
- `schemas/` - Contains reusable schema definitions
- `parameters/` - Contains reusable parameter definitions

## Adding New Endpoints

1. Add a new file in the `paths/` directory for your endpoint group
2. Reference it in the main `openapi.yaml` file
3. Add any new schemas to the `schemas/` directory
4. Add any new parameters to the `parameters/` directory

## Validating the Documentation

You can validate the OpenAPI specification using the [OpenAPI CLI](https://github.com/Redocly/openapi-cli):

```bash
npx @redocly/cli lint openapi.yaml
```

## Generating Client SDKs

You can generate client SDKs for various languages using [OpenAPI Generator](https://openapi-generator.tech/). For example, to generate a TypeScript client:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o ../frontend/src/api/generated
```

## Versioning

When making breaking changes to the API, update the version number in `openapi.yaml` and consider creating a new version of the documentation.
