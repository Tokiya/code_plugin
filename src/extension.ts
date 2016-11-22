'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "findcss" is now active!');

    let findCssKeys = vscode.commands.registerCommand('extension.findselectedcss',async ()=>{
        let cssEditor = vscode.window.activeTextEditor;
        if(cssEditor==null)return;
        if(!cssEditor.document.fileName.endsWith(".css"))return;
        if(cssEditor.selections.length>1||cssEditor.selections.length==0)return;
        let selection = cssEditor.selections[0];
        let range = new vscode.Range(selection.start, selection.end);
        let cssname = cssEditor.document.getText(cssEditor.document.getWordRangeAtPosition(selection.start)).split('.').find(s=>s!=='');
           
            let foundFiles :Array<FileResult> = new Array<FileResult>();
            let workspace = vscode.workspace;
            let window = vscode.window;
        await workspace.findFiles("**/*.html","").then(async (files)=>{
            for(let i=0;i<files.length;i++)
            await workspace.openTextDocument(files[i]).then(doc=>{
                    let text = doc.getText();
                    let links = text.split("head")[1].split("link");
                    if(links.length==0)return;
                    let refCss = links.filter(l=>l.includes("stylesheet")).map(l=>l.split("href=")[1].split('"').find(s=>s!==''));
                    if(refCss.length===0)return;
                    if(!refCss.some(r=>cssEditor.document.fileName.includes(r)))return;
                   let lines = text.split("\n");
                   let nr = 0;
                  lines.forEach(line=>{
                      if(!line.includes("class")){
                          nr++;
                          return
                      }
                      let splitedLine = line.split("=").map(s=>s.trim());
                      let classIndex = splitedLine.findIndex(s=>s.endsWith(" class"));

                  if(splitedLine[classIndex+1].split('"').filter(s=>s!=='')[0].includes(cssname)){
                      foundFiles.push(new FileResult(doc.fileName,nr, line));
                  }
                  nr++;
                  })
                });
        });
         await  window.showQuickPick(foundFiles.map(f=>f.fileName+" line:"+(f.nr+1) + " "+f.line.trim()))
            
            .then(path=>{
                let files = foundFiles.filter(f=>path.includes(f.fileName))
              let file = files.find(f=>path.includes("line:"+(f.nr+1)));
              if(!file)return;
              workspace.openTextDocument(file.fileName).then(doc=>{
                  window.showTextDocument(doc).then(editor=>{
                      let selection = new vscode.Selection(new vscode.Position(file.nr,0), new vscode.Position(file.nr,file.line.length-1))
                      editor.selections = files.map(f=>new vscode.Selection(f.nr,0,f.nr,f.line.length-1));
                      editor.revealRange(new vscode.Range(new vscode.Position(file.nr,0), new vscode.Position(file.nr,file.line.length-1)));
                      
                  });
              });  
            });
       
    });

    let findCssCmd = vscode.commands.registerCommand('extension.testEdit', async () => {
       
        let window = vscode.window;
        let workspace = vscode.workspace;

            let cssName:string = null;
           
            let foundFiles :Array<FileResult> = new Array<FileResult>();

        await workspace.findFiles("**/*.html","").then(async (files)=>{

            await window.showInputBox().then(async val=>{
                cssName=val;
            if(cssName==null) return;
            
            for(let i=0;i<files.length;i++)
            await workspace.openTextDocument(files[i]).then(doc=>{
                   let lines = doc.getText().split("\n");
                   
                   let nr = 0;
                  lines.forEach(line=>{
                      if(!line.includes("class")){
                          nr++;
                          return
                      }
                      let splitedLine = line.split("=").map(s=>s.trim());
                      let classIndex = splitedLine.findIndex(s=>s.endsWith(" class"));

                  if(splitedLine[classIndex+1].split('"').filter(s=>s!=='')[0].includes(cssName)){
                      foundFiles.push(new FileResult(doc.fileName,nr, line));

                  }
                  nr++;
                  })
                })
            });
        });
         await  window.showQuickPick(foundFiles.map(f=>f.fileName+" line:"+(f.nr+1) + " "+f.line.trim()))
            
            .then(path=>{
                let files = foundFiles.filter(f=>path.includes(f.fileName))
              let file = files.find(f=>path.includes("line:"+(f.nr+1)));
              if(!file)return;
              workspace.openTextDocument(file.fileName).then(doc=>{
                  window.showTextDocument(doc).then(editor=>{
                      let selection = new vscode.Selection(new vscode.Position(file.nr,0), new vscode.Position(file.nr,file.line.length-1))
                      editor.selections = files.map(f=>new vscode.Selection(f.nr,0,f.nr,f.line.length-1));
                      editor.revealRange(new vscode.Range(new vscode.Position(file.nr,0), new vscode.Position(file.nr,file.line.length-1)));
                      
                  });
              });  
            });

        });

    context.subscriptions.push(findCssCmd);
    context.subscriptions.push(findCssKeys);
}

class FileResult{
    /**
     *
     */
    constructor(public fileName:string,public nr:number, public line:string) {
        
    }
}

export function deactivate() {
}