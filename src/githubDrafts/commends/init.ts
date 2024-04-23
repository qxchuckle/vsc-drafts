import * as vscode from "vscode";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";
import { createGithubDraftsTreeView } from "../treeView/createTreeView";

export function createGithubDraftsInit(
  provider: ref<GitHubDataProvider>,
  githubConfig: GithubConfig
) {
  return vscode.commands.registerCommand("qx-drafts-github.init", async () => {
    const username = await vscode.window.showInputBox({
      prompt: "请输入 GitHub 用户名",
      placeHolder: "请输入 GitHub 用户名",
      value: githubConfig.owner,
    });
    if (!username) {
      return;
    }
    const token = await vscode.window.showInputBox({
      prompt: "请输入 GitHub Token",
      placeHolder: "请输入 GitHub Token",
      value: githubConfig.token,
    });
    if (!token) {
      return;
    }
    const repo = await vscode.window.showInputBox({
      prompt: "请输入需要关联的 GitHub 仓库名，需先创建好",
      placeHolder: "请输入需要关联的 GitHub 仓库名，需先创建好",
      value: githubConfig.repo,
    });
    if (!repo) {
      return;
    }
    githubConfig.owner = username;
    githubConfig.token = token;
    githubConfig.repo = repo;
    // 更新配置
    const config = vscode.workspace.getConfiguration("qx-drafts");
    config.update("username", username, true);
    config.update("token", token, true);
    config.update("repo", repo, true);
    try {
      provider.value = createGithubDraftsTreeView(githubConfig);
    } catch (e) {
      vscode.window.showErrorMessage("初始化失败，请检查 GitHub 用户名、Token、仓库名是否正确");
    }
  });
}
