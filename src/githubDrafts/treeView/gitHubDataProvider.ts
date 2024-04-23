import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { Octokit } from "@octokit/rest";
import { GitHubFile } from "./gitHubFile";
import { name as pluginName } from "../../../package.json";

export class GitHubDataProvider implements vscode.TreeDataProvider<GitHubFile> {
  private _onDidChangeTreeData: vscode.EventEmitter<GitHubFile | undefined> =
    new vscode.EventEmitter<GitHubFile | undefined>();
  readonly onDidChangeTreeData: vscode.Event<GitHubFile | undefined> =
    this._onDidChangeTreeData.event;
  public tempPath = "";
  public treeView: vscode.TreeView<GitHubFile> | undefined;

  constructor(public github: Octokit, public config: GithubConfig) {
    this.tempPath = path.join(
      os.tmpdir(),
      pluginName,
      this.config.owner,
      this.config.repo
    );
  }

  async getChildren(element?: GitHubFile): Promise<GitHubFile[]> {
    const { data } = await this.github.repos.getContent({
      owner: this.config.owner,
      repo: this.config.repo,
      path: element?.path || "",
    });

    let files: any[] = [];
    if (Array.isArray(data)) {
      files = data;
    } else if (typeof data === "object") {
      files = [data];
    }

    const items = files.map<GitHubFile>((file: any) => {
      let type = vscode.TreeItemCollapsibleState.None;
      if (file.type === "dir") {
        type = vscode.TreeItemCollapsibleState.Collapsed;
      }
      return new GitHubFile(file.name, file.path, type);
    });

    items.sort((a, b) => {
      if (a.collapsibleState === b.collapsibleState) {
        return a.label.localeCompare(b.label);
      }
      return a.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed
        ? -1
        : 1;
    });

    if (!element) {
      items.push(this.createFocusRootItem("—— 根目录操作 ——"));
    }

    return items;
  }

  getTreeItem(element: GitHubFile): vscode.TreeItem {
    return element;
  }

  createFocusRootItem(title: string): GitHubFile {
    return new GitHubFile(
      title,
      "",
      vscode.TreeItemCollapsibleState.None,
      true
    );
  }

  async getParent(item: GitHubFile): Promise<GitHubFile | undefined> {
    if (!item.path) {
      return undefined;
    }
    const parentPath = path.dirname(item.path);
    if (parentPath === ".") {
      return undefined;
    }
    return new GitHubFile(
      "..",
      parentPath,
      vscode.TreeItemCollapsibleState.Collapsed
    );
  }

  async getContent(path: string) {
    return await this.github.repos.getContent({
      owner: this.config.owner,
      repo: this.config.repo,
      path: path,
    });
  }

  // 创建临时文件
  createTempFile(filePath: string, content: string) {
    const tempFilePath = path.join(this.tempPath, filePath);
    const dir = path.dirname(tempFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tempFilePath, content);
    return tempFilePath;
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  async openFile(gitPath: string) {
    // 获取文件内容
    const { data } = await this.getContent(gitPath);
    // 解码文件内容
    const decoded = Buffer.from(
      (data as { content: string }).content,
      "base64"
    ).toString();
    // 创建临时文件
    const tempFilePath = this.createTempFile(gitPath, decoded);
    // 使用临时文件路径打开文档
    vscode.commands.executeCommand(
      "vscode.open",
      vscode.Uri.file(tempFilePath)
    );
  }

  async createOrUpdateFile(gitPath: string, content: string, create: boolean) {
    let path = gitPath.replace(/\\/g, "/"); // github使用的分隔符是“/”
    let sha: string | undefined;
    if (!create) {
      try {
        const { data } = await this.github.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
        });
        sha = (data as { sha: string }).sha;
        path = (data as { path: string }).path;
      } catch (error) {
        vscode.window.showErrorMessage(`${path} 已在远端删除，更新失败`);
        return false;
      }
    } else {
      try {
        await this.github.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
        });
        vscode.window.showErrorMessage(`${path} 已存在，创建失败`);
        return false;
      } catch (error) {}
    }
    // vscode.window.showInformationMessage("sha: " + sha + " path: " + path);
    await this.github.repos.createOrUpdateFileContents({
      owner: this.config.owner,
      repo: this.config.repo,
      path,
      message: "update file",
      content,
      sha,
    });
    return path;
  }

  async deleteFile(gitPath: string) {
    const { data } = await this.github.repos.getContent({
      owner: this.config.owner,
      repo: this.config.repo,
      path: gitPath,
    });
    // 在GitHub中，不能直接删除一个文件夹，当文件夹为空时，它将自动被删除。
    if (Array.isArray(data)) {
      // 如果是文件夹，递归删除所有文件
      for (const file of data) {
        await this.deleteFile(file.path);
      }
    } else {
      // 如果是文件，直接删除
      const sha = (data as { sha: string }).sha;
      await this.github.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path: gitPath,
        message: "delete file",
        sha,
      });
    }
  }

  async rename(gitPath: string, newName: string) {}

  async findItem(gitPath: string) {
    const queue: GitHubFile[] = [];
    const rootItems = await this.getChildren();
    queue.push(...rootItems);
    while (queue.length > 0) {
      const item = queue.shift();
      if (item) {
        if (item.path === gitPath) {
          return item;
        }
        const children = await this.getChildren(item);
        queue.push(...children);
      }
    }
    return undefined;
  }

  async revealItem(gitPath: string) {
    // 找到新创建的文件对应的树视图项
    const item = await this.findItem(gitPath);
    vscode.window.showInformationMessage("item: " + item?.path);
    if (item) {
      // 展开到这个项，并将焦点设置到这个项上
      await this.treeView?.reveal(item, {
        select: true,
        focus: true,
        expand: true,
      });
    }
  }
}