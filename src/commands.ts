import {
    JupyterFrontEnd,
  } from '@jupyterlab/application';
import {
    ICommandPalette
  } from '@jupyterlab/apputils';

const cmdIds = {
  startSearch: 'ancunFilebrowser:start-search',
  showFileMetadata: "ancunFilebrowser:show-file-metadata",
};

export const SetupCommands = (
  app: JupyterFrontEnd,
  palette: ICommandPalette,
) => {

  app.commands.addCommand(cmdIds.startSearch, {
    label: 'Find...',
    execute: () => {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaa")
    }
  });

  app.commands.addCommand(cmdIds.showFileMetadata,{
    label: "show metadata...",
    execute: ()=>{
      console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    }
  });

  let category = 'Notebook Operations';
  [
    cmdIds.startSearch,
  ].forEach(command => palette.addItem({ command, category }));

  const bindings = [
    {
      selector: '.jp-Notebook',
      keys: ['Ctrl M'],
      command: cmdIds.startSearch
    }
  ];
  bindings.map(binding => app.commands.addKeyBinding(binding));

  app.contextMenu.addItem({
    command: cmdIds.startSearch,
    selector: '.jp-Notebook',
    rank: 1
  });

  app.contextMenu.addItem({
    command: cmdIds.showFileMetadata,
    selector: '.jp-Notebook',
    rank: 2
  });
};
