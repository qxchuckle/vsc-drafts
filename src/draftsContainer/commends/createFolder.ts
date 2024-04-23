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
        placeHolder: `在 ${
          path.relative(provider.value.getRootPath(), newPath) || "根目录"
        } 中创建文件夹`,
      });
      if (!folderName) {
        return;
      }
      const folderPath = path.normalize(path.join(newPath, folderName));
      const folderUri = vscode.Uri.file(folderPath);
      // 判断文件夹是否存在
      try {
        await vscode.workspace.fs.stat(folderUri);
        vscode.window.showErrorMessage(`${folderPath} 已存在，创建失败`);
        return;
      } catch (error) {}
      await vscode.workspace.fs.createDirectory(folderUri);
      provider.value?.refresh();
      await provider.value?.revealItem(folderUri);
    }
  );
}
