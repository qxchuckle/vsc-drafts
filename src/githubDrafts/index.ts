import * as vscode from "vscode";
import { GitHubDataProvider } from "./treeView/gitHubDataProvider";
import { createGithubDraftsTreeView } from "./treeView/createTreeView";
import { createSaveDocumentWatch } from "./watch";
import {
  createGithubDraftsInit,
  createOpenGithubFile,
  createCreateGithubFile,
  createGithubRefresh,
  createDeleteGithubFile,
  createShowTreeView,
  createOpenInGithub,
  createClearAllCache,
  createClearCache,
  createExit,
} from "./commends";

export function githubDraftsInit(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("qx-drafts");

  let githubDraftsTreeDataProvider: ref<GitHubDataProvider> = { value: null };

  const githubConfig: ref<GithubConfig> = {
    value: {
      owner: config.get<string>("username") || "",
      repo: config.get<string>("repo") || "",
      token: config.get<string>("token") || "",
    },
  };

  if (
    githubConfig.value?.owner &&
    githubConfig.value.repo &&
    githubConfig.value.token
  ) {
    try {
      githubDraftsTreeDataProvider.value =
        createGithubDraftsTreeView(githubConfig);
    } catch (e) {
      vscode.window.showErrorMessage(
        "初始化失败，请检查 GitHub 用户名、Token、仓库名是否正确"
      );
    }
  }

  const watchDis = createSaveDocumentWatch(githubDraftsTreeDataProvider);
  watchDis && context.subscriptions.push(watchDis);

  context.subscriptions.push(
    createShowTreeView(githubDraftsTreeDataProvider, githubConfig),
    createGithubDraftsInit(githubDraftsTreeDataProvider, githubConfig),
    createOpenGithubFile(githubDraftsTreeDataProvider),
    createCreateGithubFile(githubDraftsTreeDataProvider),
    createGithubRefresh(githubDraftsTreeDataProvider),
    createDeleteGithubFile(githubDraftsTreeDataProvider),
    createOpenInGithub(githubDraftsTreeDataProvider),
    createClearCache(githubDraftsTreeDataProvider),
    createClearAllCache(githubDraftsTreeDataProvider),
    createExit(githubDraftsTreeDataProvider)
  );
}
