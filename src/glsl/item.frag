
precision highp float;

uniform vec3 color;
uniform vec3 dist;
uniform float size;
uniform float time;

varying float vDist;
varying float vMouse;
varying vec3 vColor;
varying vec3 vColor2;
varying vec3 vInfo;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
  return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

vec3 rgb2hsb(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),vec4(c.gb, K.xy),step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),vec4(c.r, p.yzx),step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),d / (q.x + e),q.x);
}

vec3 hsb2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main(void) {
  vec4 dest = vec4(vColor, 1.0);
  float ef = mix(1.0, map(vDist, 0.0, 1.0, 0.0, 1.0), vInfo.y);

  vec3 hsb = rgb2hsb(vColor);
  // hsb.z *= mix(0.25, 1.25, vMouse);
  // hsb.x = fract(hsb.x);

  hsb.x *= ef;
  hsb.y = 1.0;
  hsb.z = 1.0;

  dest.rgb = hsb2rgb(hsb);
  // dest.rgb = mix(dest.rgb, vec3(0.0), 1.0 - vMouse);

  // dest.a *= ef;

  gl_FragColor = dest;
}
