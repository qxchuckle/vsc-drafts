import * as vscode from "vscode";
import { existsSync } from "fs";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { createDraftsTreeView } from "../treeView/createTreeView";
import { Stack } from "../../utils";

export function createShowFileTree(
  provider: ref<FileTreeDataProvider>,
  watch: boolean = true,
  context: vscode.ExtensionContext,
  caches: Stack<localCache>
) {
  return vscode.commands.registerCommand(
    "qx-drafts.showFileTree",
    async (path?: string) => {
      if (path) {
        const isExist = existsSync(path);
        if (!isExist) {
          vscode.window.showErrorMessage(`${path} 不存在, 请重新选择`);
          return;
        }
        // 如果已经是当前打开的文件夹则不做任何操作
        if (path === provider.value?.getRootPath()) {
          return;
        }
        provider.value = createDraftsTreeView(path, context, caches, watch);
        return;
      }
      // 没有传入path则打开文件夹选择框
      let draftsPath;
      const rootPath = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "选择文件夹",
      });
      if (rootPath && rootPath.length > 0) {
        draftsPath = rootPath[0].fsPath;
      }
      if (draftsPath) {
        provider.value = createDraftsTreeView(
          draftsPath,
          context,
          caches,
          watch
        );
      }
    }
  );
}
