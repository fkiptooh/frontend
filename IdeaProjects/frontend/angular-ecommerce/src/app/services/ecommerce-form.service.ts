import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { County } from '../common/county';
import { map } from 'rxjs/operators';
import { Town } from '../common/town';

@Injectable({
  providedIn: 'root'
})
export class EcommerceFormService {

  private countiesUrl = 'http://localhost:8080/api/counties';
  private townsUrl = 'http://localhost:8080/api/towns';

  constructor(private httpClient: HttpClient) { }

  getCounties(): Observable<County[]>{

    return this.httpClient.get<GetResponseCounties>(this.countiesUrl).pipe(
      map(response => response._embedded.counties)
    );
  }

  getTowns(theCountyCode: string): Observable<Town[]>{
    // search url

    const searchTownUrl = `${this.townsUrl}/search/findByCountyCode?code=${theCountyCode}`;

    return this.httpClient.get<GetResponseTowns>(searchTownUrl).pipe(
      map(response => response._embedded.towns)
    );
  }

  getCreditCardMonths(startMonth: number): Observable<number[]>{

    let data: number[] = [];
    // build an array for "month" drop down list
    // start with current month and loop to the last month

    for(let theMonth = startMonth; theMonth <=12; theMonth++ ){
      data.push(theMonth);
    }

    return of(data);
  }

  getCreditCardYears(): Observable<number[]>{

    let data: number[] = [];

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for(let theYear = startYear; theYear <= endYear; theYear++){
      data.push(theYear);
    }

    return of(data);
  }
}

interface GetResponseCounties{
  _embedded:{
    counties: County[];
  }
}

interface GetResponseTowns{
  _embedded:{
    towns: Town[];
  }
}