import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild, ElementRef,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {Changes} from 'ngx-reactivetoolkit';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {isNotNullOrUndefined} from 'ngpl-common';
import {CdkOverlayOrigin, Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {NgplItemTemplateDirective} from '../ngpl-item-template.directive';
import {NgplItemsNotFoundTemplateDirective} from '../ngpl-items-not-found-template.directive';
import {NgplNoItemsTemplateDirective} from '../ngpl-no-items-template.directive';
import {NGPL_FILTER_BASE, NgplFilterBase, NgplFilterService} from 'ngpl-filter';
import {MatFormField} from "@angular/material/form-field";

/**
 * Se comporta como un select, permite realizar busqueda sobre las opciones en el frontend
 * Es compatible con los formularios de angular, se puede utilizar con [(ngModel)] o [formControl]
 */
@UntilDestroy()
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngpl-select',
  templateUrl: './ngpl-select.component.html',
  styleUrls: ['./ngpl-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgplSelectComponent),
      multi: true
    },
    {
      provide: NGPL_FILTER_BASE, useExisting: forwardRef(() => NgplSelectComponent)
    }
  ]
})
export class NgplSelectComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor, NgplFilterBase {
  /** Conjunto de elementos que se mostrara en las opciones del Select */
  @Input() items: any[] = [];

  @Changes('items') items$;
  /**
   *  Si es un arreglo de objectos define la propiedad dentro del objeto que se manejara como valor , en caso de ser un
   * arreglo de objetos y no ser especificada se tomará como value el item completo
   */
  @Input() propValue = undefined;

  /** Si es un arreglo de objetos define la propiedad dentro del objeto que se mostrara como label en la opción , en caso de ser
   * una cadena de string se mostrara el valor de cada objeto
   * Por defecto se toma la propiedad descripcion
   */
  @Input() propLabel = 'descripcion';

  /**
   * Funcion para generar el label de cada opción, en caso de ser especificada tiene prioridad sobre {@link label}
   */
    // tslint:disable-next-line:ban-types
  @Input() labelFn: Function = undefined;

  /**
   * Define las propiedades del objeto sobre las que se aplicará el filtro,
   * en caso de no especificarse se tomara por defecto el key descripcion
   */
  @Input() filterBy: string | string[] = ['descripcion'];

  /**
   * Template para mostrar cuando no existan elementos.
   */
  @Input() noItemsTemplate: TemplateRef<any>;
  /**
   * Template para mostrar cuando no existan resultados en la búsqueda, es opcional.
   */
  @Input() noResultTemplate: TemplateRef<any>;
  /**
   * Template para mostrar cuando no existan resultados en la búsqueda, es opcional.
   */

  @Input() noItemsText = 'No hay elementos.';

  /**
   * Template para mostrar cuando no existan resultados en la búsqueda, es opcional.
   */
  @Input() noResultText = 'No hay Coincidencias.';

  /**
   * Conjunto de clases que se aplicaran al mat-form-field de la vista
   */
  @Input() classes = '';

  /**
   * Define el ancho del panel del Autocomplete, por defecto 100% del elemento sobre el que se muestra
   */
  @Input() panelWidth = null;
  /**
   * Mat-Label que se mostrará en el mat-form-field del autocomplete
   */
  @Input() placeHolder = 'Seleccione';
  /**
   *  Especifica el texto que se mostrara en la opcion vacia
   */
  @Input() cleanOptionLabel = 'TODOS';

  /**
   *  Define el comportamiento del floatLabel en el matFormField, acepta los mismos valores que el atributo floatLabel del matFormField
   */
  @Input() floatLabel = '';

  /**
   * Propiedad para identificar los datos en el proceso de seleccion, por defecto 'id'
   */
  @Input() trackBy = 'id';

  /**
   * Define si el campo de búsqueda tendra posicion sticky o no, por defecto es true
   */
  @Input() stickSearch = true;

  /**
   * Define si se muestra el campo para filtrar
   */
  @Input() searcheable = true;

  /** Define si se muestra la opcion TODOS, en la mayoria de los formularios de creacion no se utilizara esta opcion por lo
   * que se puede especificar este atributo como showAllOption=false
   */
  @Input() showAllOption = true;

  @Input() showAllOptionText = 'TODOS';


  /** Define el atributo appearance del matFormField, permite los mismos valores */
  @Input() appearance: 'legacy' | 'standard' | 'fill' | 'outline' | 'default' = 'outline';

  /**
   * Define si se aplica la clase no-empty al matFormField
   */
  @Input() outlineAlways = false;


  /**  Controla si el componenten debe mostrar un Skeleton */
  @Input() showLoading = false;

  @Input() showLoadingWidth = '100%';
  @Input() showLoadingHeight = '15px';
  /**
   * Define si se muestra el icono en el campo de filtrar
   */
  @Input() showIconSearch = true;

  /**
   * Define si el componente estara deshabilitado
   */
  disabledControl = false;

  @Input() readOnlyControl = false;

  /**
   * Emite cuando cambia el valor seleccionado
   */
  @Output() valueChange = new EventEmitter();

  /**
   * Controla el valor que está seleccionado
   */
  _selectedValue: any;


  @Input() useAsFilter = false;

  /**
   * Input para modificar el valor seleccionado, se llama internamente a la funcion writeValue para que actualize todas las
   * propiedades correspondientes en el componente {@link _selectedValue} {@link searchFormCtrl} {@link inputFormControl}
   * y {@link filteredItems$}
   * @param newValue
   */
  @Input() set selectedValue(newValue) {
    this.writeValue(newValue);
  }

  /**
   * Emite los valores filtrados en el componente
   */
  filteredItems$ = new ReplaySubject<any[]>(1);
  filteredItems = [];

  /**
   * FormControl que controla el campo sobre el que se realiza la busqueda
   */
  searchFormCtrl = new FormControl('');

  /**
   * FormControl que controla el valor que se le muestra al usuario al seleccionar un elemento
   */
  inputFormControl = new FormControl('');

  filterConfig = {};

  /**
   * Referencia al panel del autocomplete , se utiliza para abrir o cerrar el mismo segun corresponda
   */
  @ViewChild('customInput', {read: MatAutocompleteTrigger}) searchAutoCompletePanel;
  @ViewChild('searchInput') searchInput;
  @Input() customClass: '';

  @Input() itemTemplate: TemplateRef<any>;

  private overlayRef: OverlayRef;
  ngControl: NgControl;
  @ViewChild(CdkOverlayOrigin, {static: true}) origin: CdkOverlayOrigin;
  @ViewChild('origin', {static: true}) divOrigin: ElementRef;
  @ViewChild('templatePortalContent', {static: true}) templatePortalContent: TemplateRef<any>;

  @ContentChild(NgplItemTemplateDirective, {static: false})
  itemTemplateRef: NgplItemTemplateDirective;

  @ContentChild(NgplItemsNotFoundTemplateDirective, {static: false})
  itemNoFoundTemplateRef: NgplItemsNotFoundTemplateDirective;

  @ContentChild(NgplNoItemsTemplateDirective, {static: false})
  noItemsTemplateRef: NgplNoItemsTemplateDirective;


  constructor(private overlay: Overlay,
              private injector: Injector,
              private changeDetectorRef: ChangeDetectorRef,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private _viewContainerRef: ViewContainerRef,
              private ngplFilterService: NgplFilterService) {
  }

  /** Parte 1
   * Emite como valor inicial para {@link filteredItems$} todos los items especificados
   *
   * Parte 2
   * Se subscribe a los cambios en {@link searchFormCtrl} para realizar la búsqueda,
   * si no es especificado un valor se emite el arreglo de elementos
   * Si se especifica un valor se configura un filtro en el formato correspondiente para utilizar {@link filterPipe}
   */
  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, 2);

    // Parte 1
    this.items$
      .pipe(
        untilDestroyed(this),
        tap((items: any[]) => {
          this.items = items;
          if (isNotNullOrUndefined(this.items) && this.items.length > 0) {
            const item = this.findItemByValue(this._selectedValue);
            this.select(item);
          }

          this.applyFilter(this.items, this.filterConfig);
        })
      )
      .subscribe();

    // Parte 2
    this.searchFormCtrl.valueChanges.pipe(
      untilDestroyed(this),
      debounceTime(300)

      , distinctUntilChanged()

      , tap((value: string) => {
          if (!!value && value.trim().length === 0) {
            this.filteredItems = this.items;
            this.filteredItems$.next(this.items);
          } else {
            this.filterConfig = {
              filter: {
                value: value,
                keys: typeof this.filterBy === 'string' ? this.filterBy.split(',') : this.filterBy
              }
            };
            this.applyFilter(this.items, this.filterConfig);
          }
        }
      )
    ).subscribe();

    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.origin.elementRef)
      .withPositions([{
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: -22
      }, {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: 22
      }
      ]);


    console.log('this.elementRef', this.divOrigin);
    console.log('this.nativeElement', this.divOrigin.nativeElement);
    console.log('this.offsetWidth', this.divOrigin.nativeElement.offsetWidth);
    console.log('this.clientWidth', this.divOrigin.nativeElement.clientWidth);

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy
    });
    this.overlayRef.backdropClick()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.overlayRef.detach();
      });
  }

  openPanelWithBackdrop(event): void {

    event.stopPropagation();
    event.preventDefault();
    if (this.disabledControl || this.readOnlyControl || !!this.showLoading) {
      return;
    }
    this.overlayRef.attach(new TemplatePortal(
      this.templatePortalContent,
      this._viewContainerRef));

  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(): void {
  }

  ngOnDestroy(): void {
    this.valueChange.emit(null);
  }

  selectItem(item): any {
    this.overlayRef.detach();
    return this.select(item) ? this.emit() : '';
  }

  /**
   * Selecciona un elemento
   * Si no se especifica un elemento las variables value y label seran vacias
   * Si se especifica un elemento, se se la asigna los valores correspondientes en funcion de
   * {@link labelFn}, {@link propLabel} y {@link propValue}
   * Se cierra el panel del autocomplete
   * Se actualizan los valores correspondientes en {@link inputFormControl} y {@link valueChange}
   *
   * Se ejecutan {@link onchange} y {@link onTouch} para comportamiento de ControlValueAccessor
   * @param item Objeto a seleccionar
   */
  select(item): boolean {

    let label = item;
    let value = item;
    if (!item) {
      label = '';
      value = '';
    } else {
      if (label !== '') {
        label = this.labelFn ? this.labelFn(item) : item[this.propLabel] || item;
      }
      if (value !== '') {
        value = this.propValue ? item[this.propValue] : item;
      }
    }
    if (this.searchAutoCompletePanel) {
      this.searchAutoCompletePanel.closePanel();
    }
    this.inputFormControl.setValue(label);
    if (this._selectedValue !== value) {
      this._selectedValue = value;
      return true;
    }
    return false;
  }

  public emit(): void {
    this.valueChange.emit(this._selectedValue);
    this.onChange(this._selectedValue);
    this.onTouch(this._selectedValue);
  }

  clear(): void {
    this._selectedValue = null;
    this.emit();
  }

  /**
   * Limpia el campo de búsqueda, previeve la propagacion del evento para que no se cierre el panel del autocomplete
   * @param event
   */
  clearSearch(event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchFormCtrl.setValue('');
  }

  onChange: any = () => {
  };
  onTouch: any = () => {
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledControl = isDisabled;
  }

  writeValue(obj: any): void {

    const item = this.findItemByValue(obj);
    let label = item;
    let value = item;
    if (!item) {
      this.inputFormControl.setValue('');
      this._selectedValue = obj;
    } else {
      // @ts-ignore
      if (label !== '') {
        label = this.labelFn ? this.labelFn(item) : item[this.propLabel] || item;
      }
      // @ts-ignore
      if (value !== '') {
        value = this.propValue ? item[this.propValue] : item;
      }
      this.inputFormControl.setValue(label);
      this._selectedValue = value;
    }
  }

  applyFilter(items, filter): void {
    this.stickSearch = false;
    this.filteredItems = this.ngplFilterService.filter(items, filter);
    this.filteredItems$.next(this.filteredItems);
    this.stickSearch = true;
  }

  /**
   * Realiza la busqueda de un item dado un valor
   * Si {@link propValue} es especificado , se compara el valor con item[this.propValue] accediendo a la propiedad del objeto
   * Si {@link propValue} no es especificado se compara el item completo con el valor
   *
   * @param value
   */
  findItemByValue(value: any): boolean {
    if ((!value && typeof value !== 'number' && typeof value !== 'boolean') || !this.items) {
      return null;
    }
    return this.items.find(item => {
      if (typeof value === typeof item && typeof item === 'object') {
        return item[this.trackBy] === value[this.trackBy];
      } else if (typeof value === typeof item && typeof item === 'string') {
        return value.toString().trim().toLowerCase() === item.toString().trim().toLowerCase();
      } else if (!!this.propValue) {
        return item[this.propValue].toString() === value.toString();
      }
      return false;
    });
  }

  inputSearchFocus(): void {
    setTimeout(() => {
      if (!!this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 200);
  }

  clearValue(): void {
    this.inputFormControl.setValue('');
    this._selectedValue = null;
    this.emit();
  }

  newValue(value: any): void {
    this.writeValue(value);
  }

  get minHigth(): any {
    return this.calcMinItems < 5 ? `${this.calcMinItems * 48}px` : `240px`;
  }

  get calcMinItems(): number {
    return this.filteredItems?.length + (this.showAllOption === true ? 1 : 0);
  }
}
