struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
  let positions = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 0.72),
    vec2<f32>(-0.72, -0.62),
    vec2<f32>(0.72, -0.62),
  );

  let colors = array<vec3<f32>, 3>(
    vec3<f32>(0.486, 0.416, 0.961),
    vec3<f32>(0.416, 0.961, 0.784),
    vec3<f32>(0.961, 0.635, 0.416),
  );

  var out: VertexOutput;
  out.position = vec4<f32>(positions[vertex_index], 0.0, 1.0);
  out.color = colors[vertex_index];
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
