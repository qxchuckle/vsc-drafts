import * as vscode from "vscode";
import { existsSync } from "fs";
import { FileTreeDataProvider } from "./fileTreeDataProvider";
import { Stack } from "../../utils";
import { platform } from "os";

export function createDraftsTreeView(
  path: string,
  context: vscode.ExtensionContext,
  caches: Stack<localCache>,
  watch: boolean = true,
  firstLoading: boolean = false
) {
  // 判断路径在系统中是否存在
  const isExist = existsSync(path);
  const os = platform();
  if (!isExist) {
    // 如果是第一次加载则不提示，后续是手动选择文件夹则提示
    if (!firstLoading) {
      vscode.window.showErrorMessage(`${path} 不存在, 请重新选择`);
      return null;
    }
    // 从缓存拿最近历史
    const historyItem = caches
      .getStack()
      .find((i) => i.os === os && existsSync(i.path));
    // 没有历史则返回
    if (!historyItem) {
      vscode.window.showErrorMessage(`${path} 不存在, 请重新选择`);
      return null;
    }
    // 有历史则使用历史路径
    path = historyItem.path;
  }
  // 添加历史
  caches.push({ path, os });
  context.globalState.update("qx-local-list-caches", caches.getStack());
  // 更新配置
  const config = vscode.workspace.getConfiguration("qx-drafts");
  config.update("folderPath", path, true);
  // 创建数据提供者
  const provider = new FileTreeDataProvider(path, watch);
  // 创建 treeView
  provider.treeView = vscode.window.createTreeView("qx-drafts", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });
  // 监听选中项变动
  // treeView.onDidChangeSelection((e) => {
  //   if (e.selection && e.selection.length > 0) {
  //     provider.setSelectedItem(e.selection[0]);
  //   } else {
  //     provider.setSelectedItem(undefined);
  //   }
  // });
  return provider;
}
