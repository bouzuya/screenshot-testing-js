import * as fs from 'fs-extra';
import { join as pathJoin, relative as pathRelative } from 'path';
import { Options } from '../data/options';
import { Scenario } from '../data/scenario';
import { CompareScenarioResult } from './compare-scenario';

interface ViewData {
  allCount: number;
  details: Array<{
    approvedUrl: string | null;
    capturedUrl: string | null;
    comparedUrl: string | null;
    name: Scenario['name'];
    type: CompareScenarioResult['type'];
  }>;
  failedCount: number;
  passedCount: number;
}

const html = (scriptPath: string): string => {
  return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <title>screenshot-testing-js Report</title>
  <script src="${scriptPath}"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // createElement
      const h = (name, attrs, children) => {
        const e = document.createElement(name);
        Object
          .keys(attrs)
          .map((name) => ({ name, value: attrs[name] }))
          .forEach(({ name, value }) => {
            e.setAttribute(name, value);
          });
        children.forEach((child) => {
          if (typeof child === 'undefined' || child === null) {
            // do nothing
          } else if (typeof child === 'number') {
            e.appendChild(document.createTextNode(String(child)));
          } else if (typeof child === 'string') {
            e.appendChild(document.createTextNode(child));
          } else {
            e.appendChild(child);
          }
        });
        return e;
      };
      const view = ({ allCount, details, failedCount, passedCount }) => {
        return h('div', { class: 'root' }, [
          h('div', { class: 'summary' }, [
            h('div', { class: 'tests' }, [
              h('span', { class: 'value' }, [allCount]),
              h('span', { class: 'unit' }, ['tests'])
            ]),
            h('div', { class: 'passed' }, [
              h('span', { class: 'value' }, [passedCount]),
              h('span', { class: 'unit' }, ['passed'])
            ]),
            h('div', { class: 'failed' }, [
              h('span', { class: 'value' }, [failedCount]),
              h('span', { class: 'unit' }, ['failed'])
            ])
          ]),
          h('div', { class: 'details' }, [
            h('ul', {}, details.map(({ comparedUrl, name, type }) => {
              return h('li', {}, [
                h('div', { class: 'detail' }, [
                  h('header', {}, [
                    h('div', { class: 'name' }, [name]),
                    h('div', { class: 'type' }, [type]),
                  ]),
                  h('div', { class: 'body' }, [
                    h('img', { src: comparedUrl }, [])
                  ])
                ])
              ]);
            }))
          ])
        ]);
      };

      const root = view(ScreenshotTesting);
      const body = document.querySelector('.body');
      body.appendChild(root);
    });
  </script>
  <style>
    html, body, h1 {
      margin: 0;
      padding: 0;
    }
    body > header > h1 {
      margin: 0;
      padding: 0;
      text-align: center;
    }
    body > .body > .root {
    }
    .root > .summary {
      padding: 8px;
      text-align: center;
    }
    .root > .summary > .tests,
    .root > .summary > .passed,
    .root > .summary > .failed {
      display: inline;
      padding: 8px;
    }
    .root > .summary > .tests > .unit,
    .root > .summary > .passed > .unit,
    .root > .summary > .failed > .unit {
      padding: 8px;
    }
    .root > .details > ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      list-style-type: none;
      margin: 0;
      padding: 0;
    }
    .root > .details > ul > li {
      padding: 8px;
    }
    .root > .details > ul > li > .detail {
      border: 2px solid #000;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      padding: 8px;
    }
    .root > .details > ul > li > .detail:focus,
    .root > .details > ul > li > .detail:hover {
      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    }
    .root > .details > ul > li > .detail:active {
      box-shadow: unset;
    }
    .root > .details > ul > li > .detail > header {
      padding-bottom: 8px;
      text-align: center;
    }
    .root > .details > ul > li > .detail > .body {
      display: flex;
      height: 320px;
      width: 320px;
    }
    .root > .details > ul > li > .detail > .body > img {
      object-fit: contain;
    }
  </style>
</head>

<body>
  <header>
    <h1>screenshot-testing-js report</h1>
  </header>
  <div class="body">
  </div>
  <footer>
  </footer>
</body>

</html>
`;
};

const js = (viewData: any): string => {
  return `window.ScreenshotTesting = ${JSON.stringify(viewData)};`;
};

const generateReport = (
  {
    path: { approved, captured, compared }
  }: Options,
  results: Array<{
    result: CompareScenarioResult;
    scenario: Scenario;
  }>
): Promise<void> => {
  const reportDirPath = '.tmp/report/';
  const reportHtmlPath = pathJoin(reportDirPath, 'report.html');
  const reportJsPath = pathJoin(reportDirPath, 'report.js');
  const viewData: ViewData = {
    allCount: results.length,
    details: results.map(({ result, scenario }) => {
      const approvedPath = pathRelative(
        reportDirPath,
        pathJoin(approved, scenario.name + '.png')
      );
      const capturedPath = pathRelative(
        reportDirPath,
        pathJoin(captured, scenario.name + '.png')
      );
      const comparedPath = pathRelative(
        reportDirPath,
        pathJoin(compared, scenario.name + '.png')
      );
      const approvedUrl =
        result.type === 'no_captured' || result.type === 'no_approved'
          ? null
          : approvedPath;
      const capturedUrl =
        result.type === 'no_captured'
          ? null
          : capturedPath;
      const comparedUrl =
        result.type === 'no_captured' ||
          result.type === 'no_approved' ||
          result.type === 'not_same_dimension'
          ? null
          : result.type === 'same'
            ? approvedPath
            : comparedPath;
      return {
        approvedUrl,
        capturedUrl,
        comparedUrl,
        name: scenario.name,
        type: result.type
      };
    }),
    failedCount: results.filter((i) => i.result.type !== 'same').length,
    passedCount: results.filter((i) => i.result.type === 'same').length
  };
  return Promise.all([
    fs.outputFile(reportHtmlPath, html(pathRelative(reportDirPath, reportJsPath))),
    fs.outputFile(reportJsPath, js(viewData))
  ]).then(() => void 0);
};

export { generateReport };
