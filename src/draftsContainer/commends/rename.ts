import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";

export function createRename(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.rename",
    async (fileItem: FileItem) => {
      if (!provider.value || !fileItem.resourceUri) {
        return;
      }
      const oldName = path.basename(
        vscode.workspace.asRelativePath(fileItem.resourceUri, false)
      );
      const dotIndex = oldName.indexOf(".");
      const newName = await vscode.window.showInputBox({
        prompt: "输入新的文件名",
        value: oldName,
        valueSelection: [0, dotIndex],
      });
      if (newName) {
        const newUri = vscode.Uri.joinPath(fileItem.resourceUri, "..", newName);
        await vscode.workspace.fs.rename(fileItem.resourceUri, newUri);
        provider.value.refresh();
      }
    }
  );
}
