import { OnInit, Component, Input } from '@angular/core';
import { EventDisplayService } from '../../../../services/event-display.service';
import { MatDialogRef } from '@angular/material/dialog';
import { JiveXMLLoader, ScriptLoader } from 'phoenix-event-display';
import { EventDataFormat } from '../../../../types';
import JSZip from 'jszip';

@Component({
  selector: 'app-io-options-dialog',
  templateUrl: './io-options-dialog.component.html',
  styleUrls: ['./io-options-dialog.component.scss'],
})
export class IOOptionsDialogComponent implements OnInit {
  @Input()
  eventDataFormats: EventDataFormat[] = [EventDataFormat.JSON];
  eventDataFormatsWithHandler: {
    format: EventDataFormat;
    fileType: string;
    accept?: string;
    handler: () => void;
  }[];
  private supportedEventDataFormats = [
    {
      format: EventDataFormat.JSON,
      fileType: '.json',
      accept: 'application/json',
      handler: this.handleJSONEventDataInput.bind(this),
    },
    {
      format: EventDataFormat.JIVEXML,
      fileType: '.xml',
      accept: 'text/xml',
      handler: this.handleJiveXMLDataInput.bind(this),
    },
    {
      format: EventDataFormat.ZIP,
      fileType: '.zip',
      handler: this.handleZipEventDataInput.bind(this),
    },
    {
      format: EventDataFormat.IG,
      fileType: '.ig',
      handler: () => {},
    },
  ];

  constructor(
    private eventDisplay: EventDisplayService,
    public dialogRef: MatDialogRef<IOOptionsDialogComponent>
  ) {}

  ngOnInit() {
    this.eventDataFormatsWithHandler = this.supportedEventDataFormats.filter(
      (eventDataFormat) =>
        this.eventDataFormats.includes(eventDataFormat.format)
    );
  }

  getSupportedEventDataFormats() {
    return this.eventDataFormats
      .filter((format) => format !== 'ZIP')
      .join(', ');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  handleJSONEventDataInput(files: FileList) {
    const callback = (content: any) => {
      const json = typeof content === 'string' ? JSON.parse(content) : content;
      this.eventDisplay.parsePhoenixEvents(json);
    };
    this.handleFileInput(files[0], 'json', callback);
  }

  handleJiveXMLDataInput(files: FileList) {
    const callback = (content: any) => {
      const jiveloader = new JiveXMLLoader();
      jiveloader.process(content);
      const eventData = jiveloader.getEventData();
      this.eventDisplay.buildEventDataFromJSON(eventData);
    };
    this.handleFileInput(files[0], 'xml', callback);
  }

  handleOBJInput(files: FileList) {
    const callback = (content: any, name: string) => {
      this.eventDisplay.parseOBJGeometry(content, name);
    };
    this.handleFileInput(files[0], 'obj', callback);
  }

  handleSceneInput(files: FileList) {
    const callback = (content: any) => {
      this.eventDisplay.parsePhoenixDisplay(content);
    };
    this.handleFileInput(files[0], 'phnx', callback);
  }

  handleGLTFInput(files: FileList) {
    const callback = (content: any, name: string) => {
      this.eventDisplay.parseGLTFGeometry(content, name);
    };
    this.handleFileInput(files[0], 'gltf', callback);
  }

  handlePhoenixInput(files: FileList) {
    const callback = (content: any) => {
      this.eventDisplay.parsePhoenixDisplay(content);
    };
    this.handleFileInput(files[0], 'phnx', callback);
  }

  handleROOTInput(files: FileList) {
    ScriptLoader.loadJSRootScripts().then((JSROOT: any) => {
      const objectName = prompt('Enter object name in ROOT file');
      JSROOT.openFile(files[0]).then((file: any) => {
        file.readObject(objectName).then((obj: any) => {
          this.eventDisplay.loadJSONGeometry(
            JSROOT.GEO.build(obj, { dflt_colors: true }).toJSON(),
            files[0].name.split('.')[0]
          );
        });
      });
    });
    this.onNoClick();
  }

  handleRootJSONInput(files: FileList) {
    ScriptLoader.loadJSRootScripts().then((JSROOT: any) => {
      const callback = (content: any, name: string) => {
        this.eventDisplay.loadJSONGeometry(
          JSROOT.GEO.build(JSROOT.parse(content), {
            dflt_colors: true,
          }).toJSON(),
          name
        );
      };
      this.handleFileInput(files[0], 'gz', callback);
    });
  }

  handleZipEventDataInput(files: FileList) {
    if (this.isFileOfExtension(files[0], 'zip')) {
      this.handleZipInput(files[0], (allFilesWithData) => {
        const allEventsObject = {};

        // JSON event data
        Object.keys(allFilesWithData)
          .filter((fileName) => fileName.endsWith('.json'))
          .forEach((fileName) => {
            Object.assign(
              allEventsObject,
              JSON.parse(allFilesWithData[fileName])
            );
          });

        // JiveXML event data
        const jiveloader = new JiveXMLLoader();
        Object.keys(allFilesWithData)
          .filter((fileName) => fileName.endsWith('.xml'))
          .forEach((fileName) => {
            jiveloader.process(allFilesWithData[fileName]);
            const eventData = jiveloader.getEventData();
            Object.assign(allEventsObject, { [fileName]: eventData });
          });

        this.eventDisplay.parsePhoenixEvents(allEventsObject);

        this.onNoClick();
      });
    } else {
      console.error('Error: Invalid file format!');
      this.eventDisplay.getInfoLogger().add('Invalid file format!', 'Error');
    }
  }

  async handleZipInput(
    file: File,
    callback: (allFilesWithData: { [key: string]: string }) => void
  ) {
    const allFilesWithData: { [key: string]: string } = {};
    // Using a try catch block to catch any errors in Promises
    try {
      const zipArchive = new JSZip();
      await zipArchive.loadAsync(file);
      const allFiles = Object.keys(zipArchive.files);
      for (const singleFile of allFiles) {
        const fileData = await zipArchive.file(singleFile).async('string');
        allFilesWithData[singleFile] = fileData;
      }
      callback(allFilesWithData);
    } catch (error) {
      console.error('Error while reading zip', error);
      this.eventDisplay.getInfoLogger().add('Could not read zip file', 'Error');
    }
  }

  handleFileInput(
    file: File,
    extension: string,
    callback: (result: string, fileName?: string) => void
  ) {
    const reader = new FileReader();
    if (this.isFileOfExtension(file, extension)) {
      reader.onload = () => {
        callback(reader.result.toString(), file.name.split('.')[0]);
      };
      reader.readAsText(file);
    } else {
      console.error('Error: Invalid file format!');
      this.eventDisplay.getInfoLogger().add('Invalid file format!', 'Error');
    }
    this.onNoClick();
  }

  private isFileOfExtension(file: File, extension: string) {
    return file.name.split('.').pop() === extension;
  }

  saveScene() {
    this.eventDisplay.exportPhoenixDisplay();
  }

  exportOBJ() {
    this.eventDisplay.exportToOBJ();
  }
}
