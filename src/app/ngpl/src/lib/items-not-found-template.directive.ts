import {AfterContentInit, ContentChild, Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: 'ngplItemsNoFoundTemplate'
})
export class ItemsNotFoundTemplateDirective implements AfterContentInit {
  @ContentChild(TemplateRef)
  template: TemplateRef<any>;

  constructor() {
  }

  ngAfterContentInit(): void {
    console.log('ngplItemsNoFoundTemplate', this.template);
  }

}
