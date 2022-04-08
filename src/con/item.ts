import itemVt from '../glsl/item.vert';
import itemFg from '../glsl/item.frag';
import { MyObject3D } from "../webgl/myObject3D";
import { Func } from "../core/func";
import { Param } from '../core/param';
import { Util } from "../libs/util";
import { Conf } from "../core/conf";
import { Vector3 } from "three/src/math/Vector3";
import { Vector2 } from "three/src/math/Vector2";
import { Color } from "three/src/math/Color";
import { DoubleSide } from "three/src/constants";
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { Points } from 'three/src/objects/Points';
import { RawShaderMaterial } from 'three/src/materials/RawShaderMaterial';
import { Mouse } from '../core/mouse';
import { HSL } from '../libs/hsl';


export class Item extends MyObject3D {

  private _table:Array<Vector2> = [];
  private _mesh:Points;
  private _blockSize:number = 0;
  private _colors:Array<Color> = [];


  constructor() {
    super()

    this._makeColors();

    const col = Param.instance.col
    const base = 1
    const size = base / col
    for(let i = 0; i < col * col; i++) {
      const ix = ~~(i % col)
      const iy = ~~(i / col)
      let x = size * ix
      let y = size * iy
      x -= base * 0.5 - size * 0.5
      y -= base * 0.5 - size * 0.5
      if(!Param.instance.isSimpleOrder && ix % 2 == 0) {
        y -= size * 0.5
      }
      this._table.push(new Vector2(x, y))
    }
    this._blockSize = size * 0.5

    this._mesh = new Points(
      this.getGeo(),
      new RawShaderMaterial({
        vertexShader:itemVt,
        fragmentShader:itemFg,
        transparent:true,
        side:DoubleSide,
        depthTest:false,
        uniforms:{
          alpha:{value:1},
          color:{value:new Color(0xffffff)},
          size:{value:Conf.instance.OUTLINE_WIDTH},
          time:{value:0},
          viewSize:{value:new Vector3()},
          trail:{value:1},
          useMouse:{value:1},
          dist:{value:new Vector3()},
          mouse:{value:new Vector3()}
        }
      })
    )
    this.add(this._mesh)

    // window.addEventListener('click', () => {
    //   this._startTap()
    // })
  }


  //
  // ------------------------------------
  private _makeColors():void {
    this._colors = []

    this._colors.push(new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1)))
    this._colors.push(new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1)))
  }


  // ---------------------------------
  //
  // ---------------------------------
  // private _startTap():void {
  //   const uni = (this._mesh.material as RawShaderMaterial).uniforms;

  //   Tween.instance.a(uni.useMouse, {
  //     value:[0, 1.1]
  //   }, 0.25, 0, Power2.easeOut, null, null, () => {
  //     Tween.instance.a(uni.useMouse, {
  //       value:0
  //     }, 0.5, 0, Power2.easeInOut)
  //   })

  //   uni.mouse.value.x = Mouse.instance.normal.x * 0.5
  //   uni.mouse.value.y = Mouse.instance.normal.y * 0.5 * -1
  // }


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update()

    const mx = Mouse.instance.normal.x * 0.5;
    const my = Mouse.instance.normal.y * 0.5;

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    const uni = (this._mesh.material as RawShaderMaterial).uniforms;
    const ratio = Func.instance.ratio();

    uni.size.value = Conf.instance.OUTLINE_WIDTH * ratio;
    uni.time.value += 1;

    let useMouseTg = Mouse.instance.isDown ? 1 : 0
    if(Conf.instance.USE_ROLLOVER) useMouseTg = 1
    uni.useMouse.value += (useMouseTg - uni.useMouse.value) * 0.1

    const e = 0.2;
    uni.mouse.value.x += (mx - uni.mouse.value.x) * e;
    // uni.mouse.value.y += (my * -1 * (1) - uni.mouse.value.y) * e;
    if(w > h) {
      uni.mouse.value.y += (my * -1 * (h / w) - uni.mouse.value.y) * e;
    } else {
      uni.mouse.value.y += (my * -1 * (1) - uni.mouse.value.y) * e;
    }


    const s = Math.max(w, h) * 1;
    this.scale.set(s, s, s);
  }


  // ---------------------------------
  //
  // ---------------------------------
  public getGeo():BufferGeometry {

    let trail = Param.instance.trail
    let bunkatu = Param.instance.bunkatu
    const pNum = this._table.length

    const num = pNum * Param.instance.outlineNum * bunkatu * trail
    console.log('num', num)

    const geometry = new BufferGeometry()

    const translate = new Float32Array(num * 3)
    const centerPos = new Float32Array(num * 3)
    const distPos = new Float32Array(num * 3)
    const info = new Float32Array(num * 3)
    const lineColor = new Float32Array(num * 3)
    const lineColor2 = new Float32Array(num * 3)

    const colorNum = this._colors.length
    const isSimpleColor = colorNum <= 2
    const isFrame = Param.instance.outlineFrame != 1
    const rev = false
    // const rev = true
    const isBlock = true
    // const isBlock = true

    let pKey = 0

    let itemKey  = 0
    while(itemKey < pNum) {

      let tx = rev ? ~~(itemKey % Param.instance.col) : ~~(itemKey / Param.instance.col)
      let ty = rev ? ~~(itemKey / Param.instance.col) : ~~(itemKey % Param.instance.col)

      const center = this._table[itemKey]
      let color = Util.instance.randomArr(this._colors)
      const color2 = Util.instance.randomArr(this._colors)
      const speed = Util.instance.random2(0.5, 1) * 1.5
      const zeroOffset = Util.instance.hit(5) ? 0.25 : 1

      // const bunkatu2 = Util.instance.randomArr([20, 5, 3])
      const bunkatu2 = bunkatu

      // 直線グラデ
      if(Param.instance.isColorGrad) {
        const hsl = new HSL()
        const colorKey = ~~(tx / 2) % colorNum
        color = this._colors[colorKey]
        color.getHSL(hsl)
        const lMin = 0.2
        const lMax = 0.8
        if(colorKey % 2 == 0) {
          hsl.l = Util.instance.map(ty, lMin, lMax, 0, Param.instance.col - 1)
        } else {
          hsl.l = Util.instance.map(ty, lMax, lMin, 0, Param.instance.col - 1)
        }
        hsl.l = Util.instance.clamp(hsl.l, 0, 1)
        color.setHSL(hsl.h, hsl.s, hsl.l)
      }

      // 色くりかえす
      if(colorNum >= 4 && Param.instance.isColorRep) {
        const colorKey = ~~(tx / 2) % colorNum
        const colorKey2 = ~~(ty / 2) % colorNum
        if(isBlock) {
          // ブロック
          if(colorKey % 2 == 0) {
            color = this._colors[colorKey2 % 2]
          } else {
            color = this._colors[2 + colorKey2 % 2]
          }
        } else {
          // 順番
          if(colorKey % 2 == 0) {
            color = this._colors[ty % colorNum]
          } else {
            color = this._colors[(colorNum - 1) - (ty % colorNum)]
          }
        }
      }

      let outlineKey = 0
      let outlineNum = Param.instance.outlineNum
      while(outlineKey < outlineNum) {
        if(isSimpleColor) {
          color = Util.instance.randomArr(this._colors)
        }

        let offsetMax = isFrame ? Param.instance.outlineFrame : Util.instance.random(0.25, 0.9)
        let offsetDist = Util.instance.random(0.25, 1)

        const scaleMotion = isFrame ? 0 : Util.instance.randomArr([0, 1])
        const isToCenter = Util.instance.hit(8)

        const outlineRadius = this._blockSize * Conf.instance.OUTLINE_OFFSET
        const outlinePt:Array<any> = []
        for(let i = 0; i < 360; i++) {
          const radian = Util.instance.radian((outlineKey * 30) + (360 / bunkatu2) * i)
          let x = Math.sin(radian) * outlineRadius
          let y = Math.cos(radian) * outlineRadius
          outlinePt.push([x, y])
        }

        const maxAng = Util.instance.randomInt(0, 360)
        let outlineItemKey = 0
        const trailInterval = Util.instance.random(0.01, 0.2)
        while(outlineItemKey < bunkatu2) {
          let trailKey = 0
          while(trailKey < trail) {
            let start = new Vector2(outlinePt[outlineItemKey][0], outlinePt[outlineItemKey][1])
            let end
            if(outlineItemKey != bunkatu2 - 1) {
              end = new Vector2(outlinePt[outlineItemKey + 1][0], outlinePt[outlineItemKey + 1][1])
            } else {
              end = new Vector2(outlinePt[0][0], outlinePt[0][1])
            }

            if(isToCenter) {
              end = new Vector2(0, 0)
            }

            // 補正
            const center2 = new Vector2(0, 0);
            let offset = Util.instance.map(outlineKey, 0, offsetMax, 0, outlineNum - 1)
            offset *= zeroOffset
            start.x += (center2.x - start.x) * offset
            start.y += (center2.y - start.y) * offset
            end.x += (center2.x - end.x) * offset
            end.y += (center2.y - end.y) * offset

            const ang = Util.instance.map(outlineKey, 0, maxAng, 0, outlineNum - 1)
            start.rotateAround(center2, Util.instance.radian(ang))
            end.rotateAround(center2, Util.instance.radian(ang))

            let x = start.x
            let y = start.y

            const dx = (end.x - start.x) * offsetDist
            const dy = (end.y - start.y) * offsetDist
            let dist = Math.sqrt(dx * dx + dy * dy)

            translate[pKey*3+0] = x
            translate[pKey*3+1] = y
            translate[pKey*3+2] = 0

            centerPos[pKey*3+0] = center.x
            centerPos[pKey*3+1] = center.y
            centerPos[pKey*3+2] = dist

            distPos[pKey*3+0] = dx
            distPos[pKey*3+1] = dy
            distPos[pKey*3+2] = scaleMotion // 拡大縮小で使う

            info[pKey*3+0] = 1 + (outlineKey * 1) + (trailKey * trailInterval)
            info[pKey*3+1] = Util.instance.map(trailKey, 0, 1, 0, trail - 1)
            info[pKey*3+2] = speed

            lineColor[pKey*3+0] = color.r
            lineColor[pKey*3+1] = color.g
            lineColor[pKey*3+2] = color.b

            lineColor2[pKey*3+0] = color2.r
            lineColor2[pKey*3+1] = color2.g
            lineColor2[pKey*3+2] = color2.b

            pKey++
            trailKey++
          }
          outlineItemKey++
        }
        outlineKey++
      }

      itemKey++
    }

    // console.log(pKey)

    geometry.setAttribute('position', new BufferAttribute(translate, 3))
    geometry.setAttribute('centerPos', new BufferAttribute(centerPos, 3))
    geometry.setAttribute('info', new BufferAttribute(info, 3))
    geometry.setAttribute('distPos', new BufferAttribute(distPos, 3))
    geometry.setAttribute('lineColor', new BufferAttribute(lineColor, 3))
    geometry.setAttribute('lineColor2', new BufferAttribute(lineColor2, 3))
    geometry.computeBoundingSphere()

    return geometry
  }
}