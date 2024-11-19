#ifdef GL_ES
precision lowp float;
#endif

uniform vec3 iResolution;
varying vec2 vUv;
uniform float uTime;   

// Movimiento

const float estiramientoX = 0.0;
const float estiramientoZ = 55.0;
const float estiramientoY = 33.0;
const float estiramientoW = 0.0;

// Tamaño

const float fSaturacion = 0.1;
const float fTamanyo =0.1;
const float fGrosor = 0.4;
const float fLongitudDegradado = 0.29;
const float fCorteSeccion = 5.0;

// Huecos

const float fIntensidadTensor = 0.5;
const float fConcavidadTensor = 1.0;

// Detalles

const float fElevacionZEfectoDeformacion = 2.4;
const float fSuavidadEfectoDegradado = 10.0;
const float fBrilloEfectoDegradado = 0.8;
const float fFondo = 0.2;
const float fSuavidadLineasEfectoDegradado = 0.2;

// Colores
// Color 1
const float fColorR1 = 0.1;
const float fColorG1 = 0.1;
const float fColorB1 = 0.4;
// Color 2
const int iColorR2 = 10;
const int iColorG2 = 5;
const int iColorB2 = 6;

//Posicion
const float fPosicion = 0.5; // 0.5 es el centro de la pantalla

#define m *= mat2( cos( vec4(estiramientoX,estiramientoY,estiramientoZ,estiramientoW) + t*

#define M \
    (s.xz m.4)), s.xy m.3)), \
    length(s + sin(t*fGrosor))*log(length(s)+fTamanyo)+ \
    sin(sin(sin(s=s+s+t).y+s).z+s).x*fIntensidadTensor-fConcavidadTensor)

void main() {
    vec4 o;
    vec2 uv = vUv;
    vec2 u = vUv * iResolution.xy;
    vec3 p,s,O,R=iResolution;
    
    for(float t=uTime,d=fElevacionZEfectoDeformacion,r;
            R.z++<fSuavidadEfectoDegradado;
            o.xyz=clamp(O=max(O+fBrilloEfectoDegradado-r*fLongitudDegradado,O+fFondo)*(vec3(fColorR1,fColorG1,fColorB1)-vec3(iColorR2,iColorG2,iColorB2)*(M-r)/4.), 0.0, 1.0))
        s=p=vec3((u-fPosicion*R.xy)/R.y*d,fCorteSeccion-d),
        d+=min(r=M,fSuavidadLineasEfectoDegradado),
        s=p+fSaturacion;
    
    o.w = 1.0; // Aseguramos que el canal alfa esté definido
    gl_FragColor = o;
}