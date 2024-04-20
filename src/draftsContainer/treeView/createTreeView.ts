import * as vscode from "vscode";
import { FileTreeDataProvider } from "./fileTreeDataProvider";

export function createDraftsTreeView(path: string, watch: boolean = true) {
  // 创建数据提供者
  const provider = new FileTreeDataProvider(path, watch);
  // 创建 treeView
  const treeView = vscode.window.createTreeView("qx-drafts", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });
  // 保存 treeView 实例
  provider.treeView = treeView;
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
