import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";

export function createCreateFile(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.createFile",
    async (fileItem: FileItem | undefined) => {
      if (!provider.value) {
        return;
      }
      let newPath;
      if (fileItem?.resourceUri) {
        newPath = fileItem.resourceUri.fsPath;
        if (fileItem.contextValue === "file") {
          newPath = path.dirname(newPath);
        }
      } else {
        newPath = provider.value.getRootPath();
      }
      // vscode.window.showInformationMessage(newPath);
      if (!newPath) {
        return;
      }
      const fileName = await vscode.window.showInputBox({
        prompt: "输入文件名",
        placeHolder: "请输入文件名",
      });
      if (!fileName) {
        return;
      }
      const filePath = path.normalize(path.join(newPath, fileName));
      const fileUri = vscode.Uri.file(filePath);
      await vscode.workspace.fs.writeFile(fileUri, new Uint8Array());
      provider.value?.refresh();
      // 打开文件
      await vscode.window.showTextDocument(
        await vscode.workspace.openTextDocument(fileUri)
      );
      await provider.value?.revealItem(fileUri);
    }
  );
}
