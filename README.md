# @datavysta/vysta-cli

Command line interface for generating TypeScript models from your Vysta server.

## Installation

```bash
# Install globally
npm install -g @datavysta/vysta-cli

# Or run directly with npx
npx @datavysta/vysta-cli generate your-server.com
```

## Usage

The CLI provides commands to generate TypeScript models from your Vysta server:

```bash
# Generate models from a server
vysta-cli generate your-server.com

# The CLI will ask:
#   Where should we save the models? (./src/models)
```

### Generated Files

The CLI will generate two files in your specified directory:
- `services.ts` - Service class definitions for your entities
- `types.ts` - TypeScript interfaces for your data schema

### URL Formats

The CLI supports various URL formats:
```bash
# Default (HTTPS)
vysta-cli generate your-server.com

# Explicit HTTPS
vysta-cli generate https://your-server.com

# HTTP if required
vysta-cli generate http://your-server.com

# With port
vysta-cli generate your-server.com:8080
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
./dist/index.js generate your-server.com
```

## License

MIT