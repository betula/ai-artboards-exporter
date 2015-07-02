// guide http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/scripting/pdfs/javascript_tools_guide.pdf
// guide http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/illustrator/sdk/CC2014/Illustrator%20Scripting%20Reference%20-%20JavaScript.pdf

var
  overwrite = null;

main();

function getActiveDocument() {
  return app && app.activeDocument;
}

function getArtboards() {
  var
    doc;

  return (doc = getActiveDocument()) && doc.artboards || [];
}

function showExportDialog(success) {
  var
    atrboards = getArtboards();

  var dialog = new Window('dialog', 'Artboards exporter', undefined, { closeButton: true });
  dialog.alignChildren = 'left';
  dialog.orientation = 'column';

  var rangeGroup = dialog.add('group');
  rangeGroup.orientation = 'row';
  rangeGroup.alignChildren = ['left', 'top'];

  rangeGroup.add('statictext', undefined, 'Artboards:');
  var rangeAllSelector = rangeGroup.add('radiobutton', undefined, 'All');
  rangeAllSelector.value = true;

  var rangeUseCustomSelector = rangeGroup.add('radiobutton', undefined, 'Range');
  var rangeCustomSelector = rangeGroup.add('edittext', undefined, atrboards.length ? '1-'+atrboards.length : '');
  rangeCustomSelector.characters = 10;
  rangeCustomSelector.enabled = false;

  rangeUseCustomSelector.onClick = function() {
    rangeCustomSelector.enabled = pngSelector.value;
  };
  rangeAllSelector.onClick = function() {
    rangeCustomSelector.enabled = false;
  };

  var selectorGroup = dialog.add('group');
  selectorGroup.orientation = 'row';
  selectorGroup.alignChildren = ['left', 'top'];

  selectorGroup.add('statictext', undefined, 'Formats:');
  var svgSelector = selectorGroup.add('checkbox', undefined, 'SVG');
  svgSelector.value = true;
  var pngSelector = selectorGroup.add('checkbox', undefined, 'PNG');
  pngSelector.value = true;

  var pngSelectorPanel = dialog.add('panel', undefined, 'PNG Settings');
  pngSelectorPanel.orientation = 'column';
  pngSelectorPanel.alignChildren = ['left', 'top'];

  var pngFixedSelectorGroup = pngSelectorPanel.add('group');
  pngFixedSelectorGroup.orientation = 'row';
  pngFixedSelectorGroup.alignChildren = ['left', 'top'];
  var pngSize64Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '64');
  var pngSize128Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '128');
  pngSize128Selector.value = true;
  var pngSize256Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '256');
  var pngSize512Selector = pngFixedSelectorGroup.add('radiobutton', undefined, '512');
  var pngSizeCustomSelector = pngFixedSelectorGroup.add('radiobutton', undefined, 'Custom');
  pngSizeCustomSelector.enabled = false;

  var pngCustomSizeSelectorGroup = pngSelectorPanel.add('group');
  pngCustomSizeSelectorGroup.orientation = 'row';
  pngCustomSizeSelectorGroup.alignChildren = ['left', 'top'];

  pngCustomSizeSelectorGroup.add('statictext', undefined, 'Custom size:');
  var pngCustomSizeSelector = pngCustomSizeSelectorGroup.add('edittext', undefined, '128');
  pngCustomSizeSelector.characters = 5;


  pngSelector.onClick = function() {
    pngSelectorPanel.enabled = pngSelector.value;
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
      indexes = null,
      rangeMin = Math.min(1, atrboards.length),
      rangeMax = atrboards.length,
      formats = {};

    if (svgSelector.value) {
      formats.svg = {};
    }
    if (pngSelector.value) {
      formats.png = {};
      formats.png.size = parseFloat(pngCustomSizeSelector.text);
    }

    if (rangeUseCustomSelector.value) {
      indexes = map(
        reduce(
          filter(
            map(
              rangeCustomSelector.text.split(/[^0-9-]/),
              function(interval) {
                var
                  left,
                  right,
                  t,
                  numbers = [],
                  num;

                if (!interval) {
                  return null;
                }

                interval = interval.split('-');
                if (interval.length == 1) {
                  interval.push(interval[0]);
                }

                left = interval[0];
                left = left || left === '0'
                  ? parseInt(left)
                  : rangeMin;

                right = interval[interval.length - 1];
                right = right || right === '0'
                  ? parseInt(right)
                  : rangeMax;

                if (left > right) {
                  t = right;
                  right = left;
                  left = t;
                }

                for(num = left; num <= right; num++) {
                  numbers.push(num);
                }

                return numbers;
              }
            ),
            function(numbers) {
              return numbers;
            }
          ),
          function(result, numbers) {
            var
              index,
              num;

            for (index = 0; index < numbers.length; index++) {
              num = numbers[index];
              if (indexOf(result, num) == -1) {
                result.push(num);
              }
            }

            return result;
          },
          []
        ),
        function(number) {
          return number - 1;
        }
      );
    }

    if (formats.svg || formats.png) {
      success && success({
        indexes: indexes,
        formats: formats
      });
    }
    dialog.close();
  };

  dialog.show();

}



function exportSvgFiles(folder, settings, indexes) {
  var
    doc,
    options,
    artboards,
    artboard,
    index,
    pathSeparator,
    docName,
    prefix,
    file,
    files,
    fileDestination,
    tmpFolder,
    tmpFolderName,
    removes;

  pathSeparator = Folder.fs == 'Windows'
    ? '\\'
    : '/';

  doc = getActiveDocument();
  artboards = getArtboards();

  tmpFolderName = '__temp' + Date.now().toString(32) + parseInt(String(Math.random()).slice(2)).toString(32);

  function performFiles() {
    removes = [];

    if (indexes) {
      for (index = 0; index < artboards.length; index++) {
        artboard = artboards[index];
        if (indexOf(indexes, index) == -1) {
          removes.push(artboard.name);
        }
      }
    }

    files = tmpFolder.getFiles(prefix + '*');
    if (files.length == 0) {
      files = tmpFolder.getFiles('*');
      prefix = '';
    }

    for (index = 0; index < files.length; index++) {
      file = files[index];
      fileDestination = new File(folder.fullName + pathSeparator + file.name.slice(prefix.length));

      if (
        indexOf(removes, fileDestination.name.split('.').slice(0, -1).join('.')) != -1
      ) {
        file.remove();
      }
      else {
        if (fileDestination.exists) {
          if (overwrite === null) {
            overwrite = !!confirm('Some destination files are exists. Overwrite it?');
          }
          if (overwrite === true) {
            fileDestination.remove();
            file.copy(fileDestination);
          }
          else {
            file.remove();
          }
        }
        else {
          file.copy(fileDestination);
        }
      }
    }
  }

  function removeTmpFolder() {
    tmpFolder = new Folder(folder.fullName + pathSeparator + tmpFolderName);
    files = tmpFolder.getFiles('*');
    for (index = 0; index < files.length; index++) {
      files[index].remove();
    }
    tmpFolder.remove();
  }

  function finalizeExport() {
    performFiles();
    removeTmpFolder();
  }

  if (artboards.length > 0) {
    docName = doc.name;

    prefix = docName.indexOf('.') > 0
      ? docName.split('.').slice(0, -1).join('.') + '_'
      : docName + '-';

    tmpFolder = new Folder(folder.fullName + pathSeparator + tmpFolderName);
    if (!tmpFolder.exists) {
      if (!tmpFolder.create()) {
        alert('Could not create tmp folder for SVG files export "' + tmpFolder.fullName + '"');
        return;
      }
    }
    files = tmpFolder.getFiles('*');
    for (index = 0; index < files.length; index++) {
      files[index].remove();
    }

    file = new File(folder.fullName + pathSeparator + tmpFolderName + pathSeparator + docName);
    options = new ExportOptionsSVG();
    options.saveMultipleArtboards = true;

    try {
      doc.exportFile(file, ExportType.SVG, options);
      finalizeExport();
    }
    catch(e) {
      finalizeExport();
    }
  }
}

function exportPngFiles(folder, settings, indexes) {
  var
    doc,
    options,
    artboards,
    index,
    artboard,
    pathSeparator,
    file,
    artboardRect,
    artboardWidth,
    artboardHeight,
    artboardScale,
    files;

  pathSeparator = Folder.fs == 'Windows'
    ? '\\'
    : '/';

  doc = getActiveDocument();
  artboards = getArtboards();

  if (artboards.length > 0) {

    for (index = 0; index < artboards.length; index++) {
      if (indexes && indexOf(indexes, index) == -1) {
        continue;
      }

      artboards.setActiveArtboardIndex(index);
      artboard = artboards[index];

      artboardRect = artboard.artboardRect;
      artboardWidth = artboardRect[2]-artboardRect[0];
      artboardHeight = artboardRect[1]-artboardRect[3];

      file = new File(folder.fullName + pathSeparator + artboard.name + '.png');

      if (file.exists) {
        if (overwrite === null) {
          overwrite = !!confirm('Some destination files are exists. Overwrite it?');
        }
        if (overwrite === true) {
          file.remove();
        }
      }

      options = new ExportOptionsPNG24();
      options.artBoardClipping = true;

      if (settings.size) {
        artboardScale = Math.min(
          settings.size / artboardWidth,
          settings.size / artboardHeight
        );
        options.horizontalScale = options.verticalScale = artboardScale * 100;
      }

      doc.exportFile(file, ExportType.PNG24, options);
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
            exportSvgFiles(svgFolder, data.formats.svg, data.indexes);
          }
        }
        else {
          exportSvgFiles(svgFolder, data.formats.svg, data.indexes);
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
            exportPngFiles(pngFolder, data.formats.png, data.indexes);
          }
        }
        else {
          exportPngFiles(pngFolder, data.formats.png, data.indexes);
        }
      }

      alert('Done');

    }
  });
}


function map(values, fn) {
  var
    index,
    result = [];
  for (index = 0; index < values.length; index++) {
    result.push(
      fn(values[index])
    )
  }
  return result;
}

function filter(values, fn) {
  var
    index,
    result = [];
  for (index = 0; index < values.length; index++) {
    if (fn(values[index])) {
      result.push(values[index])
    }
  }
  return result;
}

function reduce(values, fn, init) {
  var
    index,
    result = init;
  for (index = 0; index < values.length; index++) {
    result = fn(result, values[index]);
  }
  return result;
}

function indexOf(values, value) {
  var
    index;
  for (index = 0; index < values.length; index++) {
    if (values[index] === value) {
      return index;
    }
  }
  return -1;
}
