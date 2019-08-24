const objShell = new ActiveXObject("Shell.Application");
objShell.ShellExecute("node", "addBarcodeToPDF.js", "", "open", 1);
