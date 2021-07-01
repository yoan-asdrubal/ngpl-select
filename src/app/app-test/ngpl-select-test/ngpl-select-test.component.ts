import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'ngpl-select-test',
  templateUrl: './ngpl-select-test.component.html',
  styleUrls: ['./ngpl-select-test.component.scss']
})
export class NgplSelectTestComponent implements OnInit {

  items: any[] = [];

  formGroup: FormGroup;
  disableControl = new FormControl();
  readOnlyControl = new FormControl();
  loadingControl = new FormControl();


  constructor(private _formB: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this._formB.group({
      select: [],
      select1: [],
      select2: [],
      select3: [],
      select4: [],
      select5: []
    });

    this.items = Array(25).fill(1).map((i, index) => {

      return {
        id: index,
        descripcion: String.getRandomSentence(3)
      };
    });

  }

  labelFn(item): string {
    return `${item.id} - ${item.descripcion}`;
  }

}
