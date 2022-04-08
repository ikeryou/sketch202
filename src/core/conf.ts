import { Util } from '../libs/util';

export class Conf {
  private static _instance: Conf;

  // public FLG_PARAM: boolean = location.href.includes('10.0.1.33') || location.href.includes('localhost');
  public FLG_PARAM: boolean = false;
  public FLG_STATS: boolean = this.FLG_PARAM;
  public FLG_TEST: boolean = this.FLG_PARAM;

  // パス
  public PATH_IMG: string = './assets/img/';

  // タッチデバイス
  public USE_TOUCH: boolean = Util.instance.isTouchDevice();

  // ブレイクポイント
  public BREAKPOINT: number = 768;

  // PSDサイズ
  public LG_PSD_WIDTH: number = 1600;
  public XS_PSD_WIDTH: number = 750;

  // 簡易版
  public IS_SIMPLE: boolean = Util.instance.isPc() && Util.instance.isSafari();

  // スマホ
  public IS_PC: boolean = Util.instance.isPc();
  public IS_SP: boolean = Util.instance.isSp();
  public IS_AND: boolean = Util.instance.isAod();
  public IS_TAB: boolean = Util.instance.isIPad();
  public USE_ROLLOVER:boolean = Util.instance.isPc() && !Util.instance.isIPad()

  public OUTLINE_WIDTH:number = 0.5
  public OUTLINE_OFFSET:number = 0.045

  constructor() {}
  public static get instance(): Conf {
    if (!this._instance) {
      this._instance = new Conf();
    }
    return this._instance;
  }
}
