import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";

export function createOpenInTerminal(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.openInTerminal",
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
      vscode.window.createTerminal({ cwd: folderPath }).show();
    }
  );
}
