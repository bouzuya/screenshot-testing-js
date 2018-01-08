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

## License

[MIT](LICENSE)

## Author

[bouzuya][user] &lt;[m@bouzuya.net][email]&gt; ([http://bouzuya.net][url])

[user]: https://github.com/bouzuya
[email]: mailto:m@bouzuya.net
[url]: http://bouzuya.net
