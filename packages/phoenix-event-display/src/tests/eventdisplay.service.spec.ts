import { TestBed } from '@angular/core/testing';

import { EventDisplayService } from '../eventdisplay.service';
import { AppModule } from '../../app.module';
import { ThreeService } from '../three.service';
import { UIService } from '../ui.service';
import { HttpClient } from '@angular/common/http';
import { InfoLoggerService } from '../infologger.service';
import { Configuration } from '../extras/configuration.model';
import { ScriptLoader } from '../loaders/script-loader';
import { of } from 'rxjs';

describe('EventDisplayService', () => {

  let eventDisplay: EventDisplayService;
  let eventDisplayPrivate: any;
  let three: ThreeService;
  let ui: UIService;
  let http: HttpClient;

  const EVENT_KEY = "Event Key";
  const MOCK_EVENT_DATA = {
    "Event Key": {
      "eventNumber": 111,
      "runNumber": 111,
      "Tracks": {
        "TracksCollection": [{
          "chi2": 34.0819,
          "dof": 60,
          "dparams": [0.455548, -5.65437, -2.52317, 0.280894, -2.3769e-05],
          "color": "0x0000ff",
          "pos": [[-21.8387, -16.2481, 68.9534]
          ]
        }]
      }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [ThreeService, UIService, HttpClient, InfoLoggerService]
    });

    eventDisplay = TestBed.inject(EventDisplayService);
    eventDisplayPrivate = (eventDisplay as any);
    three = TestBed.get(ThreeService);
    ui = TestBed.get(UIService);
    http = TestBed.get(HttpClient);
  });

  it('should be created', () => {
    expect(eventDisplay).toBeTruthy();
  });

  it('should initialize event display', () => {
    spyOn(three, 'init').and.callThrough();
    spyOn(ui, 'showUI').and.callThrough();

    eventDisplay.init(new Configuration(true));

    expect(three.init).toHaveBeenCalled();
    expect(ui.showUI).toHaveBeenCalled();
  });

  describe('after init', () => {
    beforeEach(() => {
      eventDisplay.init(new Configuration(true));
    });

    it('should parse event data in phoenix format and call on event change functions', () => {
      const mockCallbackOnEventsChange = jasmine.createSpy('callback');
      eventDisplay.listenToLoadedEventsChange(mockCallbackOnEventsChange);

      expect(eventDisplay.parsePhoenixEvents(MOCK_EVENT_DATA)[0]).toBe(EVENT_KEY);

      expect(mockCallbackOnEventsChange).toHaveBeenCalled();
    });

    it('should build event data from JSON through event data loader and call on event change functions', () => {
      const mockCallbackOnEventsChange = jasmine.createSpy('callback');
      eventDisplay.listenToDisplayedEventChange(mockCallbackOnEventsChange);

      spyOn(eventDisplayPrivate.configuration.getEventDataLoader(), 'buildEventData')
        .and.callThrough();

      eventDisplay.buildEventDataFromJSON(MOCK_EVENT_DATA[EVENT_KEY]);

      expect(eventDisplayPrivate.configuration.getEventDataLoader().buildEventData)
        .toHaveBeenCalled();
      expect(mockCallbackOnEventsChange).toHaveBeenCalled();
    });

    it('should load event data', () => {
      const spy = spyOn(eventDisplay, 'buildEventDataFromJSON').and.stub();

      eventDisplayPrivate.eventsData = MOCK_EVENT_DATA;
      eventDisplay.loadEvent(EVENT_KEY);

      expect(eventDisplay.buildEventDataFromJSON).toHaveBeenCalled();

      spy.calls.reset();

      eventDisplay.loadEvent(undefined);

      expect(eventDisplay.buildEventDataFromJSON).toHaveBeenCalledTimes(0);
    });

    it('should load OBJ geometry through three and ui service', () => {
      spyOn(three, 'loadOBJGeometry').and.stub();
      spyOn(ui, 'addGeometry').and.stub();

      eventDisplay.loadOBJGeometry('test/file/path.obj', 'Test OBJ', 0xffffff);

      expect(three.loadOBJGeometry).toHaveBeenCalled();
      expect(ui.addGeometry).toHaveBeenCalled();
    });

    it('should parse OBJ geometry through three and ui service', () => {
      spyOn(three, 'parseOBJGeometry').and.stub();
      spyOn(ui, 'addGeometry').and.stub();

      eventDisplay.parseOBJGeometry('TestContentOfOBJFile', 'Test OBJ');

      expect(three.parseOBJGeometry).toHaveBeenCalled();
      expect(ui.addGeometry).toHaveBeenCalled();
    });

    it('should parse phoenix format for detector geometry and event data', () => {
      const phnxScene = {
        "sceneConfiguration": {
          "eventData": {
            "Tracks": ["TestCollection"]
          },
          "geometries": ["TestGeom"]
        },
        "scene": {
          "TestData": "TestValue"
        }
      };
      const TEST_PHNX_INPUT = JSON.stringify(phnxScene);

      spyOn(three, 'clearEventData').and.stub();
      spyOn(eventDisplayPrivate, 'loadSceneConfiguration').and.callThrough();
      const parseGLTFGeomSpy = spyOn(three, 'parseGLTFGeometry').and.stub();

      eventDisplay.parsePhoenixDisplay(TEST_PHNX_INPUT);

      expect(three.clearEventData).toHaveBeenCalled();
      expect(eventDisplayPrivate.loadSceneConfiguration).toHaveBeenCalled();
      expect(three.parseGLTFGeometry).toHaveBeenCalled();

      parseGLTFGeomSpy.calls.reset();

      eventDisplay.parsePhoenixDisplay(JSON.stringify({
        "sceneConfiguration": undefined
      }));

      expect(three.parseGLTFGeometry).toHaveBeenCalledTimes(0);
    });

    it('should load glTF geometry through three and ui service', () => {
      spyOn(three, 'loadGLTFGeometry').and.stub();
      spyOn(ui, 'addGeometry').and.stub();

      eventDisplay.loadGLTFGeometry('test/file/path.gltf', 'Test glTF', 1);

      expect(three.loadGLTFGeometry).toHaveBeenCalled();
      expect(ui.addGeometry).toHaveBeenCalled();
    });

    it('should load JSON geometry through three and ui service', () => {
      spyOn(three, 'loadJSONGeometry').and.stub();
      spyOn(ui, 'addGeometry').and.stub();

      eventDisplay.loadJSONGeometry('test/file/path.json', 'Test JSON', 1);

      expect(three.loadJSONGeometry).toHaveBeenCalled();
      expect(ui.addGeometry).toHaveBeenCalled();
    });

    it('should load ROOT geometries', (done) => {
      ScriptLoader.loadJSRootScripts((JSROOT) => {

        // Calling JSROOT functions through does not cover their code for some reason so not using a spy
        eventDisplay.loadRootJSONGeometry(JSROOT, 'https://root.cern/js/files/geom/cms.json.gz', 'Test JSON', 1);
        eventDisplay.loadRootGeometry(JSROOT, 'https://root.cern/js/files/geom/rootgeom.root', 'simple1;1', 'Test ROOT', 1);
        setTimeout(done, 4000);

        const spy = spyOn(eventDisplay, 'loadJSONGeometry').and.stub();
        eventDisplay.loadRootGeometry(JSROOT, 'not/a/root.file', 'object', 'Test ROOT', 1);
        expect(eventDisplay.loadJSONGeometry).toHaveBeenCalledTimes(0);
      });
    });

    it('should get collection through collection name', () => {
      spyOn(eventDisplayPrivate.configuration.getEventDataLoader(), 'getCollection').and.stub();
      eventDisplay.getCollection('TestCollection');
      expect(eventDisplayPrivate.configuration.getEventDataLoader().getCollection).toHaveBeenCalled();
    });

    it('should get collections', () => {
      spyOn(eventDisplayPrivate.configuration.getEventDataLoader(), 'getCollections').and.stub();
      eventDisplay.getCollections();
      expect(eventDisplayPrivate.configuration.getEventDataLoader().getCollections).toHaveBeenCalled();
    });

    it('should listen to function when displayed event changes', () => {
      const prevEventsChangeLength = eventDisplayPrivate.onEventsChange.length;
      eventDisplay.listenToLoadedEventsChange((events) => { });

      expect(eventDisplayPrivate.onEventsChange.length).toBe(prevEventsChangeLength + 1);
    });

    it('should get event metadata from event loader', () => {
      spyOn(eventDisplayPrivate.configuration.getEventDataLoader(), 'getEventMetadata').and.stub();

      eventDisplay.getEventMetadata();

      expect(eventDisplayPrivate.configuration.getEventDataLoader().getEventMetadata).toHaveBeenCalled();
    });

    it('should enable and run event display functions through console', () => {
      eventDisplayPrivate.enableEventDisplayConsole();
      expect(window.EventDisplay).toBeDefined();

      // Try running window EventDisplay functions

      spyOn(http, 'get').and.returnValue(of(''));

      spyOn(eventDisplay, 'loadGLTFGeometry').and.stub();
      window.EventDisplay.loadGLTFGeometry('test/path.gltf', 'Test');
      expect(eventDisplay.loadGLTFGeometry).toHaveBeenCalled();

      spyOn(eventDisplay, 'loadOBJGeometry').and.stub();
      window.EventDisplay.loadOBJGeometry('test/path.obj', 'Test', 0xffffff);
      expect(eventDisplay.loadOBJGeometry).toHaveBeenCalled();

      spyOn(eventDisplay, 'parseOBJGeometry').and.stub();
      window.EventDisplay.parseOBJGeometry('Content', 'Test');
      expect(eventDisplay.parseOBJGeometry).toHaveBeenCalled();

      spyOn(eventDisplayPrivate, 'loadSceneConfiguration').and.stub();
      window.EventDisplay.loadSceneConfiguration('test/path.phnx', 'Test', 0xffffff);

      spyOn(eventDisplay, 'parseGLTFGeometry').and.stub();
      window.EventDisplay.parseGLTFGeometry('test/path.gltf');
    });

    it('should initialize VR', () => {
      spyOn(three, 'initVRSession').and.callThrough();
      eventDisplay.initVR();
      expect(three.initVRSession).toHaveBeenCalled();
    });

    it('should end VR', () => {
      eventDisplay.initVR();

      spyOn(three, 'endVRSession').and.callThrough();
      eventDisplay.endVR();
      expect(three.endVRSession).toHaveBeenCalled();
    });

    it('should call three service functions', () => {
      spyOn(three, 'initVRSession').and.callThrough();
      eventDisplay.initVR();
      expect(three.initVRSession).toHaveBeenCalled();

      spyOn(three, 'exportSceneToOBJ').and.stub();
      eventDisplay.exportToOBJ();
      expect(three.exportSceneToOBJ).toHaveBeenCalled();

      spyOn(three, 'exportPhoenixScene').and.stub();
      eventDisplay.exportPhoenixDisplay();
      expect(three.exportPhoenixScene).toHaveBeenCalled();

      spyOn(three, 'parseGLTFGeometry').and.stub();
      eventDisplay.parseGLTFGeometry('{ "TestInput": "TestValue" }');
      expect(three.parseGLTFGeometry).toHaveBeenCalled();

      spyOn(three, 'zoomTo').and.callThrough();
      eventDisplay.zoomTo(1, 200);
      expect(three.zoomTo).toHaveBeenCalled();

      spyOn(three, 'setOverlayRenderer').and.stub();
      eventDisplay.renderOverlay(document.createElement('canvas'));
      expect(three.setOverlayRenderer).toHaveBeenCalled();

      spyOn(three, 'setSelectedObjectDisplay').and.stub();
      eventDisplay.allowSelection({ name: 'SelectedObject', attributes: [] });
      expect(three.setSelectedObjectDisplay).toHaveBeenCalled();

      spyOn(three, 'enableSelecting').and.stub();
      eventDisplay.enableSelecting(false);
      expect(three.enableSelecting).toHaveBeenCalled();

      spyOn(three, 'fixOverlayView').and.stub();
      eventDisplay.fixOverlayView(true);
      expect(three.fixOverlayView).toHaveBeenCalled();

      spyOn(three, 'getActiveObjectId').and.stub();
      eventDisplay.getActiveObjectId();
      expect(three.getActiveObjectId).toHaveBeenCalled();

      spyOn(three, 'lookAtObject').and.stub();
      eventDisplay.lookAtObject('test_uuid');
      expect(three.lookAtObject).toHaveBeenCalled();

      spyOn(three, 'highlightObject').and.stub();
      eventDisplay.highlightObject('test_uuid');
      expect(three.highlightObject).toHaveBeenCalled();
    });
  });
});