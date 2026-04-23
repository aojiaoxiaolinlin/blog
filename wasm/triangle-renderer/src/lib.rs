use wasm_bindgen::prelude::*;
use web_sys::HtmlCanvasElement;

#[wasm_bindgen]
pub async fn start(canvas_id: String) -> Result<(), JsValue> {
    console_error_panic_hook::set_once();

    let window = web_sys::window().ok_or_else(|| js_error("window is unavailable"))?;
    let document = window
        .document()
        .ok_or_else(|| js_error("document is unavailable"))?;
    let canvas = document
        .get_element_by_id(&canvas_id)
        .ok_or_else(|| js_error("triangle canvas was not found"))?
        .dyn_into::<HtmlCanvasElement>()
        .map_err(|_| js_error("target element is not a canvas"))?;

    let device_pixel_ratio = window.device_pixel_ratio();
    let width = ((canvas.client_width().max(1) as f64) * device_pixel_ratio).round() as u32;
    let height = ((canvas.client_height().max(1) as f64) * device_pixel_ratio).round() as u32;
    canvas.set_width(width.max(1));
    canvas.set_height(height.max(1));

    let instance = wgpu::Instance::default();
    let surface = instance
        .create_surface(wgpu::SurfaceTarget::Canvas(canvas))
        .map_err(to_js_error)?;

    let adapter = instance
        .request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::HighPerformance,
            compatible_surface: Some(&surface),
            force_fallback_adapter: false,
        })
        .await
        .map_err(to_js_error)?;

    let (device, queue) = adapter
        .request_device(&wgpu::DeviceDescriptor {
            label: Some("triangle-device"),
            required_features: wgpu::Features::empty(),
            required_limits: wgpu::Limits::downlevel_defaults(),
            memory_hints: wgpu::MemoryHints::Performance,
            trace: wgpu::Trace::default(),
            experimental_features: wgpu::ExperimentalFeatures::disabled(),
        })
        .await
        .map_err(to_js_error)?;

    let mut config = surface
        .get_default_config(&adapter, width.max(1), height.max(1))
        .ok_or_else(|| js_error("surface configuration is unavailable"))?;
    let capabilities = surface.get_capabilities(&adapter);
    config.format = capabilities
        .formats
        .iter()
        .copied()
        .find(|format| format.is_srgb())
        .unwrap_or(capabilities.formats[0]);
    surface.configure(&device, &config);

    let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: Some("triangle-shader"),
        source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
    });

    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("triangle-pipeline-layout"),
        bind_group_layouts: &[],
        immediate_size: 0,
    });

    let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
        label: Some("triangle-pipeline"),
        layout: Some(&pipeline_layout),
        vertex: wgpu::VertexState {
            module: &shader,
            entry_point: Some("vs_main"),
            buffers: &[],
            compilation_options: wgpu::PipelineCompilationOptions::default(),
        },
        primitive: wgpu::PrimitiveState::default(),
        depth_stencil: None,
        multisample: wgpu::MultisampleState::default(),
        fragment: Some(wgpu::FragmentState {
            module: &shader,
            entry_point: Some("fs_main"),
            targets: &[Some(wgpu::ColorTargetState {
                format: config.format,
                blend: Some(wgpu::BlendState::REPLACE),
                write_mask: wgpu::ColorWrites::ALL,
            })],
            compilation_options: wgpu::PipelineCompilationOptions::default(),
        }),
        multiview_mask: None,
        cache: None,
    });

    let frame = match surface.get_current_texture() {
        wgpu::CurrentSurfaceTexture::Success(surface_texture) => surface_texture,
        _ => {
            eprintln!("Surface Fail");
            return Ok(());
        }
    };
    let view = frame
        .texture
        .create_view(&wgpu::TextureViewDescriptor::default());
    let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
        label: Some("triangle-encoder"),
    });

    {
        let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("triangle-render-pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &view,
                depth_slice: None,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: 0.020,
                        g: 0.024,
                        b: 0.070,
                        a: 1.0,
                    }),
                    store: wgpu::StoreOp::Store,
                },
            })],
            depth_stencil_attachment: None,
            occlusion_query_set: None,
            timestamp_writes: None,
            multiview_mask: None,
        });
        render_pass.set_pipeline(&pipeline);
        render_pass.draw(0..3, 0..1);
    }

    queue.submit(std::iter::once(encoder.finish()));
    frame.present();

    Ok(())
}

fn js_error(message: &str) -> JsValue {
    JsValue::from_str(message)
}

fn to_js_error<E: core::fmt::Display>(error: E) -> JsValue {
    JsValue::from_str(&error.to_string())
}
