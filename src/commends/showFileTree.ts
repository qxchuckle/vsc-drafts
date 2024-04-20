import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { createTreeView } from "../treeView/createTreeView";

export function createShowFileTree(
  provider: ref<FileTreeDataProvider>,
  watch: boolean = true
) {
  return vscode.commands.registerCommand("qx-drafts.showFileTree", async () => {
    let path;
    const config = vscode.workspace.getConfiguration("qx-drafts");
    const rootPath = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "选择文件夹",
    });
    if (rootPath && rootPath.length > 0) {
      path = rootPath[0].fsPath;
      // 保存配置
      config.update("folderPath", path, true);
    }
    if (path) {
      provider.value = createTreeView(path, watch);
    }
  });
}
