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

### Tag Filtering

You can filter resources by tags using the `--tag` option. This is useful for generating models for specific environments, departments, or any other criteria you've tagged your resources with.

```bash
# Filter by a single tag
vysta-cli your-server.com --tag Department=IT

# Filter by multiple tags (AND logic)
vysta-cli your-server.com --tag Department=IT --tag Environment=Production

# Filter with spaces in values (use quotes)
vysta-cli your-server.com --tag "Department=IT Support"

# Filter with special characters
vysta-cli your-server.com --tag "Project=Web App 2.0" --tag "Team Lead=john@company.com"

# Combine with output directory
vysta-cli your-server.com --tag Environment=Production --output ./src/models
```

#### How Tag Filtering Works

When you specify tags, the CLI adds query parameters to all API endpoints:
- `--tag Department=IT` becomes `?tags.Department=eq.IT`
- `--tag Env=Prod --tag Region=US` becomes `?tags.Env=eq.Prod&tags.Region=eq.US`

All tag values are treated as equality matches. The filters are applied to all generated files (services, types, workflows, and files).

#### Examples

```bash
# Generate models only for IT department resources
vysta-cli your-server.com --tag Department=IT

# Generate models for production environment in Canada
vysta-cli your-server.com --tag Environment=Production --tag Region=Canada

# Generate models for a specific project
vysta-cli your-server.com --tag "Project Name=Mobile App"
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