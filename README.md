# Reportizer

Reportizer is a TS/JS library for interacting with the [Report Portal](https://reportportal.io/) API.
Works best with [cucumber-js](https://github.com/cucumber/cucumber-js).

## Contents
- [Reportizer](#reportizer)
  - [Contents](#contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Create item](#create-item)
    - [Finish item](#finish-item)
    - [Add logs to item](#add-logs-to-item)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install reportizer.

```bash
npm install --save-dev reportizer
```

## Usage

Please note, before using this package, you should set up an instance of Report Portal for yourself. A public instance is offered by the Report Portal team for demonstration purposes on [their site](https://reportportal.io/).

### Create item
```typescript
const reportPortalClient = new ReportPortalClient(baseUrl, launchId, authToken);

const itemId = await reportPortalClient.createItem(
    'The one where employees get paid.',
    'Tests the payment process for employees works.',
    'SCENARIO'
);
```

Valid item types can be seen in the [`ItemType` type in this repo](./src/models/index.ts).

### Finish item
Finishing an item automatically maps a [cucumber status](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/56c1ea26b59ed0e4634b1ba27096ab3b90371875/types/cucumber/index.d.ts#L14) to a Report Portal status. Inspect the [`ReportPortalClient` class in this repo](./src/index.ts) if you want to know how the statuses are mapped.

```typescript
await reportPortalClient.finishItem(
    itemId,
    Status.PASSED
);
```
Alternatively, as part of a cucumber `After` hook:
```typescript
After(async function({ result }) {
    await reportPortalClient.finishItem(
        itemId,
        result.status
    );
});
```

### Add logs to item
```typescript
await reportPortalClient.addLogToItem(
    itemId,
    'info',
    'This is a log message!'
);
```
Valid log levels can be seen in the [`LogLevel` type in this repo](./src/models/index.ts).

## Contributing
See [the contributing guidelines](./CONTRIBUTING.md).

## License
[Apache-2.0](https://choosealicense.com/licenses/apache-2.0/)