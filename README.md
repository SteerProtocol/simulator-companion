# @steerprotocol/simulator-companion

A lightweight HTTP server designed to manage Anvil instances for Steer Protocol simulations. This companion service facilitates the creation, management, and cleanup of EVM environments for testing and simulation purposes.

## Prerequisites

- Node.js >= 14.0.0
- [Anvil](https://github.com/foundry-rs/foundry/tree/master/anvil) installed and available in your PATH

## Features

- HTTP server for managing Anvil instances
- RESTful API endpoints for simulation control
- Cross-origin resource sharing (CORS) support
- Easy integration with Steer Protocol simulation tools

## Installation

```bash
npm install @steerprotocol/simulator-companion
```

## Usage

Start the server:

```bash
npm start
```

This will launch the HTTP server on the default port.

### Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: localhost)

## API Endpoints

Documentation for available endpoints coming soon.

## Dependencies

- Express.js - Web server framework
- CORS - Cross-origin resource sharing middleware

## Development

To start the server in development mode:

```bash
npm start
```

### Publishing

This package is published to npm under the @steerprotocol organization. To publish a new version:

1. Update version: `npm version patch|minor|major`
2. Publish: `npm publish`

Note: You need to be a member of the @steerprotocol organization on npm to publish.

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related

- [Steer Protocol](https://steer.finance/)
- [Anvil](https://github.com/foundry-rs/foundry/tree/master/anvil) - Ethereum node implementation for testing 