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
            if (name === 'on') {
              Object
                .keys(value)
                .map((eventName) => ({ eventName, listener: value[eventName] }))
                .forEach(({ eventName, listener }) => {
                  e.addEventListener(eventName, listener);
                });
            } else {
              e.setAttribute(name, value);
            }
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
      const view = ({ allCount, details, failedCount, passedCount }, { click }) => {
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
            h('ul', {}, details.map((detail) => {
              const { comparedUrl, name, type } = detail;
              return h('li', {}, [
                h('div', { class: 'detail', on: { click: click(detail) } }, [
                  h('header', {}, [
                    h('div', { class: 'name' }, [name]),
                    h('div', { class: 'type' }, [type]),
                  ]),
                  h('div', { class: 'body' }, [
                    h('img', { class: 'compared', src: comparedUrl }, [])
                  ])
                ])
              ]);
            }))
          ]),
          h('div', { class: 'dialog-container' }, [])
        ]);
      };

      const close = () => {
        const dialog = document.querySelector('.dialog');
        dialog.classList.remove('is-visible');
        setTimeout(() => {
          const container = document.querySelector('.dialog-container');
          while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
          }
        }, 300);
      };
      const click = (detail) => {
        return (event) => {
          const { approvedUrl, capturedUrl, name, type } = detail;
          const dialog = h('div', { class: 'dialog' }, [
            h('div', { class: 'dialog-overlay' }, [
              h('div', { class: 'dialog-window' }, [
                h('header', {}, [
                  h('div', { class: 'name' }, [name]),
                  h('div', { class: 'type' }, [type]),
                  h('button', { class: 'close', on: { click: close } }, ['X'])
                ]),
                h('div', { class: 'body' }, [
                  h('div', { class: 'left' }, [
                    h('div', { class: 'image' }, [
                      h('img', { class: 'approved', src: approvedUrl }, []),
                    ]),
                    h('div', { class: 'label' }, ['Approved'])
                  ]),
                  h('div', { class: 'right' }, [
                    h('div', { class: 'image' }, [
                      h('img', { class: 'captured', src: capturedUrl }, [])
                    ]),
                    h('div', { class: 'label' }, ['Captured'])
                  ])
                ])
              ])
            ])
          ]);
          const container = document.querySelector('.dialog-container');
          while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
          }
          container.appendChild(dialog);
          setTimeout(() => dialog.classList.add('is-visible'), 100);
        };
      };
      const root = view(ScreenshotTesting, { click });
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
    .root > .dialog-container > .dialog > .dialog-overlay {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      background-color: rgba(0, 0, 0, 0.3);
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window {
      background-color: #fff;
      border: 2px solid #000;
      box-sizing: border-box;
      height: 96%;
      left: 2%;
      position: absolute;
      top: -100%;
      transition: top 0.3s ease;
      width: 96%;
    }
    .root > .dialog-container > .dialog.is-visible > .dialog-overlay > .dialog-window {
      top: 2%;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header {
      box-sizing: border-box;
      height: 64px;
      padding: 8px 0 0 0;
      text-align: center;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .name,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .type {
      padding: 0 8px;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .close {
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      border: 2px solid #000;
      background-color: transparent;
      cursor: pointer;
      font-weight: bold;
      font-size: 100%;
      height: 40px;
      padding: 0;
      position: absolute;
      right: 8px;
      text-align: center;
      top: 8px;
      width: 40px;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .close:focus,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .close:hover {
      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .close:active {
      box-shadow: unset;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 64px;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .left,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .right {
      background-color: #fff;
      height: 100%;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .left {
      background-color: #fcc;
      border-right: 2px solid #000;
      width: 50%;
      z-index: 10;
      resize: horizontal;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .right {
      background-color: #ccf;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .left > .image,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .right > .image {
      -moz-user-select: none;
      display: flex;
      height: 100%;
      justify-content: center;
      user-select: none;
      width: 96vw; /* ignore parent width */
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .left > .image > img,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .right > .image > img {
      object-fit: contain;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .left > .label,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .right > .label {
      display: inline-block;
      font-size: 90%;
      padding: 8px;
      position: absolute;
      top: 0;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .left > .label {
      left: 0;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .right > .label {
      right: 0;
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
  const reportDirPath = pathJoin(compared, 'report');
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
        pathJoin(compared, 'screenshots', scenario.name + '.png')
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
