import * as vscode from "vscode";
import { DraftsTreeDataProvider } from "../treeView/draftsTreeDataProvider";
import { DraftItem } from "../treeView/DraftItem";

export function createAddGithub(provider: ref<DraftsTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-list.addGithub",
    async (draftItem: DraftItem) => {
      const draftName = await vscode.window.showInputBox({
        prompt: "为当前 GitHub 远端草稿本命名",
        placeHolder: "请输入草稿本名称",
      });
      if (draftName) {
        const config = vscode.workspace.getConfiguration("qx-drafts");
        const username = config.get<string>("username");
        const repo = config.get<string>("repo");
        if (!username || !repo) {
          return;
        }
        const path = `GitHub:${username}/${repo}`;
        provider.value?.addDraftFolder({
          name: draftName,
          path: path,
        });
      }
    }
  );
}