import { CAMERA, SHEET, polarVertices, viewProjection, type Well } from "./geometry";
import { LOGO_RAINBOW, SKY_MAX_LUMINANCE, type ResolvedTheme } from "./themes";

export const MAX_WELLS = 3;
export const MAX_RIPPLES = 6;
export const RIPPLE_LIFE_S = 2;

const SRGB = /* glsl */ `
vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 toSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
`;

const SKY_VERTEX = /* glsl */ `
attribute vec2 aCorner;
void main() { gl_Position = vec4(aCorner, 0.0, 1.0); }
`;

/** Deep-space backdrop, stars and (earth1) the singularity's rays, glow and orbit rings. */
const SKY_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec2 uRes;
uniform float uTime, uStars, uMaxLum;
uniform vec3 uTop, uBottom, uGlowA, uGlowB;
uniform vec3 uSing;
uniform vec3 uRay[7];
${SRGB}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = frag / uRes;
  vec3 col = mix(uTop, uBottom, uv.y);
  col += uGlowA * (1.0 - smoothstep(0.0, 0.9, distance(uv, vec2(0.85, 0.1))));
  col += uGlowB * (1.0 - smoothstep(0.0, 0.8, distance(uv, vec2(0.05, 0.95))));

  float cellSize = 28.0 * max(1.0, uRes.y / 1200.0);
  vec2 cell = floor(frag / cellSize);
  float h = hash(cell);
  if (h > 1.0 - uStars) {
    vec2 at = vec2(hash(cell + 1.7), hash(cell + 3.1));
    float d = length(fract(frag / cellSize) - at) * cellSize;
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.4 + h * 1.6) + h * 40.0);
    col += vec3(0.9, 0.93, 1.0) * (1.0 - smoothstep(0.0, 1.6, d)) * twinkle;
  }

  float cap = uMaxLum;
  if (uSing.z > 0.0) {
    vec2 d = frag - uSing.xy;
    float r = length(d);
    float R = uSing.z;
    float a = atan(d.y, d.x);
    for (int i = 0; i < 7; i++) {
      float ang = float(i) * 0.8976 + 0.35;
      float da = abs(mod(a - ang + 3.14159, 6.28318) - 3.14159);
      float w = da * r;
      float pulse = 0.8 + 0.2 * sin(uTime * 0.5 + float(i) * 1.3);
      float beam = exp(-w * w / (1.5 + r * 0.03)) * exp(-r / (R * 7.0));
      col += uRay[i] * beam * pulse * smoothstep(R * 0.8, R * 1.4, r);
    }
    col += vec3(0.55, 0.6, 0.85) * (1.0 - smoothstep(0.0, 1.4, abs(r - R * 1.3))) * 0.35;
    float dots = step(0.55, fract(a * 90.0 / 6.28318 + uTime * 0.05));
    vec3 orbit = mix(uRay[1], uRay[4], 0.5 + 0.5 * sin(a));
    col += orbit * (1.0 - smoothstep(0.0, 1.4, abs(r - R * 1.5))) * dots * 0.6;
    col += vec3(0.25, 0.3, 0.6) * exp(-r / (R * 1.2)) * 0.35;
    cap = mix(1.0, uMaxLum, smoothstep(R * 1.7, R * 2.1, r));
  }

  vec3 lin = toLinear(clamp(col, 0.0, 1.0));
  float lum = dot(lin, vec3(0.2126, 0.7152, 0.0722));
  if (lum > cap) lin *= cap / lum;
  gl_FragColor = vec4(toSrgb(lin), 1.0);
}
`;

const GRID_VERTEX = /* glsl */ `
precision highp float;
attribute vec3 aPos;
uniform mat4 uViewProj;
uniform vec3 uEye;
uniform vec2 uCentre;
uniform float uTime, uDrift, uSpin, uBreath, uBreathSpeed, uRippleSpeed, uRippleLife;
uniform float uVoice, uRadius, uInner, uFadeNear, uFadeFar;
uniform vec2 uVoiceOrigin;
uniform vec4 uWells[${MAX_WELLS}];
uniform vec4 uRipples[${MAX_RIPPLES}];
varying float vFade;
varying float vShade;
varying vec2 vPlane;

float height(vec2 p) {
  float h = 0.0;
  for (int i = 0; i < ${MAX_WELLS}; i++) {
    vec4 w = uWells[i];
    vec2 d = p - w.xy;
    float r2 = w.w * w.w;
    h -= w.z * r2 / (dot(d, d) + r2);
  }
  float t = uTime * uBreathSpeed;
  h += uBreath * (sin(p.x * 0.35 + t) * cos(p.y * 0.28 - t * 0.8)
    + 0.5 * sin(p.x * 0.9 - p.y * 0.7 + t * 1.7));
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float x = distance(p, r.xy) - r.z * uRippleSpeed;
    float life = clamp(1.0 - r.z / uRippleLife, 0.0, 1.0);
    h += r.w * life * life * exp(-x * x * 1.8) * sin(x * 4.0);
  }
  float dv = distance(p, uVoiceOrigin);
  h += uVoice * 0.3 * sin(dv * 2.6 - uTime * 6.0) * exp(-dv * 0.16);
  return h;
}

void main() {
  float r = aPos.x;
  float theta = aPos.y;
  if (aPos.z < 0.5) r = uInner + mod(r - uInner - uTime * uDrift, uRadius - uInner);
  else theta += uTime * uSpin;
  vec2 p = uCentre + r * vec2(cos(theta), sin(theta));
  float h = height(p);
  float e = 0.05;
  vec3 n = normalize(vec3(-(height(p + vec2(e, 0.0)) - h) / e, 1.0,
    -(height(p + vec2(0.0, e)) - h) / e));
  vec3 world = vec3(p.x, h, p.y);
  vec3 view = normalize(uEye - world);
  vec3 light = normalize(vec3(sin(uTime * 0.15) * 0.6, 0.8, 0.35));
  float spec = pow(max(dot(reflect(-light, n), view), 0.0), 12.0);
  vShade = clamp(0.55 + 0.45 * spec + 1.5 * (1.0 - n.y), 0.0, 1.0);
  vFade = (1.0 - smoothstep(uFadeNear, uFadeFar, distance(uEye, world)))
    * (1.0 - smoothstep(uRadius * 0.75, uRadius, r))
    * smoothstep(uInner, uInner + 0.4, r);
  vPlane = p;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;

const GRID_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uColors[7];
uniform float uColorCount, uSheen, uBrightness, uHueTime;
varying float vFade;
varying float vShade;
varying vec2 vPlane;

void main() {
  vec3 col = uColors[0];
  if (uColorCount > 1.5) {
    float t = fract(vPlane.x * 0.02 - vPlane.y * 0.012 + uHueTime) * (uColorCount - 1.0);
    for (int i = 0; i < 6; i++) col = mix(col, uColors[i + 1], clamp(t - float(i), 0.0, 1.0));
  }
  float shade = uSheen > 0.5 ? vShade : 1.0;
  gl_FragColor = vec4(col * uBrightness * vFade * shade, 1.0);
}
`;

export type Frame = {
  time: number;
  /** Sheet point the polar grid is centred on. */
  centre: [number, number];
  wells: readonly Well[];
  /** x, z, age (s), strength */
  ripples: readonly [number, number, number, number][];
  voice: number;
  voiceOrigin: [number, number];
  /** Singularity centre and radius in device pixels (top-left origin), or null. */
  singularity: [number, number, number] | null;
};

export type SpacetimeRenderer = {
  resize: (width: number, height: number) => void;
  render: (frame: Frame) => void;
  dispose: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertex);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

/** Returns null when WebGL is unavailable or the shaders fail to build. */
export function createSpacetimeRenderer(
  canvas: HTMLCanvasElement,
  theme: ResolvedTheme,
): SpacetimeRenderer | null {
  const options: WebGLContextAttributes = {
    antialias: true,
    alpha: false,
    depth: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  };
  const gl2 = canvas.getContext("webgl2", options);
  const gl = (gl2 ?? canvas.getContext("webgl", options)) as WebGLRenderingContext | null;
  if (!gl) return null;

  const sky = link(gl, SKY_VERTEX, SKY_FRAGMENT);
  const grid = link(gl, GRID_VERTEX, GRID_FRAGMENT);
  if (!sky || !grid) return null;

  // Lines combine with the sky by per-channel max, so crossings never brighten past either.
  const maxEquation = gl2 ? gl2.MAX : gl.getExtension("EXT_blend_minmax")?.MAX_EXT;

  const skyBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, skyBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const aCorner = gl.getAttribLocation(sky, "aCorner");

  const vertices = polarVertices();
  const gridBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(grid, "aPos");
  const count = vertices.length / 3;

  const s = (name: string) => gl.getUniformLocation(sky, name);
  const g = (name: string) => gl.getUniformLocation(grid, name);
  const loc = {
    skyRes: s("uRes"),
    skyTime: s("uTime"),
    sing: s("uSing"),
    viewProj: g("uViewProj"),
    time: g("uTime"),
    // Stages use different float precision, so they cannot share a uniform.
    hueTime: g("uHueTime"),
    centre: g("uCentre"),
    wells: g("uWells"),
    ripples: g("uRipples"),
    voice: g("uVoice"),
    voiceOrigin: g("uVoiceOrigin"),
  };

  gl.useProgram(sky);
  gl.uniform1f(s("uStars"), theme.stars);
  gl.uniform1f(s("uMaxLum"), SKY_MAX_LUMINANCE);
  gl.uniform3f(s("uTop"), ...theme.sky.top);
  gl.uniform3f(s("uBottom"), ...theme.sky.bottom);
  gl.uniform3f(s("uGlowA"), ...theme.sky.glowA);
  gl.uniform3f(s("uGlowB"), ...theme.sky.glowB);
  const rays = new Float32Array(7 * 3);
  LOGO_RAINBOW.forEach((c, i) => rays.set(c, i * 3));
  gl.uniform3fv(s("uRay"), rays);

  gl.useProgram(grid);
  gl.uniform3f(g("uEye"), ...CAMERA.eye);
  gl.uniform1f(g("uRadius"), SHEET.radius);
  gl.uniform1f(g("uInner"), SHEET.innerRadius);
  gl.uniform1f(g("uFadeNear"), CAMERA.fadeNear);
  gl.uniform1f(g("uFadeFar"), CAMERA.fadeFar);
  gl.uniform1f(g("uDrift"), theme.drift);
  gl.uniform1f(g("uSpin"), theme.spin);
  gl.uniform1f(g("uBreath"), theme.breath);
  gl.uniform1f(g("uBreathSpeed"), theme.breathSpeed);
  gl.uniform1f(g("uRippleSpeed"), theme.rippleSpeed);
  gl.uniform1f(g("uRippleLife"), RIPPLE_LIFE_S);
  gl.uniform1f(g("uBrightness"), theme.brightness);
  gl.uniform1f(g("uSheen"), theme.sheen ? 1 : 0);
  gl.uniform1f(g("uColorCount"), theme.colors.length);
  const colors = new Float32Array(7 * 3);
  theme.colors.slice(0, 7).forEach((c, i) => colors.set(c, i * 3));
  gl.uniform3fv(g("uColors"), colors);

  const wells = new Float32Array(MAX_WELLS * 4);
  const ripples = new Float32Array(MAX_RIPPLES * 4);

  return {
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.useProgram(sky);
      gl.uniform2f(loc.skyRes, width, height);
      gl.useProgram(grid);
      gl.uniformMatrix4fv(
        loc.viewProj,
        false,
        viewProjection(width / Math.max(1, height)),
      );
    },
    render(frame) {
      gl.disable(gl.BLEND);
      gl.useProgram(sky);
      gl.uniform1f(loc.skyTime, frame.time);
      gl.uniform3f(loc.sing, ...(frame.singularity ?? [0, 0, 0]));
      gl.bindBuffer(gl.ARRAY_BUFFER, skyBuffer);
      gl.enableVertexAttribArray(aCorner);
      gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disableVertexAttribArray(aCorner);

      wells.fill(0);
      frame.wells.slice(0, MAX_WELLS).forEach((w, i) => wells.set(w, i * 4));
      ripples.fill(0);
      frame.ripples.slice(0, MAX_RIPPLES).forEach((r, i) => ripples.set(r, i * 4));
      gl.useProgram(grid);
      gl.uniform1f(loc.time, frame.time);
      gl.uniform1f(loc.hueTime, (frame.time * 0.01) % 1);
      gl.uniform2f(loc.centre, ...frame.centre);
      gl.uniform4fv(loc.wells, wells);
      gl.uniform4fv(loc.ripples, ripples);
      gl.uniform1f(loc.voice, frame.voice);
      gl.uniform2f(loc.voiceOrigin, ...frame.voiceOrigin);
      if (maxEquation !== undefined) {
        gl.enable(gl.BLEND);
        gl.blendEquation(maxEquation);
        gl.blendFunc(gl.ONE, gl.ONE);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, count);
      gl.disableVertexAttribArray(aPos);
    },
    dispose() {
      gl.deleteBuffer(skyBuffer);
      gl.deleteBuffer(gridBuffer);
      gl.deleteProgram(sky);
      gl.deleteProgram(grid);
    },
  };
}
