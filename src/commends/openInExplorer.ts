import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";
import { exec } from "child_process";

export function createOpenInExplorer(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.openInExplorer",
    async (fileItem: FileItem | undefined) => {
      if (!fileItem?.resourceUri) {
        return;
      }
      let folderPath = fileItem.resourceUri.fsPath;
      // 如果是文件，获取文件所在目录
      if (fileItem.contextValue === "file") {
        folderPath = path.dirname(folderPath);
      }
      if (!folderPath) {
        return;
      }
      switch (process.platform) {
        case "darwin":
          exec(`open "${folderPath}"`);
          break;
        case "win32":
          exec(`explorer "${folderPath}"`);
          break;
        default:
          exec(`xdg-open "${folderPath}"`);
      }
    }
  );
}
