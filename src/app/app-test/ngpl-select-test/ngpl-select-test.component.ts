import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'ngpl-select-test',
  templateUrl: './ngpl-select-test.component.html',
  styleUrls: ['./ngpl-select-test.component.scss']
})
export class NgplSelectTestComponent implements OnInit {

  index = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  items: any[] = [];

  formGroup: FormGroup;
  disableControl = new FormControl();
  readOnlyControl = new FormControl();


  constructor(private _formB: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this._formB.group({
      autocomplete: [],
      autocomplete1: [],
      autocomplete2: []
    });

    this.items = this.index.map((i) => {

      return {
        id: i,
        descripcion: String.getRandomSentence(3)
      };
    });

    // this.formGroup.statusChanges
    //   .pipe(
    //     untilDestroyed(this),
    //     tap(val => console.log('statusChanges', val, this.formGroup.value))
    //   )
    //   .subscribe();
  }
}
