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

export function draftsContainerInit(context: vscode.ExtensionContext) {
  let fileTreeDataProvider: ref<FileTreeDataProvider> = { value: null };

  const config = vscode.workspace.getConfiguration("qx-drafts");
  const path = config.get<string>("folderPath");
  if (path) {
    fileTreeDataProvider.value = createDraftsTreeView(path, true);
  }

  context.subscriptions.push(
    createShowFileTree(fileTreeDataProvider, false),
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
