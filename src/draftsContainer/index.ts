import * as vscode from "vscode";
import { FileTreeDataProvider } from "./treeView/fileTreeDataProvider";
import {
  createShowFileTree,
  createRefresh,
  createDelete,
  createRename,
  createCreateFile,
  createCreateFolder,
  createOpenInExplorer,
  createOpenInTerminal,
  createOpenInNewWindow,
} from "./commends";
import { createDraftsTreeView } from "./treeView/createTreeView";
import { Stack } from "../utils/stack";

export function draftsContainerInit(context: vscode.ExtensionContext) {
  // 保存数据提供者
  const fileTreeDataProvider: ref<FileTreeDataProvider> = { value: null };
  // 创建草稿本历史缓存对象
  const localCaches = new Stack(
    context.globalState.get<localCache[]>("qx-local-list-caches"),
    10
  );

  const config = vscode.workspace.getConfiguration("qx-drafts");
  const path = config.get<string>("folderPath");
  if (path) {
    fileTreeDataProvider.value = createDraftsTreeView(
      path,
      context,
      localCaches,
      true,
      true
    );
  }

  context.subscriptions.push(
    createShowFileTree(fileTreeDataProvider, false, context, localCaches),
    createRefresh(fileTreeDataProvider),
    createDelete(fileTreeDataProvider),
    createRename(fileTreeDataProvider),
    createCreateFile(fileTreeDataProvider),
    createCreateFolder(fileTreeDataProvider),
    createOpenInExplorer(fileTreeDataProvider),
    createOpenInTerminal(fileTreeDataProvider),
    createOpenInNewWindow(fileTreeDataProvider)
  );
}
