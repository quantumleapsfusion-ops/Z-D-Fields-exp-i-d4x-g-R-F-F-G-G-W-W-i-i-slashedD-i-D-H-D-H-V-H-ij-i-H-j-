import { CAMERA, SHEET, gridVertices, viewProjection, type Well } from "./geometry";
import type { ResolvedTheme } from "./themes";

export const MAX_WELLS = 3;
export const MAX_RIPPLES = 6;
export const RIPPLE_LIFE_S = 2;

const VERTEX = /* glsl */ `
precision highp float;
attribute vec3 aPos;
uniform mat4 uViewProj;
uniform vec3 uEye;
uniform float uTime, uDrift, uSpacing, uBreath, uBreathSpeed, uRippleSpeed, uRippleLife;
uniform float uVoice, uHalfWidth, uFadeNear, uFadeFar;
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
  vec2 p = aPos.xy;
  if (aPos.z < 0.5) p.y += mod(uTime * uDrift, uSpacing);
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
    * (1.0 - smoothstep(uHalfWidth * 0.7, uHalfWidth, abs(p.x)));
  vPlane = p;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
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
    col = mix(vec3(dot(col, vec3(0.3, 0.59, 0.11))), col, 0.75);
  }
  float shade = uSheen > 0.5 ? vShade : 1.0;
  // No blending: overlapping lines overwrite rather than add, so no pixel exceeds uBrightness.
  gl_FragColor = vec4(col * uBrightness * vFade * shade, 1.0);
}
`;

export type Frame = {
  time: number;
  wells: readonly Well[];
  /** x, z, age (s), strength */
  ripples: readonly [number, number, number, number][];
  voice: number;
  voiceOrigin: [number, number];
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
  const gl = (canvas.getContext("webgl2", options) ??
    canvas.getContext("webgl", options)) as WebGLRenderingContext | null;
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const vertices = gridVertices();
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  const count = vertices.length / 3;

  const u = (name: string) => gl.getUniformLocation(program, name);
  const loc = {
    viewProj: u("uViewProj"),
    time: u("uTime"),
    // Stages use different float precision, so they cannot share a uniform.
    hueTime: u("uHueTime"),
    wells: u("uWells"),
    ripples: u("uRipples"),
    voice: u("uVoice"),
    voiceOrigin: u("uVoiceOrigin"),
  };

  gl.uniform3f(u("uEye"), ...CAMERA.eye);
  gl.uniform1f(u("uSpacing"), SHEET.spacing);
  gl.uniform1f(u("uHalfWidth"), SHEET.halfWidth);
  gl.uniform1f(u("uFadeNear"), CAMERA.fadeNear);
  gl.uniform1f(u("uFadeFar"), CAMERA.fadeFar);
  gl.uniform1f(u("uDrift"), theme.drift);
  gl.uniform1f(u("uBreath"), theme.breath);
  gl.uniform1f(u("uBreathSpeed"), theme.breathSpeed);
  gl.uniform1f(u("uRippleSpeed"), theme.rippleSpeed);
  gl.uniform1f(u("uRippleLife"), RIPPLE_LIFE_S);
  gl.uniform1f(u("uBrightness"), theme.brightness);
  gl.uniform1f(u("uSheen"), theme.sheen ? 1 : 0);
  gl.uniform1f(u("uColorCount"), theme.colors.length);
  const colors = new Float32Array(7 * 3);
  theme.colors.slice(0, 7).forEach((c, i) => colors.set(c, i * 3));
  gl.uniform3fv(u("uColors"), colors);

  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 1);

  const wells = new Float32Array(MAX_WELLS * 4);
  const ripples = new Float32Array(MAX_RIPPLES * 4);

  return {
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniformMatrix4fv(
        loc.viewProj,
        false,
        viewProjection(width / Math.max(1, height)),
      );
    },
    render(frame) {
      wells.fill(0);
      frame.wells.slice(0, MAX_WELLS).forEach((w, i) => wells.set(w, i * 4));
      ripples.fill(0);
      frame.ripples.slice(0, MAX_RIPPLES).forEach((r, i) => ripples.set(r, i * 4));
      gl.uniform1f(loc.time, frame.time);
      gl.uniform1f(loc.hueTime, (frame.time * 0.01) % 1);
      gl.uniform4fv(loc.wells, wells);
      gl.uniform4fv(loc.ripples, ripples);
      gl.uniform1f(loc.voice, frame.voice);
      gl.uniform2f(loc.voiceOrigin, ...frame.voiceOrigin);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.LINES, 0, count);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
