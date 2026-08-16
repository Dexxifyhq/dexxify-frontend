'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uImageAspect;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uMotion;

  varying vec2 vUv;

  // Scale uv so the texture covers the canvas (object-fit: cover).
  vec2 coverUv(vec2 uv, vec2 res, float imgAspect) {
    float resAspect = res.x / res.y;
    vec2 size = resAspect < imgAspect
      ? vec2(imgAspect * res.y, res.y)
      : vec2(res.x, res.x / imgAspect);
    vec2 offset = (size - res) * 0.5 / size;
    return uv * res / size + offset;
  }

  void main() {
    vec2 uv = coverUv(vUv, uResolution, uImageAspect);

    // Aspect-corrected space so the ripple stays circular.
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = vUv * aspect;
    vec2 pointer = uPointer * aspect;

    // Slow drifting swell — the coins breathe like they're suspended in liquid.
    float swell =
      sin(uv.x * 6.0 + uTime * 0.45) * 0.5 +
      sin(uv.y * 8.0 - uTime * 0.32) * 0.5;
    vec2 flow = vec2(
      sin(uv.y * 5.0 + uTime * 0.38),
      cos(uv.x * 4.0 - uTime * 0.29)
    ) * 0.0045 * uMotion;

    // Pointer ripple, decaying outward.
    float dist = distance(p, pointer);
    float ring = sin(dist * 26.0 - uTime * 3.4) * exp(-dist * 5.5);
    vec2 ripple = normalize(p - pointer + 1e-5) * ring * 0.03 * uPointerStrength;

    vec2 offset = flow + ripple;

    // Chromatic split scales with how much the surface is being pushed.
    float shift = (length(offset) * 0.55 + swell * 0.0006 * uMotion) * 1.4;
    vec2 dir = normalize(offset + 1e-5);

    float r = texture2D(uTexture, uv + offset + dir * shift).r;
    vec4 g = texture2D(uTexture, uv + offset);
    float b = texture2D(uTexture, uv + offset - dir * shift).b;

    vec3 color = vec3(r, g.g, b);

    // Specular sweep — a highlight band travelling across the metal.
    float sweep = sin((uv.x + uv.y) * 2.2 - uTime * 0.5);
    float gloss = smoothstep(0.72, 1.0, sweep) * 0.16 * uMotion;
    color += gloss;

    // Lift the ripple crest slightly so the wave reads on a light background.
    color += ring * 0.05 * uPointerStrength;

    gl_FragColor = vec4(color, g.a);
  }
`;

type Props = {
  /** Path to the image the shader samples. */
  src: string;
  alt: string;
  className?: string;
};

export default function CoinShader({ src, alt, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        // The PNG is straight-alpha, and the shader outputs straight-alpha,
        // so the context must not expect premultiplied values or edges halo.
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio, 2),
      });
    } catch {
      // No WebGL — the CSS background image on the container stays as the fallback.
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';

    const texture = new Texture(gl, { generateMipmaps: false });
    const image = new Image();
    image.crossOrigin = 'anonymous';

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uResolution: { value: [1, 1] },
        uImageAspect: { value: 1 },
        uTime: { value: 0 },
        uPointer: { value: [0.5, 0.5] },
        uPointerStrength: { value: 0 },
        uMotion: { value: reduceMotion ? 0 : 1 },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    image.onload = () => {
      texture.image = image;
      program.uniforms.uImageAspect.value =
        image.naturalWidth / image.naturalHeight;
      // Shader is live — drop the static fallback so it doesn't show through.
      container.style.backgroundImage = 'none';
    };
    image.src = src;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value = [clientWidth, clientHeight];
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Pointer drives the ripple; strength eases in and out so it never snaps.
    let targetStrength = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      program.uniforms.uPointer.value = [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ];
      targetStrength = reduceMotion ? 0 : 1;
    };
    const onPointerLeave = () => {
      targetStrength = 0;
    };
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    let frame = 0;
    const start = performance.now();
    const loop = () => {
      frame = requestAnimationFrame(loop);
      const strength = program.uniforms.uPointerStrength;
      strength.value += (targetStrength - strength.value) * 0.06;
      program.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render({ scene: mesh });
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
    };
  }, [src]);

  // The background image is the no-JS / no-WebGL fallback and the pre-load
  // placeholder; the effect clears it once the shader has the texture.
  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={alt}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
