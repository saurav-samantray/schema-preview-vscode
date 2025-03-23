import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getUri } from './utils';
import $RefParser from '@stoplight/json-schema-ref-parser';

let currentPanel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "json-schema-viewer-extension" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand('json-schema-viewer.openSchemaFile', (uri: vscode.Uri) => {
      if (uri) {
        createOrShow(context.extensionUri, uri.fsPath);
      } else {
        if (vscode.window.activeTextEditor) {
          createOrShow(context.extensionUri, vscode.window.activeTextEditor.document.uri.fsPath);
        }
      }
    })
  );
}

async function createOrShow(extensionUri: vscode.Uri, filePath: string) {
  console.log(`createOrShow() called with filePath: ${filePath} and extensionUri: ${extensionUri}`);
  console.log(`current color theme: ${JSON.stringify(vscode.window.activeColorTheme)}`);
  console.log(`current color theme: ${vscode.workspace.getConfiguration().get("workbench.colorTheme")}`);

  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  if (currentPanel) {
    console.log(`currentPanel present: ${currentPanel}`);
    currentPanel.title = path.basename(filePath);
    currentPanel.reveal(column);
  } else {
    console.log(`Creating new currentPanel`);
    currentPanel = vscode.window.createWebviewPanel(
      'json-schema-viewer',
      path.basename(filePath),
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
      }
    );

    currentPanel.onDidDispose(
      () => {
        currentPanel = undefined;
      },
      null,
      []
    );
  }
  console.log(`Setting html for webview. extensionUri: ${extensionUri}`);
  const theme = vscode.workspace.getConfiguration().get("workbench.colorTheme") as string ?? 'light';
  currentPanel.webview.html = getHtmlForWebview(currentPanel.webview, extensionUri, filePath, theme);
  console.log(`Response from getHtmlForWebview() method: ${currentPanel.webview.html}`);

  currentPanel.webview.postMessage({ type: 'openFile', data: filePath });

  currentPanel.webview.onDidReceiveMessage(async (data) => {
    console.log(`Recieved message: ${JSON.stringify(data)}`);
    switch (data.type) {
      case 'ready': {
        console.log(`Webview is ready! : ${currentPanel}`);
        try {
          const parsedSchema = await parseSchemaFile(filePath);
          currentPanel?.webview.postMessage({ type: 'fileContent', data: JSON.stringify(parsedSchema) });
        } catch (error) {
          console.error('Error parsing schema:', error);
          currentPanel?.webview.postMessage({ type: 'fileContent', data: null });
        }
        break;
      }
      default:
        console.log(`Recieved message: ${JSON.stringify(data)}`);
        break;
    }
  });
}

async function parseSchemaFile(filePath: string): Promise<any> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsedSchema = await $RefParser.dereference(filePath, JSON.parse(fileContent), {});
    console.log(`Parsed schema: ${JSON.stringify(parsedSchema)}`)
    return parsedSchema;
  } catch (error) {
    console.error('Error parsing schema:', error);
    throw error;
  }
}

function getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri, filePath: string, theme: string) {
  console.log(`getHtmlForWebview() method`);
  const { scriptUri, styleUri, styleThemeUri } = getDistFileUris(webview, extensionUri, theme);
  console.log(`scriptUri: ${scriptUri}`);
  console.log(`styleUri: ${styleUri}`);
  console.log(`styleThemeUri: ${styleThemeUri}`);
  const nonce = getNonce();
  const toolkitUri = getUri(webview, extensionUri, [
    'node_modules',
    'vscode-webview-ui-toolkit',
    'dist',
    'toolkit.js',
  ]);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JSON Schema Viewer</title>
        <link rel="stylesheet" href="${styleUri}">
        <link rel="stylesheet" href="${styleThemeUri}">
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" type="text/javascript" src="${scriptUri}"></script>
      </body>
    </html>
  `;
}

function getDistFileUris(webview: vscode.Webview, extensionUri: vscode.Uri, theme: string = 'light') {
  const distPath = path.join(extensionUri.fsPath, 'webview-ui', 'dist', 'assets');
  const wvSrcPath = path.join(extensionUri.fsPath, 'webview-ui', 'src');
  const files = fs.readdirSync(distPath);

  const scriptFile = files.find(file => file.startsWith('main') && file.endsWith('.js'));

  if (!scriptFile) {
    console.log(`Could not find built webview files.`);
    throw new Error('Could not find built webview files.');
  }

  const scriptUri = getUri(webview, extensionUri, ['webview-ui', 'dist', 'assets', scriptFile]);
  const styleUri = getUri(webview, extensionUri, ['webview-ui', 'src', 'main.css']);
  let styleThemeUri = getUri(webview, extensionUri, ['webview-ui', 'src', 'light.css']);
  if (theme.toLowerCase().includes('dark')) {
    styleThemeUri = getUri(webview, extensionUri, ['webview-ui', 'src', 'dark.css']);
  }


  return { scriptUri, styleUri, styleThemeUri };
}

function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
