# @datavysta/vysta-cli

Command line interface for generating TypeScript models from your Vysta server.

## Installation

```bash
# Install globally
npm install -g @datavysta/vysta-cli

# Or run directly with npx
npx @datavysta/vysta-cli your-server.com
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

The CLI will generate three files in your specified directory:
- `services.ts` - Service class definitions for your entities (preserves your custom methods when regenerating)
- `types.ts` - TypeScript interfaces for your data schema
- `workflows.ts` - Workflow definitions for your business processes

### Custom Methods

When regenerating services, the CLI will preserve any custom methods you've added to your service classes. This allows you to extend the generated services with your own functionality without losing changes on subsequent generations.

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