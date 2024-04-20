import * as vscode from "vscode";
import { FileTreeDataProvider } from "./draftsContainer/treeView/fileTreeDataProvider";
import { DraftsTreeDataProvider } from "./draftsList/treeView/draftsTreeDataProvider";
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
} from "./draftsContainer/commends";
import { createDraftsTreeView } from "./draftsContainer/treeView/createTreeView";
import { createDraftsListTreeView } from "./draftsList/treeView/createTreeView";
import {
  createAddDrafts,
  createDeleteDrafts,
  createRenameDrafts,
} from "./draftsList/commends";

export function activate(context: vscode.ExtensionContext) {
  let fileTreeDataProvider: ref<FileTreeDataProvider> = { value: null };

  const config = vscode.workspace.getConfiguration("qx-drafts");
  const path = config.get<string>("folderPath");
  if (path) {
    fileTreeDataProvider.value = createDraftsTreeView(path, true);
  }
  const showFileTreeCommand = createShowFileTree(fileTreeDataProvider, false);
  const refreshCommand = createRefresh(fileTreeDataProvider);
  const deleteCommand = createDelete(fileTreeDataProvider);
  const renameCommand = createRename(fileTreeDataProvider);
  const createFileCommand = createCreateFile(fileTreeDataProvider);
  const createFolderCommand = createCreateFolder(fileTreeDataProvider);
  const openInExplorerCommand = createOpenInExplorer(fileTreeDataProvider);
  const openInTerminalCommand = createOpenInTerminal(fileTreeDataProvider);
  const openInNewWindowCommand = createOpenInNewWindow(fileTreeDataProvider);

  context.subscriptions.push(
    showFileTreeCommand,
    refreshCommand,
    deleteCommand,
    renameCommand,
    createFileCommand,
    createFolderCommand,
    openInExplorerCommand,
    openInTerminalCommand,
    openInNewWindowCommand
  );

  // 草稿列表视图
  let draftsTreeDataProvider: ref<DraftsTreeDataProvider> = { value: null };
  draftsTreeDataProvider.value = createDraftsListTreeView(context);

  const addDraftsCommand = createAddDrafts(draftsTreeDataProvider);
  const deleteDraftsCommand = createDeleteDrafts(draftsTreeDataProvider);
  const renameDraftsCommand = createRenameDrafts(draftsTreeDataProvider);

  context.subscriptions.push(
    addDraftsCommand,
    deleteDraftsCommand,
    renameDraftsCommand
  );
}

export function deactivate() {}
