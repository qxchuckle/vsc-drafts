import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";

export function createCreateFolder(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.createFolder",
    async (fileItem: FileItem | undefined) => {
      if (!provider.value) {
        return;
      }
      let newPath;
      if (fileItem?.resourceUri) {
        newPath = fileItem.resourceUri.fsPath;
        if (fileItem?.contextValue === "file") {
          newPath = path.dirname(newPath);
        }
      } else {
        newPath = provider.value.getRootPath();
      }
      if (!newPath) {
        return;
      }
      const folderName = await vscode.window.showInputBox({
        prompt: "输入文件夹名",
        placeHolder: "请输入文件夹名",
      });
      if (!folderName) {
        return;
      }
      const folderPath = path.normalize(path.join(newPath, folderName));
      const folderUri = vscode.Uri.file(folderPath);
      await vscode.workspace.fs.createDirectory(folderUri);
      provider.value?.refresh();
    }
  );
}
