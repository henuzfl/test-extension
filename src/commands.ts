import {
    JupyterFrontEnd,
  } from '@jupyterlab/application';
import {
    ICommandPalette
  } from '@jupyterlab/apputils';

const cmdIds = {
  startSearch: 'documentsearch:start-search'
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
};
