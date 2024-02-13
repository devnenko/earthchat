uniform sampler2D uDay;
uniform sampler2D uNight;
uniform float uSunRot;
varying vec3 vNormal;
varying vec3 vWorldNormal;

varying vec2 vUv;

float flattenFloat(float f) {
    return clamp(f, 0.0, 1.0);
}

vec4 flattenVec4(vec4 v) {
    return clamp(v, 0.0, 1.0);
}

void main() {

    //degrees to radians
    float sunAngle = uSunRot * 3.1415 / 180.0;

    //render day part
    float dayIntensity = flattenFloat(dot(vWorldNormal, vec3(cos(sunAngle), 0.0, sin(sunAngle))));
    vec4 dayBase = texture2D(uDay, vUv);
    vec4 dayShaded = flattenVec4(dayBase * dayIntensity);

    //render night part
    float nightIntensity =flattenFloat((1.0-dayIntensity-0.9))*5.0;
    vec4 nightBase = texture2D(uNight, vUv);
    vec4 nightShaded = flattenVec4(nightBase * nightIntensity);

    //make the night a bit brighter
    nightShaded += dayBase * 0.12;

    //combine the two 
    gl_FragColor = vec4(dayShaded.xyz+nightShaded.xyz, 1.0);
}