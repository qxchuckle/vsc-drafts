import * as vscode from "vscode";
import { draftsContainerInit } from "./draftsContainer";
import { draftsListInit } from "./draftsList";
import { githubDraftsInit } from "./githubDrafts";

export function activate(context: vscode.ExtensionContext) {
  draftsContainerInit(context);
  draftsListInit(context);
  githubDraftsInit(context);
}

export function deactivate() {}
