import * as vscode from "vscode";
import * as octokit from "@octokit/rest";
import { GitHubDataProvider } from "./gitHubDataProvider";

export function createGithubDraftsTreeView(githubConfig: ref<GithubConfig>) {
  if (!githubConfig.value) {
    return null;
  }
  const github = new octokit.Octokit({
    auth: githubConfig.value.token,
  });
  const dataProvider = new GitHubDataProvider(github, githubConfig);
  dataProvider.treeView = vscode.window.createTreeView("qx-drafts-github", {
    treeDataProvider: dataProvider,
    showCollapseAll: true,
  });
  return dataProvider;
}
