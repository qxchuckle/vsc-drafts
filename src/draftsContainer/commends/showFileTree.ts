import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { createDraftsTreeView } from "../treeView/createTreeView";

export function createShowFileTree(
  provider: ref<FileTreeDataProvider>,
  watch: boolean = true
) {
  return vscode.commands.registerCommand(
    "qx-drafts.showFileTree",
    async (path?: string) => {
      if (path) {
        // 如果已经是当前打开的文件夹则不做任何操作
        if (path === provider.value?.getRootPath()) {
          return;
        }
        const config = vscode.workspace.getConfiguration("qx-drafts");
        provider.value = createDraftsTreeView(path, watch);
        config.update("folderPath", path, true);
        return;
      }
      // 没有传入path则打开文件夹选择框
      let draftsPath;
      const config = vscode.workspace.getConfiguration("qx-drafts");
      const rootPath = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "选择文件夹",
      });
      if (rootPath && rootPath.length > 0) {
        draftsPath = rootPath[0].fsPath;
        // 保存配置
        config.update("folderPath", draftsPath, true);
      }
      if (draftsPath) {
        provider.value = createDraftsTreeView(draftsPath, watch);
      }
    }
  );
}
