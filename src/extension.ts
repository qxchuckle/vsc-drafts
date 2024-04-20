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
} from "./commends";
import { createTreeView } from "./treeView/createTreeView";

export function activate(context: vscode.ExtensionContext) {
  let fileTreeDataProvider: ref<FileTreeDataProvider> = { value: null };

  const config = vscode.workspace.getConfiguration("qx-drafts");
  const path = config.get<string>("folderPath");
  // vscode.window.showInformationMessage("path: " + path);
  if (path) {
    fileTreeDataProvider.value = createTreeView(path, true);
  }
  const showFileTreeCommand = createShowFileTree(fileTreeDataProvider, true);
  const refreshCommand = createRefresh(fileTreeDataProvider);
  const deleteCommand = createDelete(fileTreeDataProvider);
  const renameCommand = createRename(fileTreeDataProvider);
  const createFileCommand = createCreateFile(fileTreeDataProvider);
  const createFolderCommand = createCreateFolder(fileTreeDataProvider);
  const openInExplorerCommand = createOpenInExplorer(fileTreeDataProvider);
  const openInTerminalCommand = createOpenInTerminal(fileTreeDataProvider);

  context.subscriptions.push(
    showFileTreeCommand,
    refreshCommand,
    deleteCommand,
    renameCommand,
    createFileCommand,
    createFolderCommand,
    openInExplorerCommand,
    openInTerminalCommand
  );
}

export function deactivate() {}
