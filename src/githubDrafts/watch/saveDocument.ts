import * as vscode from "vscode";
import * as path from "path";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";
import { NotebookDocument } from "vscode";

export function createSaveDocumentWatch(provider: ref<GitHubDataProvider>) {
  if (!provider.value) {
    return;
  }
  // 监听文本文档的保存事件
  vscode.workspace.onDidSaveTextDocument(async (doc) => {
    handleSaveEvent(doc, provider, "text");
  });

  // 监听 notebook 文档的保存事件
  vscode.workspace.onDidSaveNotebookDocument(async (doc: NotebookDocument) => {
    handleSaveEvent(doc, provider, "notebook");
  });
}

async function handleSaveEvent(
  doc: vscode.TextDocument | NotebookDocument,
  provider: ref<GitHubDataProvider>,
  type: "text" | "notebook"
) {
  const fsPath = doc.uri.fsPath;
  const tempPath = provider.value!.tempPath;
  const relativePath = path.relative(tempPath, fsPath).replace(/\\/g, "/");
  // 检查文件是否在临时目录中
  if (!relativePath.startsWith("../")) {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `正在保存 ${relativePath}`,
      },
      async (progress) => {
        progress.report({ increment: 50 });
        let encoded: string;
        if (type === "text") {
          encoded = Buffer.from(
            (doc as vscode.TextDocument).getText()
          ).toString("base64");
        } else {
          const data = await vscode.workspace.fs.readFile(doc.uri);
          encoded = Buffer.from(data).toString("base64");
        }
        await provider.value!.createOrUpdateFile(relativePath, encoded, false);
        progress.report({ increment: 100 });
      }
    );
  }
}
