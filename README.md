# Mod20 API

Express.js backend API server for the Mod20 gaming system management platform.

## Overview

A robust Node.js API server built with Express and TypeScript, providing RESTful endpoints for managing tabletop gaming systems, character races, roles, traits, and media assets. Features comprehensive CRUD operations, image processing, and MongoDB integration with Mongoose ODM.

## Tech Stack

- **Runtime**: Node.js with TypeScript compilation
- **Framework**: Express.js for HTTP server and routing
- **Database**: MongoDB with Mongoose ODM
- **Image Processing**: Sharp for image optimization and resizing
- **File Upload**: Multer for multipart form handling
- **Type Safety**: Shared types from @mod20/types package
- **Build**: TypeScript compiler with watch mode for development

## Project Structure

### Core Directories

```
├── controllers/         # Request handlers and business logic
├── models/             # Mongoose schemas and data models
├── routes/             # Express route definitions
├── utils/              # Utility functions and helpers
├── public/             # Static file serving (images, media)
│   └── img/media/      # Processed image storage
├── app.ts              # Express application setup
├── app.js              # Compiled JavaScript entry point
└── package.json        # Dependencies and scripts
```

## Key Features

### RESTful API Design
- **Resource-Based**: Clear URL patterns following REST conventions
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **Status Codes**: Appropriate HTTP status code responses
- **Error Handling**: Comprehensive error handling with custom error classes

### Database Integration
- **MongoDB**: Document-based storage for flexible gaming content
- **Mongoose ODM**: Schema validation and relationship management
- **Population**: Automatic relationship resolution for related entities
- **Indexing**: Optimized queries with proper database indexing

### Image Processing Pipeline
- **Sharp Integration**: High-performance image processing
- **Multiple Variants**: Automatic generation of background and gallery sizes
- **File Management**: Organized storage with timestamp-based naming
- **Metadata Tracking**: Complete image metadata and processing information

### Comprehensive CRUD Operations
- **Systems**: Create, read, update, delete game systems
- **Races**: Manage character races with speed attributes and traits
- **Roles**: Handle character classes with abilities and proficiencies
- **Traits**: Create reusable character features with ordering
- **Media**: Upload, process, and serve image assets

## Build and Development

### Development Commands
```bash
npm run dev          # Start development server with ts-node
npm run build        # Compile TypeScript to JavaScript
npm run watch        # TypeScript watch mode compilation
npm start           # Run compiled JavaScript server
```

### Critical Build Requirements
⚠️ **MANDATORY**: Run `npm run build` after ANY changes to `.ts` files

The server runs compiled JavaScript (.js files), not TypeScript directly. Without building:
- TypeScript changes will NOT take effect
- New schema fields won't appear in API responses
- Server restart alone is insufficient

## Related Repositories

- **mod20_client**: React frontend that consumes this API
- **mod20_types**: Shared TypeScript type definitions

## Contributing

### Development Workflow
1. Make changes to TypeScript files (`.ts`)
2. Run `npm run build` to compile changes
3. Restart the server to load new JavaScript
4. Test API endpoints with updated functionality
5. Ensure all relationships and populate queries work correctly
