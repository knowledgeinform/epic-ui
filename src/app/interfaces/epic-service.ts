import { EPICWSService } from '@app/services/epic-ws.service';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { Local } from './local.class';
import { Injectable } from '@angular/core';

export abstract class EpicService<L extends Local<DTO, L>, DTO> {

  /**
   * The base web service API path.
   */
  protected basePath: string;

  /**
   * Fires whenever the elements are added or removed from the server.
   */
  public onServerDataChange = new Subject<void>();

  /**
   * Stores cached data for `getAll()` calls.
   */
  protected allCache: L[] = [];

  constructor(
    protected epicService: EPICWSService,
  ) { }

  /**
   * Returns a new instance of the appropriate Local sub-type.
   */
  protected abstract getNewLocal(): L;

  /**
   * Get a list of all results. If `useCache` is `true`, load cached results without making a server call; else call the server and update the cache.
   *
   * @arg useCache If true, returns the latest version the service has received. Does not request an update from the server.
   * @arg filterCriteria If specified, the server will fitler the results such that only matching results are returned.
   */
  public getAll(useCache?: boolean, filterCriteria?: Partial<L>): Promise<L[]> {

    if (useCache && this.allCache.length) return Promise.resolve(this.allCache);

    return this.epicService.httpGet<DTO[]>(this.basePath, filterCriteria)
      .then( dtos => {
        const results = _.map(dtos, dto => this.getNewLocal().loadFromDTO(dto));
        this.allCache = results;
        return results;
      });
  };

  public get(pk: number): Promise<L> {
    return this.epicService.httpGet<DTO>(`${this.basePath}/${pk}`)
      .then( dto => this.getNewLocal().loadFromDTO(dto) );
  };

  /**
   * Adds a new record to the server's database. Returns the new server instance so the client has access to the PK.
   */
  public upsert(local: L): Promise<L> {
    return this.epicService.httpPost<DTO>(
      this.basePath,
      local.asDTO()
    ).then( dto => {
      this.onServerDataChange.next();
      if (dto) return this.getNewLocal().loadFromDTO(dto);
      else console.error('No upsert response from server.', this);
    });
  }

  public delete(local: L): Promise<void> {
    return this.epicService.httpDelete<DTO>(
      this.basePath,
      null,
      local.asDTO()
    ).then( res => {
      this.onServerDataChange.next();
    });
  }

}

