import GUI from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Conf } from './conf';
import { Update } from '../libs/update';
import { FPS } from '../core/fps';

export class Param {
  private static _instance: Param;

  public fps: number = FPS.MIDDLE;
  public debug: HTMLElement = document.querySelector('.l-debug') as HTMLElement;
  public ang:number = 0;

  private _dat: any;
  private _stats: any;

  public col:number = 20 // 行数
  public bunkatu:number = 20 // アウトラインの細かさ
  public trail:number = 10 // 線の細かさ
  public outlineNum:number = 10 // アウトライン数
  public outlineFrame:number = 20 // 枠っぽくなる

  public isSimpleOrder:boolean = true // ジグザグにしない
  public isColorGrad:boolean = false // 直線グラデ
  public isColorRep:boolean = true // カラー繰り返し


  public mesh = {
      bg:{value:0x000000, type:'color'},
      color:{value:0x000000, type:'color'},
      s:{value:100, min:0, max:200},
  }

  constructor() {
    if (Conf.instance.FLG_PARAM) {
      this.makeParamGUI();
    }

    if (Conf.instance.FLG_STATS) {
      this._stats = Stats();
      document.body.appendChild(this._stats.domElement);
    }

    Update.instance.add(() => {
      this._update();
    });
  }

  private _update(): void {
    if (this._stats != undefined) {
      this._stats.update();
    }
  }

  public static get instance(): Param {
    if (!this._instance) {
      this._instance = new Param();
    }
    return this._instance;
  }

  public makeParamGUI(): void {
    if (this._dat != undefined) return;

    this._dat = new GUI();
    this._add(this.mesh, 'mesh');
  }

  private _add(obj: any, folderName: string): void {
    const folder = this._dat.addFolder(folderName);
    for (var key in obj) {
      const val: any = obj[key];
      if (val.use == undefined) {
        if (val.type == 'color') {
          folder.addColor(val, 'value').name(key);
        } else {
          if (val.list != undefined) {
            folder.add(val, 'value', val.list).name(key);
          } else {
            folder.add(val, 'value', val.min, val.max).name(key);
          }
        }
      }
    }
  }
}
