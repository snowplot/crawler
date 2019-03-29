import * as request from 'request-promise-native';
import { ILight, Light } from './models/light';
import Updater from './updater';

interface GeometryArea {
  xmin: Number;
  xmax: Number;
  ymin: Number;
  ymax: Number;
}

export default class LightUpdater extends Updater<ILight> {
  private requestFields = [
    'STATUT',
    'DEBUT',
    'FIN',
    'DateMiseJour',
    'STATIONNEMENT',
    'STATION_NO'
  ];
  
  private baseGeometry = {
    'xmin': 240000,
    'ymin': 5180000,
    'xmax': 255000,
    'ymax': 5195000
  };
  
  private step = 5000;
  
  protected async read (): Promise<ILight[]> {
    const promises: Promise<ILight[]>[] = [];
    for (let i = this.baseGeometry.xmin; i <= this.baseGeometry.xmax; i += this.step) {
      for (let j = this.baseGeometry.ymin; j <= this.baseGeometry.ymax; j += this.step) {
        promises.push(this.getDataFromGeometryArea({
          xmin: i,
          xmax: i + this.step,
          ymin: j,
          ymax: j + this.step
        }));
      }  
    }
    
    let results: ILight[] = [];
    const allResults = await Promise.all(promises);
    
    allResults.forEach(r => {
      results.push(...r);
    });

    return results;
  }

  protected async write(data: Readonly<ILight>[]): Promise<void> {
    try {
      await Light.insertMany(data);
    } catch (err) {
      console.error(err);
    }
  }

  async getDataFromGeometryArea (geometry: GeometryArea): Promise<ILight[]> {
    return (await this.queryMap(geometry)).map(item => {
      return {
        stationNumber: item.attributes.STATION_NO,
        status: item.attributes.STATUT === 'En fonction' ? 'on' : 'off',
        updatedAt: new Date(item.attributes.DateMiseJour)
      };
    });
  }

  async queryMap (geometry: GeometryArea): Promise<any> {
    const url = 'http://carte.ville.quebec.qc.ca/arcgis/rest/services/CI/OperationDeneigement/MapServer/1/query';
    let result = await request({
      url,
      qs: {
        f: 'json',
        outFields: this.requestFields.join(','),
        geometry: JSON.stringify(geometry)
      }
    });
  
    if (result) {
      result = JSON.parse(result) || {};

      if (result.exceededTransferLimit) {
        throw new Error('Exceeded transfer limit');
      }
      result = result.features;
    }

    if (!result) {
      result = [];
    }

    return result;
  }
}