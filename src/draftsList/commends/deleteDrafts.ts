import * as vscode from "vscode";
import { DraftsTreeDataProvider } from "../treeView/draftsTreeDataProvider";
import { DraftItem } from "../treeView/DraftItem";

export function createDeleteDrafts(provider: ref<DraftsTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-list.deleteDrafts",
    async (draftItem: DraftItem) => {
      const confirm = await vscode.window.showWarningMessage(
        `你确定要删除 ${draftItem.name}: ${draftItem.path} 吗？`,
        { modal: true },
        "确定"
      );
      if (confirm === "确定") {
        provider.value?.deleteDraftFolder(draftItem);
      }
    }
  );
}
