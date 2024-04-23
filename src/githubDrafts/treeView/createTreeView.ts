import * as vscode from "vscode";
import * as octokit from "@octokit/rest";
import { GitHubDataProvider } from "./gitHubDataProvider";

export function createGithubDraftsTreeView(config: GithubConfig) {
  const github = new octokit.Octokit({
    auth: config.token,
  });
  const dataProvider = new GitHubDataProvider(github, config);
  dataProvider.treeView = vscode.window.createTreeView("qx-drafts-github", {
    treeDataProvider: dataProvider,
    showCollapseAll: true,
  });
  return dataProvider;
}
