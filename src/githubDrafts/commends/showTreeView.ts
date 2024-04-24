import * as vscode from "vscode";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";
import { createGithubDraftsTreeView } from "../treeView/createTreeView";

export function createShowTreeView(
  provider: ref<GitHubDataProvider>,
  githubConfig: ref<GithubConfig>
) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.showTreeView",
    async (newConfig: Optional<GithubConfig, "token">) => {
      if (!githubConfig.value) {
        return;
      }
      if (newConfig.owner && newConfig.repo) {
        try {
          // 更新配置
          githubConfig.value = {
            owner: newConfig.owner,
            repo: newConfig.repo,
            token: newConfig.token || githubConfig.value.token,
          };
          const config = vscode.workspace.getConfiguration("qx-drafts");
          config.update("username", githubConfig.value.owner, true);
          config.update("token", githubConfig.value.token, true);
          config.update("repo", githubConfig.value.repo, true);
          // 更新视图
          provider.value = createGithubDraftsTreeView(
            githubConfig as ref<GithubConfig>
          );
        } catch (e) {
          vscode.window.showErrorMessage(
            "初始化失败，请检查 GitHub 用户名、Token、仓库名是否正确"
          );
        }
      }
    }
  );
}
