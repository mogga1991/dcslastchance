"use client";

import React, { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: "forward" | "reverse" | "pingpong";
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export const Plasma: React.FC<PlasmaProps> = ({
  color = "#ffffff",
  speed = 1,
  direction = "forward",
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];

    const directionMultiplier = direction === "reverse" ? -1.0 : 1.0;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    containerRef.current.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive) return;
      const rect = containerRef.current!.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = mousePos.current.x;
      mouseUniform[1] = mousePos.current.y;
    };

    if (mouseInteractive) {
      containerRef.current.addEventListener("mousemove", handleMouseMove);
    }

    const setSize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerRef.current);
    setSize();

    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      let timeValue = (t - t0) * 0.001;

      if (direction === "pingpong") {
        const cycle = Math.sin(timeValue * 0.5) * directionMultiplier;
        (program.uniforms.uDirection as any).value = cycle;
      }

      (program.uniforms.iTime as any).value = timeValue;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (mouseInteractive && containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
      }
      try {
        containerRef.current?.removeChild(canvas);
      } catch {}
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
    />
  );
};

export function Logo() {
    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
        </div>
    );
}

const GlassmorphicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl">
            <div className="bg-white/60 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo />
                        <span className="text-xl font-bold text-gray-900">
                            FedSpace
                        </span>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        <a href="/features" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-full hover:bg-white/50 transition-colors">
                            Features
                        </a>
                        <a href="#solutions" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-full hover:bg-white/50 transition-colors">
                            Solutions
                        </a>
                        <a href="/pricing" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-full hover:bg-white/50 transition-colors">
                            Pricing
                        </a>
                        <a href="#resources" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-full hover:bg-white/50 transition-colors">
                            Resources
                        </a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-2">
                        <a href="/sign-in" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full shadow-md hover:bg-indigo-700 transition-colors">
                            Get Started
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-full bg-white/50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 bg-white/90 rounded-2xl p-4 shadow-lg border border-white/20">
                        <div className="flex flex-col space-y-3">
                            <a href="/features" className="px-4 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-white transition-colors">
                                Features
                            </a>
                            <a href="#solutions" className="px-4 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-white transition-colors">
                                Solutions
                            </a>
                            <a href="/pricing" className="px-4 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-white transition-colors">
                                Pricing
                            </a>
                            <a href="#resources" className="px-4 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-white transition-colors">
                                Resources
                            </a>
                            <div className="border-t border-gray-200 pt-3">
                                <a href="/sign-in" className="px-4 py-3 text-center bg-indigo-600 text-white font-medium rounded-lg shadow-md block">
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

const HeroSection = () => {
    return (
        <div className="min-h-screen relative overflow-hidden w-full bg-gradient-to-b from-gray-50 to-white">
            {/* Navbar */}
            <GlassmorphicNavbar />

            {/* Plasma background with light theme settings */}
            <div className="absolute inset-0 z-0">
                <Plasma
                    color="#6366f1"
                    speed={0.5}
                    direction="forward"
                    scale={1.2}
                    opacity={0.12}
                    mouseInteractive={true}
                />

                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/80"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20 text-center">
                {/* Badge */}
                <div className="inline-flex items-center rounded-full bg-indigo-50/80 px-4 py-2 text-sm font-medium text-indigo-700 mb-8 backdrop-blur-sm border border-indigo-100">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    AI-Powered RFP Analysis
                </div>

                {/* Main headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight pb-4 leading-tight">
                    Win More Contracts with
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block mt-2 pb-2">
                        AI Intelligence
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                    AI-powered RFP analysis that extracts requirements, evaluates criteria, and delivers bid/no-bid recommendations in minutes, not hours.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <a href="/sign-in" className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl">
                        Get Started
                    </a>
                    <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:border-gray-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Discover Lease Opportunities
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900">33M</div>
                        <div className="text-gray-600 mt-1">businesses in the U.S.</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900">$1.46B</div>
                        <div className="text-gray-600 mt-1">SBA FY2025 in total new budget authority</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900">$6B</div>
                        <div className="text-gray-600 mt-1">GSA spends in Commercial Real Estate rent payments</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900">YES</div>
                        <div className="text-gray-600 mt-1">the government buys everything</div>
                    </div>
                </div>
            </div>

            {/* Floating elements for visual interest */}
            <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-indigo-200/20 blur-3xl"></div>
            <div className="absolute bottom-1/3 right-16 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl"></div>
        </div>
    );
};

export { HeroSection };
