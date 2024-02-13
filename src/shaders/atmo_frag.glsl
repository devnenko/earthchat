uniform sampler2D uClouds;

uniform float uSunRot;
varying vec3 vNormal;
varying vec3 vWorldNormal;

varying vec2 vUv;

vec3 flattenVec3(vec3 v) {
    return clamp(v, 0.0, 1.0);
}

void main() {

    //degrees to radians
    float sunAngle = uSunRot * 3.1415 / 180.0;

    //create mask on sun side
    float lightIntensity = dot(vWorldNormal, vec3(cos(sunAngle), 0.0, sin(sunAngle)));
    float atmosphereMask = clamp(lightIntensity + 0.3, 0.25, 1.0);

    //fresnel effect
    float fresnelAmount = 5.0;
    float fresnelSpread=0.6;
    float fresnel = pow(1.2 - dot(vNormal, vec3(0.0, 0.0, 1.0)), fresnelAmount) * fresnelAmount * fresnelSpread;

    //clouds
    float clouds = texture2D(uClouds, vUv).x;

    //combine everything to atmosphere
    vec3 atmoColor = vec3(0.6, 0.8, 1.5);
    vec3 atmoShaded = flattenVec3(atmosphereMask * (fresnel + clouds) * atmoColor);

    gl_FragColor = vec4(atmoShaded.xyz, atmoShaded.x);
}