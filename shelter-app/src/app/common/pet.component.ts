import {Component, Inject, Input, OnInit} from '@angular/core';
import {FieldValueType, PetType} from './types';
import {BasicService} from '../basic.service';
import {FieldsService} from '../fields.service';
import {AbstractDataSource, ArrayDataSource, ShowMediaType, SYSTEM_LANG_TOKEN, SystemLang} from 'ui-lib';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-pet',
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.sass']
})
export class PetComponent implements OnInit {
  @Input() data: PetType;
  @Input('petId') id: string;
  datasource: AbstractDataSource<ShowMediaType>;
  petsData: FieldValueType[];

  constructor(private service: BasicService, private route: ActivatedRoute,
              private fieldsService: FieldsService,
              @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang) { }

  ngOnInit(): void {
    if (!this.data) {
      const id = this.id || this.route.snapshot.paramMap.get('id');
      this.service.getPet(id).subscribe(data => {
        this.data = data;
        this.makeDataSource();
      });
    } else {
      this.makeDataSource();
    }
  }
  private makeDataSource(): void {
    if (this.data) {
      const fields = this.data.fields;
      const refs = this.data.ref;
      if (fields) {
        const data: FieldValueType[] = [];
        for (const f of fields) {
            data.push(this.fieldsService.fieldValueAsPair(f, this.systemLang));
        }
        this.petsData = data;
      }
      if (refs) {
        this.datasource = new ArrayDataSource(refs.map(v => ({
          mediaType: v.mimeType,
          mediaURI: `/api/v1/assets/${v.refId}`
        })));
      }
    } else {
      this.datasource = new ArrayDataSource([]);
    }
  }
}
