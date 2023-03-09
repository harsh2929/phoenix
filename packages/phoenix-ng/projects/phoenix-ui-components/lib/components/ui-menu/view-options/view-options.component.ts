import { Component, OnInit } from '@angular/core';
import { PresetView } from 'phoenix-event-display';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EventDisplayService } from '../../../services/event-display.service';

@Component({
  selector: 'app-view-options',
  templateUrl: './view-options.component.html',
  styleUrls: ['./view-options.component.scss'],
})
export class ViewOptionsComponent implements OnInit {
  views: PresetView[];

  constructor(private eventDisplay: EventDisplayService) {}

  ngOnInit(): void {
    this.views = this.eventDisplay.getUIManager().getPresetViews();
  }

  displayView($event: any, view: PresetView) {
    $event.stopPropagation();
    this.eventDisplay.getUIManager().displayView(view);
  }

  setAxis(change: MatCheckboxChange) {
    const value = change.checked;
    this.eventDisplay.getUIManager().setShowAxis(value);
  }

  setGrid(change: MatCheckboxChange) {
    const value = change.checked;
    this.eventDisplay.getUIManager().setShowGrid(value);
  }
}
const fontLoader = new THREE.FontLoader();

// Load the font file (this may take some time)
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {

  // Create a new TextGeometry for the x-axis label
  const xLabelGeometry = new THREE.TextGeometry('x', {
    font: font,
    size: 50,
    height: 10,
    curveSegments: 12
  });

 
  const xLabelMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
  const xLabelMesh = new THREE.Mesh(xLabelGeometry, xLabelMaterial);
  xLabelMesh.position.set(500, 0, 0);
    const yLabelMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
  const yLabelMesh = new THREE.Mesh(yLabelGeometry, yLabelMaterial);
  yLabelMesh.position.set(500, 0, 0);
  
    const zLabelMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
  const zLabelMesh = new THREE.Mesh(zLabelGeometry, zLabelMaterial);
  xLabelMesh.position.set(500, 0, 0);
  this.scene.add(xLabelMesh);
  this.scene.add(yLabelMesh);
  this.scene.add(zLabelMesh);
  

});
