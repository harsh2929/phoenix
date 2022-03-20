import { Color } from 'three';
import { Cut } from '../../extras/cut.model';

export interface PhoenixUI<T> {
  /**
   * Clear the menu by removing all folders.
   */
  clear(): void;

  /**
   * Add geometry (detector geometry) folder to the menu.
   */
  addGeometryFolder(): void;

  /**
   * Add geometry to the menu's geometry folder and set up its configurable options.
   * @param name Name of the geometry.
   * @param color Color of the geometry.
   * @param initiallyVisible Whether the geometry is initially visible or not.
   * @param menuSubfolder Subfolder in the menu to add the geometry to. Example `Folder > Subfolder`.
   */
  addGeometry(
    name: string,
    color: Color,
    initiallyVisible?: boolean,
    menuSubfolder?: string
  ): void;

  /**
   * Add event data folder with functions for event data toggles like show/hide and depthTest.
   */
  addEventDataFolder(): void;

  /**
   * Add folder for event data type like tracks or hits to the menu.
   * @param typeName Name of the type of event data.
   * @returns Menu's folder for event data type.
   */
  addEventDataTypeFolder(typeName: string): T;

  /**
   * Add collection folder and its configurable options to the event data type (tracks, hits etc.) folder.
   * @param typeFolder Menu folder of an event data type.
   * @param collectionName Name of the collection to be added in the type of event data (tracks, hits etc.).
   * @param cuts Cuts to the collection of event data that are to be made configurable to filter event data.
   * @param collectionColor Default color of the collection.
   */
  addCollection(
    typeFolder: T,
    collectionName: string,
    cuts?: Cut[],
    collectionColor?: Color
  ): void;

  /**
   * Add labels folder to the menu.
   * @param configFunctions Functions to attach to the labels folder configuration.
   */
  addLabelsFolder(configFunctions: any): void;

  /**
   * Add folder for configuration of label.
   * @param labelId Unique ID of the label.
   * @param onRemoveLabel Function called when label is removed.
   */
  addLabel(labelId: string, onRemoveLabel: () => void): void;

  /**
   * Remove label folder from the menu and scene if it exists.
   * @param labelId A unique label ID string.
   * @param labelFolderReference Reference to the label folder.
   */
  removeLabelFolder(labelId: string, labelFolderReference: T): void;
}
