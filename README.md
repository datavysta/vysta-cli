# @datavysta/vysta-cli

Command line interface for generating TypeScript models from your Vysta server.

## Installation

```bash
# Install globally
npm install -g @datavysta/vysta-cli

# Or run directly with npx
npx @datavysta/vysta-cli@latest your-domain.com
```

## Usage

The CLI generates TypeScript models from your Vysta server:

```bash
# Generate models from a server
vysta-cli your-server.com

# The CLI will ask:
#   Where should we save the models? (./src/models)
```

### Generated Files

The CLI will generate four files in your specified directory:
- `services.ts` - Service class definitions for your entities
- `types.ts` - TypeScript interfaces for your data schema
- `workflows.ts` - Workflow definitions for your business processes
- `files.ts` - File and asset definitions for your application

### URL Formats

The CLI supports various URL formats:
```bash
# Default (HTTPS)
vysta-cli your-server.com

# Explicit HTTPS
vysta-cli https://your-server.com

# HTTP if required
vysta-cli http://your-server.com

# With port
vysta-cli your-server.com:8080
```

## Development

```bash
# Clone the repository
git clone https://github.com/datavysta/vysta-cli.git

# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Run locally
./dist/index.js your-server.com
```

## License

MIT