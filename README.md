# Petstore Playwright Testing Framework

A comprehensive Playwright testing framework for the Swagger Petstore API, featuring both individual API tests and end-to-end workflow testing.

## 🚀 Features

- **Comprehensive API Testing**: Individual test cases for Pet, Store, and User endpoints
- **E2E Workflow Testing**: Complete business scenarios combining multiple API calls
- **TypeScript Support**: Fully typed API client and test utilities
- **Configurable Environment**: Easy configuration for different environments
- **Detailed Reporting**: HTML, JSON, and JUnit XML reports
- **Parallel Execution**: Tests run in parallel for faster execution
- **Resource Cleanup**: Automatic cleanup of test data after each test

## 📁 Project Structure

```
playwright_dummy/
├── tests/
│   ├── api/                    # Individual API test cases
│   │   ├── pet.spec.ts        # Pet API tests
│   │   ├── store.spec.ts      # Store API tests
│   │   └── user.spec.ts       # User API tests
│   ├── e2e/                   # End-to-end workflow tests
│   │   └── petstore-workflows.spec.ts  # Complete business workflows
│   ├── fixtures/              # Test data and fixtures
│   │   └── test-data.json     # Static test data
│   ├── types/                 # TypeScript type definitions
│   │   └── api.types.ts       # API response types
│   └── utils/                 # Test utilities and helpers
│       ├── api-client.ts      # API client wrapper
│       ├── base-api.ts        # Base test configuration
│       ├── test-data.ts       # Test data generators
│       ├── global-setup.ts    # Global test setup
│       └── global-teardown.ts # Global test teardown
├── playwright.config.ts       # Playwright configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── env.example               # Environment variables template
```

## 🛠️ Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd playwright_dummy
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

4. Set up environment variables:
```bash
cp env.example .env
# Edit .env file with your configuration
```

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### API Tests Only
```bash
npm run test:api
```

### E2E Tests Only
```bash
npm run test:e2e
```

### Run Tests with UI Mode
```bash
npm run test:ui
```

### Run Tests in Headed Mode
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

## 📊 Test Categories

### 1. API Tests (`tests/api/`)

Individual API endpoint testing:

- **Pet API Tests** (`pet.spec.ts`)
  - Create, read, update, delete pets
  - Find pets by status and tags
  - Form data updates
  - Image upload testing

- **Store API Tests** (`store.spec.ts`)
  - Inventory management
  - Order placement and retrieval
  - Order lifecycle management

- **User API Tests** (`user.spec.ts`)
  - User CRUD operations
  - Bulk user creation
  - Authentication (login/logout)
  - User session management

### 2. E2E Tests (`tests/e2e/`)

Complete business workflow testing:

- **Petstore Workflows** (`petstore-workflows.spec.ts`)
  - Complete pet adoption process
  - Multi-pet store management
  - User management with orders
  - Bulk operations
  - Error handling and recovery

## 🔧 Configuration

### Environment Variables

Configure the following variables in your `.env` file:

```env
BASE_URL=https://petstore.swagger.io
API_BASE_PATH=/v2
API_KEY=special-key
TEST_TIMEOUT=30000
RETRY_COUNT=3
```

### Playwright Configuration

The `playwright.config.ts` file includes:

- Multiple browser support (Chrome, Firefox, Safari)
- Parallel execution configuration
- Retry logic for flaky tests
- Multiple reporter formats
- Global setup and teardown

## 📈 Test Data Management

### Dynamic Test Data

The framework includes a `TestDataGenerator` class that creates:
- Random pet data with categories and tags
- User data with valid email and phone formats
- Order data with realistic values
- Boundary and invalid data for negative testing

### Static Test Data

The `tests/fixtures/test-data.json` file contains:
- Sample pets, users, and categories
- API endpoint mappings
- Validation rules and test scenarios
- Boundary values and special characters

## 🛡️ Best Practices

### Test Design
- Each test is independent and can run in isolation
- Automatic cleanup of test data after each test
- Comprehensive error handling and validation
- Clear test descriptions and documentation

### API Testing
- Custom API client with retry logic
- Typed responses for better IDE support
- Configurable timeouts and base URLs
- Detailed assertion helpers

### Data Management
- Random test data generation to avoid conflicts
- Cleanup of created resources after tests
- Support for both valid and invalid test scenarios
- Boundary value testing

## 📝 Reporting

The framework generates multiple report formats:

- **HTML Report**: Interactive report with test results and traces
- **JSON Report**: Machine-readable test results
- **JUnit XML**: For CI/CD integration

Access reports after test execution:
```bash
npx playwright show-report  # HTML report
cat test-results.json       # JSON report
cat test-results.xml        # JUnit XML report
```

## 🔍 Debugging

### Debug Mode
```bash
npm run test:debug
```

### Trace Viewer
Tests automatically capture traces on failure. View them with:
```bash
npx playwright show-trace test-results/trace.zip
```

### Console Logging
The framework includes detailed console logging for:
- Test execution progress
- Performance metrics
- Resource cleanup status
- API response times

## 🚀 CI/CD Integration

The framework is designed for CI/CD environments:

- Configurable retry logic for flaky tests
- Multiple output formats for different CI systems
- Environment-based configuration
- Parallel execution for faster builds

Example GitHub Actions configuration:
```yaml
- name: Run Playwright tests
  run: npm test
- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add appropriate TypeScript types for new features
3. Include both positive and negative test cases
4. Update documentation for new functionality
5. Ensure all tests pass before submitting changes

## 📄 License

MIT License - see LICENSE file for details
