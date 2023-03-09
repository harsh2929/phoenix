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


setEtaPhiGrid(event: MatCheckboxChange) {
  if (event.checked) {
    const etaPhiGridHelper = new THREE.GridHelper(1000, 50);
    etaPhiGridHelper.position.set(0, 0, 0);
    this.scene.add(etaPhiGridHelper);
    this.etaPhiGridHelper = etaPhiGridHelper;
  } else {
    this.scene.remove(this.etaPhiGridHelper);
  }
}
