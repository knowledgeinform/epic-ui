import * as _ from 'lodash';

/**
 * This class represents a local object that mirrors a remote DTO object, and provides methods to translate from and to DTOs. Classes should extend this class and add default property values and a conversion method to get a DTO.
 */
export abstract class Local<DTO, L> {

  public availableOffline: boolean = false;

  /**
   * Overwrites all of this object's properties with corresponding properties from `obj`. This is often called as the first step of the `fromDTO()` function.
   */
  public loadPropsFrom(obj: DTO | L): this {
    if (!obj) return;

    // Overwrite properties with vals from obj
    _.forOwn(this, (val, key) => {
      this[key] = obj[key];
    });

    return this;

  }

  /**
   * Populates properties in the object with properties from the supplied DTO.
   */
  public abstract loadFromDTO(dto: DTO): this;

  /**
   * Should return a new DTO object based on the values of the local object.
   */
  public abstract asDTO(): DTO;


  /**
   * Updates the `availableOffline` property. Since the Service Worker cache API is asynchronous, this runs asynchronously. However, Angular should detect changes and update the view as soon as the status property is set.
   * @param substr The string to look for that uniquely identifies an item in the cache. For example, ``/Runs/Run/${this.procedureDetails.id}``.
   */
  protected updateOfflineAvailabilityAsync(substr: string): Promise<this> {
    const path = 'ngsw:/EPIC/:1:data:app-freshness:cache';
    return caches.open(path).then(cache => {
      return cache.keys().then(keys => {
        const urls: string[] = _.map(keys, key => key.url);
        this.availableOffline = _.some(urls, url => {
          return url.includes(substr);
        });
        return this;
      });
    });
  }

}

export type LocalProperties = keyof Local<void, void>;
