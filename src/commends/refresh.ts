import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";

export function createRefresh(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand("qx-drafts.refresh", () => {
    if (!provider.value) {
      return;
    }
    provider.value.refresh();
  });
}
