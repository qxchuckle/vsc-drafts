import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";

export function createOpenInNewWindow(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.openInNewWindow",
    async (fileItem: FileItem) => {
      let targetPath = fileItem?.resourceUri?.fsPath;
      if (targetPath) {
        if (fileItem.contextValue === "file") {
          targetPath = path.dirname(targetPath);
        }
      } else {
        targetPath = provider.value?.getRootPath();
      }
      if (!targetPath) {
        return;
      }
      // vscode.window.showInformationMessage(targetPath);
      vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(targetPath),
        {
          forceNewWindow: true,
        }
      );
    }
  );
}
