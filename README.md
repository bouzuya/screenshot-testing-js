# screenshot-testing-js

A screenshot testing tool for JavaScript (Node.js).

## Installation

```sh
npm install @bouzuya/screenshot-testing
```

## Usage

```js
import { execute } from '@bouzuya/screenshot-testing';

const command = process.argv[2]; // 'approve' or 'capture' or 'compare' or 'test'
const options = {
  path: {
    approved: 'approved/',
    captured: 'captured/',
    compared: 'compared/'
  },
  scenarios: [
    {
      action: async (page) => {
        await page.goto('http://example.com');
        return {};
      },
      name: 'scenario1'
    }
  ]
};
execute(command, options);
```

## Badges

[![npm version][npm-badge-url]][npm-url]
[![Travis CI][travisci-badge-url]][travisci-url]

[npm-badge-url]: https://img.shields.io/npm/v/@bouzuya/screenshot-testing.svg
[npm-url]: https://www.npmjs.com/package/@bouzuya/screenshot-testing
[travisci-badge-url]: https://img.shields.io/travis/bouzuya/screenshot-testing-js.svg
[travisci-url]: https://travis-ci.org/bouzuya/screenshot-testing-js

## License

[MIT](LICENSE)

## Author

[bouzuya][user] &lt;[m@bouzuya.net][email]&gt; ([http://bouzuya.net][url])

[user]: https://github.com/bouzuya
[email]: mailto:m@bouzuya.net
[url]: http://bouzuya.net
