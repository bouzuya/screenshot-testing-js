import * as fs from 'fs-extra';
import open = require('open');
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
    stats: string;
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
            } else if (value !== null) {
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
      // create view
      const view = (
        {
          filter,
          filterFn,
          results: { allCount, details, failedCount, passedCount }
        },
        { closeDialog, filterAll, filterFailed, filterPassed, openDialog }
      ) => {
        return h('div', { class: 'root' }, [
          h('div', { class: 'summary' }, [
            h('div', {
              class: 'tests' + (filter === 'all' ? ' current' : '')
            }, [
              h('span', {
                class: 'value',
                on: { click: filterAll() }
              }, [allCount]),
              h('span', { class: 'unit' }, ['tests'])
            ]),
            h('div', {
              class: 'passed' + (filter === 'passed' ? ' current' : '')
            }, [
              h('span', {
                class: 'value',
                on: { click: filterPassed() }
              }, [passedCount]),
              h('span', { class: 'unit' }, ['passed'])
            ]),
            h('div', {
              class: 'failed' + (filter === 'failed' ? ' current' : '')
            }, [
              h('span', {
                class: 'value',
                on: { click: filterFailed() }
              }, [failedCount]),
              h('span', { class: 'unit' }, ['failed'])
            ])
          ]),
          h('div', { class: 'details' }, [
            h('ul', {}, details.filter((i) => filterFn(i)).map((detail) => {
              const { comparedUrl, name, type } = detail;
              return h('li', {}, [
                h('div', {
                  class: 'detail',
                  on: { click: openDialog(detail, { closeDialog }) }
                }, [
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
      // render / re-render
      const render = (state) => {
        const root = view(
          Object.assign({}, state, {
            filterFn: state.filter === 'all'
              ? (_) => true
              : state.filter === 'failed'
                ? (i) => i.type !== 'same'
                : state.filter === 'passed'
                  ? (i) => i.type === 'same'
                  : (_) => false // unknown filter
          }),
          { closeDialog, filterAll, filterFailed, filterPassed, openDialog }
        );
        const body = document.querySelector('.body');
        while (body.hasChildNodes()) {
          body.removeChild(body.firstChild);
        }
        body.appendChild(root);
      };

      // state
      const state = {
        filter: 'failed',
        results: ScreenshotTesting
      };

      // event handler
      const filterAll = () => {
        return (_) => {
          render(Object.assign({}, state, { filter: 'all' }));
        };
      };
      const filterFailed = () => {
        return (_) => {
          render(Object.assign({}, state, { filter: 'failed' }));
        };
      };
      const filterPassed = () => {
        return (_) => {
          render(Object.assign({}, state, { filter: 'passed' }));
        };
      };
      const closeDialog = () => {
        return (_) => {
          const dialog = document.querySelector('.dialog');
          dialog.classList.remove('is-visible');
          setTimeout(() => {
            const container = document.querySelector('.dialog-container');
            while (container.hasChildNodes()) {
              container.removeChild(container.firstChild);
            }
          }, 300);
        };
      };
      const openDialog = (detail, { closeDialog }) => {
        return (event) => {
          const renderWindow = (bodyType) => {
            const { approvedUrl, capturedUrl, name, type, stats } = detail;
            const window = h('div', { class: 'dialog-window' }, [
              h('header', {}, [
                h('div', { class: 'name' }, [name]),
                h('div', { class: 'type' }, [type]),
                h('div', { class: 'meta' }, [
                  h('ul', { class: (bodyType === 'image' ? 'is-image' : 'is-stats') }, [
                    h('li', {}, [h('span', { class: 'image', on: { click: () => renderWindow('image') } }, ['image'])]),
                    h('li', {}, [h('span', { class: 'stats', on: { click: () => renderWindow('stats') } }, ['stats'])]),
                  ])
                ]),
                h('button', { class: 'close', on: { click: closeDialog() } }, ['X'])
              ]),
              h('div', { class: 'body' + (bodyType === 'image' ? ' is-image' : ' is-stats') }, [
                h('div', { class: 'image' }, [
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
                ]),
                h('div', { class: 'stats' }, [stats])
              ])
            ]);
            const container = document.querySelector('.dialog-overlay');
            while (container.hasChildNodes()) {
              container.removeChild(container.firstChild);
            }
            container.appendChild(window);
          };
          const dialog = h('div', { class: 'dialog' }, [
            h('div', { class: 'dialog-overlay' }, [ /* render window */ ])
          ]);
          const container = document.querySelector('.dialog-container');
          while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
          }
          container.appendChild(dialog);
          setTimeout(() => dialog.classList.add('is-visible'), 100);
          renderWindow('image');
        };
      };

      // start
      render(state);
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
      display: inline-block;
      padding: 8px;
    }
    .root > .summary > .tests > .value,
    .root > .summary > .passed > .value,
    .root > .summary > .failed > .value {
      border: 2px solid #000;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      padding: 8px;
    }
    .root > .summary > .tests.current > .value,
    .root > .summary > .tests.current > .value:focus,
    .root > .summary > .tests.current > .value:hover,
    .root > .summary > .tests.current > .value:active,
    .root > .summary > .passed.current > .value,
    .root > .summary > .passed.current > .value:focus,
    .root > .summary > .passed.current > .value:hover,
    .root > .summary > .passed.current > .value:active,
    .root > .summary > .failed.current > .value,
    .root > .summary > .failed.current > .value:focus,
    .root > .summary > .failed.current > .value:hover,
    .root > .summary > .failed.current > .value:active {
      box-shadow: unset;
      cursor: default;
    }
    .root > .summary > .tests > .value:focus,
    .root > .summary > .tests > .value:hover,
    .root > .summary > .passed > .value:focus,
    .root > .summary > .passed > .value:hover,
    .root > .summary > .failed > .value:focus,
    .root > .summary > .failed > .value:hover {
      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    }
    .root > .summary > .tests > .value:active,
    .root > .summary > .passed > .value:active,
    .root > .summary > .failed > .value:active {
      box-shadow: unset;
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
      max-width: 100%;
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
      height: 96px;
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
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul {
      display: flex;
      justify-content: center;
      list-style-type: none;
      margin: 0;
      padding: 0;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li {
      padding: 8px;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .image,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .stats {
      border: 2px solid #000;
      cursor: pointer;
      display: inline-block;
      padding: 8px;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header
    > .meta > ul.is-image > li > .image,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header
    > .meta > ul.is-stats > li > .stats {
      box-shadow: unset;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header
    > .meta > ul.is-image > li > .image:focus,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header
    > .meta > ul.is-image > li > .image:hover,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header
    > .meta > ul.is-stats > li > .stats:focus,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header
    > .meta > ul.is-stats > li > .stats:hover {
      box-shadow: unset;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .image:focus,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .image:hover,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .stats:focus,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .stats:hover {
      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .image:active,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > header > .meta > ul > li > .stats:active {
        box-shadow: unset;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 96px;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body.is-stats > .image,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body.is-image > .stats {
      display: none;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .left,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .right {
      background-color: #fff;
      height: 100%;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .left {
      background-color: #fcc;
      border-right: 2px solid #000;
      width: 50%;
      z-index: 10;
      resize: horizontal;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .right {
      background-color: #ccf;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .left > .image,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .right > .image {
      -moz-user-select: none;
      display: flex;
      height: 100%;
      justify-content: center;
      user-select: none;
      width: 96vw; /* ignore parent width */
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .left > .image > img,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .right > .image > img {
      object-fit: contain;
      max-width: 100%;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .left > .label,
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .right > .label {
      display: inline-block;
      font-size: 90%;
      padding: 8px;
      position: absolute;
      top: 0;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .left > .label {
      left: 0;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .image > .right > .label {
      right: 0;
    }
    .root > .dialog-container > .dialog > .dialog-overlay > .dialog-window > .body > .stats {
      background-color: #eee;
      min-height: 100%;
      padding: 8px;
      white-space: pre;
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
        result.type === 'no_captured' || result.type === 'not_same_dimension'
          ? null
          : result.type === 'no_approved'
            ? capturedPath
            : result.type === 'same'
              ? approvedPath
              : comparedPath;
      const stats = Object.assign({}, result);
      delete (stats as any).diffImage;
      return {
        approvedUrl,
        capturedUrl,
        comparedUrl,
        name: scenario.name,
        stats: JSON.stringify(stats, null, 2),
        type: result.type
      };
    }),
    failedCount: results.filter((i) => i.result.type !== 'same').length,
    passedCount: results.filter((i) => i.result.type === 'same').length
  };
  return Promise.all([
    fs.outputFile(reportHtmlPath, html(pathRelative(reportDirPath, reportJsPath))),
    fs.outputFile(reportJsPath, js(viewData))
  ]).then(() => void open(reportHtmlPath));
};

export { generateReport };
