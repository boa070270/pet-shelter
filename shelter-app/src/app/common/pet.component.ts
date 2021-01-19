import {Component, Input, OnInit} from '@angular/core';
import {FieldValueType, PetType} from './types';
import {BasicService} from '../basic.service';
import {FieldsService} from '../fields.service';
import {BaseDataSource, ShowMediaType, UIDataSource} from 'ui-lib';
import {SystemLang} from 'ui-lib';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';

@Component({
  selector: 'app-pet',
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.sass']
})
export class PetComponent implements OnInit {
  @Input() data: PetType;
  @Input('petId') id: string;
  datasource: UIDataSource<ShowMediaType>;
  petsData: FieldValueType[];

  constructor(private service: BasicService, private route: ActivatedRoute,
              private fieldsService: FieldsService,
              private systemLang: SystemLang) { }

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
        this.datasource = new MediaDataSource(of(refs.map(v => ({
          mediaType: v.mimeType,
          mediaURI: `/api/v1/assets/${v.refId}`
        }))));
      }
    } else {
      this.datasource = new MediaDataSource(of([]));
    }
  }
}
class MediaDataSource extends BaseDataSource<ShowMediaType> {
  constructor(obs) {
    super(obs);
  }
  refresh(): void {
  }
}
