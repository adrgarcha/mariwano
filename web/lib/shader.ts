import { Geometry, OGLRenderingContext, Program } from 'ogl';

export const vertexShader = `
  attribute vec3 position;
  attribute vec4 random;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform vec2 uMouseCoords;

  varying vec4 vRandom;
  varying vec2 vMouseCoords;

  void main() {
    vRandom = random;
    vMouseCoords = uMouseCoords;
    
    vec3 pos = position * 2.0 - 1.0;
    pos.z *= 10.0;
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime * 0.3;

    float distance = length(vMouseCoords - pos.xy);
    float influenceFactor = 1.0 / (1.0 + distance * distance); 
    float mouseInfluence = 0.05 * influenceFactor;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x) + (vMouseCoords.x - pos.x) * mouseInfluence;
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w) + (vMouseCoords.y - pos.y) * mouseInfluence;
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = 300.0 / length(mvPos.xyz) * (random.x + 0.1);
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const fragmentShader = `
  precision highp float;

  uniform float uTime;
  varying vec4 vRandom;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float circle = smoothstep(0.5, 0.4, length(uv - 0.5)) * 0.8;
    gl_FragColor.rgb = 0.1 + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28) + vec3(0.1, 0.0, 0.3);
    gl_FragColor.a = circle;
  }
`;

export const createParticleGeometry = (gl: OGLRenderingContext, numParticles: number) => {
   const position = new Float32Array(numParticles * 3);
   const random = new Float32Array(numParticles * 4);

   for (let i = 0; i < numParticles; i++) {
      position.set([Math.random(), Math.random(), Math.random()], i * 3);
      random.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
   }

   return new Geometry(gl, {
      position: { size: 3, data: position },
      random: { size: 4, data: random },
   });
};

export const createParticleProgram = (gl: OGLRenderingContext) => {
   return new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
         uTime: { value: 0 },
         uMouseCoords: { value: [0, 0] },
      },
      transparent: true,
      depthTest: false,
   });
};
