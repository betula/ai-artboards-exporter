// guide http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/scripting/pdfs/javascript_tools_guide.pdf
// guide http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/illustrator/sdk/CC2014/Illustrator%20Scripting%20Reference%20-%20JavaScript.pdf

main();

function showExportDialog(success) {

  var dialog = new Window('dialog', 'Artboards exporter', undefined, { closeButton: true });
  dialog.alignChildren = 'left';
  dialog.orientation = 'column';

  var selectorGroup = dialog.add('group');
  selectorGroup.orientation = 'row';
  selectorGroup.alignChildren = 'left';

  var svgSelector = selectorGroup.add('checkbox', undefined, 'SVG');
  svgSelector.value = true;
  var pngSelector = selectorGroup.add('checkbox', undefined, 'PNG');

  var pngSelectorPanel = dialog.add('panel', undefined, 'PNG Settings');
  pngSelectorPanel.enabled = false;
  pngSelectorPanel.orientation = 'column';
  pngSelectorPanel.alignChildren = 'left';

  var pngFixedSelectorGroup = pngSelectorPanel.add('group');
  pngFixedSelectorGroup.orientation = 'row';
  pngFixedSelectorGroup.alignChildren = 'left';
  var pngSize64Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '64');
  var pngSize128Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '128');
  pngSize128Selector.value = true;
  var pngSize256Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '256');
  var pngSize512Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '512');
  var pngSizeCustomSelector = pngFixedSelectorGroup.add('radiobutton', undefined, 'custom');
  pngSizeCustomSelector.enabled = false;

  var pngCustomSizeSelectorGroup = pngSelectorPanel.add('group');
  pngCustomSizeSelectorGroup.orientation = 'row';
  pngCustomSizeSelectorGroup.alignChildren = 'left';

  pngCustomSizeSelectorGroup.add('statictext', undefined, 'Custom size:');
  var pngCustomSizeSelector = pngCustomSizeSelectorGroup.add('edittext', undefined, '128');
  pngCustomSizeSelector.characters = 5;


  pngSelector.onClick = function() {
    pngSelectorPanel.enabled = pngSelector.value;

    alert('PNG format not implemented yet');
    pngSelector.value = false;
    pngSelectorPanel.enabled = false;
  };

  pngSize64Selector.onClick = function() {
    pngCustomSizeSelector.text = '64';
    pngSizeCustomSelector.enabled = false;
  };
  pngSize128Selector.onClick = function() {
    pngCustomSizeSelector.text = '128';
    pngSizeCustomSelector.enabled = false;
  };
  pngSize256Selector.onClick = function() {
    pngCustomSizeSelector.text = '256';
    pngSizeCustomSelector.enabled = false;
  };
  pngSize512Selector.onClick = function() {
    pngCustomSizeSelector.text = '512';
    pngSizeCustomSelector.enabled = false;
  };

  pngCustomSizeSelector.onChanging = function() {
    if (!/^([1-9][0-9]*)?$/.test(pngCustomSizeSelector.text)) {
      pngCustomSizeSelector.text = pngCustomSizeSelector.text
        .replace(/[^0-9]/, '')
        .replace(/^0+/, '')
      ;
    }
    if (parseFloat(pngCustomSizeSelector.text) > 4096) {
      pngCustomSizeSelector.text = '4096';
    }

    pngSize64Selector.value
      = pngSize128Selector.value
      = pngSize256Selector.value
      = pngSizeCustomSelector.value
      = pngSize512Selector.value
      = false;

    pngSizeCustomSelector.enabled = false;

    switch(pngCustomSizeSelector.text) {
      case '64':
        pngSize64Selector.value = true;
        break;
      case '128':
        pngSize128Selector.value = true;
        break;
      case '256':
        pngSize256Selector.value = true;
        break;
      case '512':
        pngSize512Selector.value = true;
        break;
      default:
        pngSizeCustomSelector.value = true;
        pngSizeCustomSelector.enabled = true;
    }

  };

  pngCustomSizeSelector.onChange = function() {
    pngSize128Selector.value = true;
    pngCustomSizeSelector.text = '128';
  };


  var controlGroup = dialog.add('group');
  controlGroup.alignment = 'right';
  var okButton = controlGroup.add('button', undefined, 'OK', { name: 'ok' });
  controlGroup.add('button', undefined, 'Cancel', { name: 'cancel' });

  okButton.onClick = function() {
    var
      formats = {};

    if (svgSelector.value) {
      formats.svg = {};
    }
    if (pngSelector.value) {
      formats.png = {};
      formats.png.size = parseFloat(pngCustomSizeSelector.text);
    }

    if (formats.svg || formats.png) {
      success && success({
        formats: formats
      });
    }
    dialog.close();
  };

  dialog.show();

}

function getActiveDocument() {
  return app && app.activeDocument;
}

function getArtboards() {
  var
    doc;

  return (doc = getActiveDocument()) && doc.artboards || [];
}


function exportSvgFiles(folder) {
  var
    doc,
    options,
    artboards,
    index,
    pathSeparator,
    file,
    files,
    prefix;

  pathSeparator = Folder.fs == 'Windows'
    ? '\\'
    : '/';

  doc = getActiveDocument();
  artboards = getArtboards();

  prefix = '__' + Date.now().toString(32) + parseInt(String(Math.random()).slice(2)).toString(32);

  function sanitizeFileNames() {
    files = folder.getFiles(prefix + '_*');
    for (index = 0; index < files.length; index++) {
      file = files[index];
      file.rename(file.name.slice(prefix.length + 1));
    }
  }

  if (artboards.length > 0) {
    file = new File(folder.fullName + pathSeparator + prefix);

    options = new ExportOptionsSVG();
    options.saveMultipleArtboards = true;

    try {
      doc.exportFile(file, ExportType.SVG, options);
      sanitizeFileNames();
    }
    catch(e) {
      sanitizeFileNames();
    }
  }
}

function exportPngFiles(folder, settings) {
  var
    doc,
    exportOptions,
    artboards,
    index,
    artboard,
    pathSeparator;

  pathSeparator = Folder.fs == 'Windows'
    ? '\\'
    : '/';

  doc = getActiveDocument();
  exportOptions = new ExportOptionsPNG24();
  artboards = getArtboards();

  if (artboards.length > 0) {

    for (index = 0; index < artboards.length; index++) {
      artboard = artboards[index];

    }
  }

}

function main() {
  showExportDialog(function(data) {
    var
      folder,
      folderPath,
      svgFolderPath,
      svgFolder,
      pngFolderPath,
      pngFolder,
      pathSeparator;

    folder = Folder.selectDialog();
    if (folder) {
      folderPath = folder.fullName;

      pathSeparator = Folder.fs == 'Windows'
        ? '\\'
        : '/';

      if (data.formats.svg) {
        svgFolderPath = folderPath + pathSeparator + 'SVG';
        svgFolder = new Folder(svgFolderPath);
        if (!svgFolder.exists) {
          if (!svgFolder.create()) {
            alert('Could not create folder for SVG files "' + svgFolderPath + '"');
          }
          else {
            exportSvgFiles(svgFolder, data.formats.svg);
          }
        }
        else {
          exportSvgFiles(svgFolder, data.formats.svg);
        }
      }

      if (data.formats.png) {
        pngFolderPath = folderPath + pathSeparator + 'PNG';
        pngFolder = new Folder(pngFolderPath);
        if (!pngFolder.exists) {
          if (!pngFolder.create()) {
            alert('Could not create folder for PNG files "' + svgFolderPath + '"');
          }
          else {
            exportPngFiles(pngFolder, data.formats.png);
          }
        }
        else {
          exportPngFiles(pngFolder, data.formats.png);
        }
      }


    }
  });
}





