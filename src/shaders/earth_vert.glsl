varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;

void main(){
    vUv = uv;
    vNormal=normalize(normalMatrix*normal);
    vWorldNormal = vec3(modelMatrix * vec4(normal, 0.0));
    gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
}