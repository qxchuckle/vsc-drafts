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
import { GitHubDataProvider } from "./githubDrafts/treeView/gitHubDataProvider";
import { createGithubDraftsTreeView } from "./githubDrafts/treeView/createTreeView";
import { createSaveDocumentWatch } from "./githubDrafts/watch";
import {
  createGithubDraftsInit,
  createOpenGithubFile,
  createCreateGithubFile,
  createGithubRefresh,
  createDeleteGithubFile,
} from "./githubDrafts/commends";

export function activate(context: vscode.ExtensionContext) {
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

  // 草稿列表视图
  let draftsTreeDataProvider: ref<DraftsTreeDataProvider> = { value: null };
  draftsTreeDataProvider.value = createDraftsListTreeView(context);

  context.subscriptions.push(
    createAddDrafts(draftsTreeDataProvider),
    createDeleteDrafts(draftsTreeDataProvider),
    createRenameDrafts(draftsTreeDataProvider)
  );

  // github草稿仓库
  let githubDraftsTreeDataProvider: ref<GitHubDataProvider> = { value: null };
  const githubConfig: GithubConfig = {
    owner: config.get<string>("username") || "",
    repo: config.get<string>("repo") || "",
    token: config.get<string>("token") || "",
  };
  if (githubConfig.owner && githubConfig.repo && githubConfig.token) {
    try {
      githubDraftsTreeDataProvider.value =
        createGithubDraftsTreeView(githubConfig);
    } catch (e) {
      vscode.window.showErrorMessage(
        "初始化失败，请检查 GitHub 用户名、Token、仓库名是否正确"
      );
    }
  }

  context.subscriptions.push(
    createGithubDraftsInit(githubDraftsTreeDataProvider, githubConfig),
    createOpenGithubFile(githubDraftsTreeDataProvider),
    createSaveDocumentWatch(githubDraftsTreeDataProvider),
    createCreateGithubFile(githubDraftsTreeDataProvider),
    createGithubRefresh(githubDraftsTreeDataProvider),
    createDeleteGithubFile(githubDraftsTreeDataProvider)
  );
}

export function deactivate() {}
