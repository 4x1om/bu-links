"use client"
import { useEffect, useRef } from "react"
import Device, { ComputePass, ComputePipeline, LoadOperation, RenderPass, RenderPipeline, VertexFormat } from "../lib/Device"
import { Color3, Color4, Vector2 } from "../lib/Math"
import { Buffer, BufferFormat, Sampler, SamplerFilterMode, Shader, Texture, TextureFormat } from "../lib/Resource"

import textureCode from "../lib/shaders/texture"
import fluidSimulationCode from "../lib/shaders/fluid-simulation"

let mouse: Vector2 = Vector2.ZERO
let button: boolean = false

function mousemove(e: MouseEvent) { mouse = new Vector2(e.clientX, e.clientY) }
function mousedown(e: MouseEvent) { if (e.button === 0) button = true }
function mouseup(e: MouseEvent) { if (e.button === 0) button = false }

function touchmove(e: TouchEvent) { mouse = new Vector2(e.touches[0].clientX, e.touches[0].clientY) }
function touchstart(_: TouchEvent) { button = true }
function touchend(_: TouchEvent) { button = false }

let canvas!: HTMLCanvasElement

async function main()
{
    let device = await Device.init(canvas)

    const SCALE = 3
    const ITERATIONS = 32

    const RADIUS = 10

    let width = canvas.width, height = canvas.height
    let w = Math.floor(width / SCALE), h = Math.floor(height / SCALE)

    // Initialize rendering texture related data
    let texture = new Texture(device, TextureFormat.RGBA_UNORM, GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST, [width, height])
    let dimensionsBuffer = new Buffer(device, BufferFormat.U32, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 2)
    let densityDimensionsBuffer = new Buffer(device, BufferFormat.U32, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 2)
    dimensionsBuffer.write([w, h])
    densityDimensionsBuffer.write([width, height])

    let vertexBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, 2 * 6)
    vertexBuffer.write(
    [
        new Vector2(-1, -1), new Vector2(1, -1), new Vector2( 1, 1),
        new Vector2(-1, -1), new Vector2(1,  1), new Vector2(-1, 1)
    ])

    let pipeline = new RenderPipeline(device, new Shader(device, textureCode), device.format, [{ format: VertexFormat.F32_2 }])
    let pass = new RenderPass(pipeline, [[{ i: 0, resource: new Sampler(device, { mag: SamplerFilterMode.LINEAR }) }, { i: 1, resource: texture }]], [vertexBuffer])

    // Initialize fluid simulation buffers
    let velocityBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, w * h * 2)
    let previousVelocityBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, w * h * 2)

    let divergenceBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE, w * h)
    let curlBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE, w * h)

    let pressureBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, w * h)
    let previousPressureBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, w * h)

    let densityBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, width * height * 4)
    let previousDensityBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, width * height * 4)

    // Initialize user interface uniforms
    let positionBuffer = new Buffer(device, BufferFormat.F32, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 2)
    let impulseBuffer  = new Buffer(device, BufferFormat.F32, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 2)
    let colorBuffer    = new Buffer(device, BufferFormat.F32, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 3)
    let radiusBuffer   = new Buffer(device, BufferFormat.F32, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 1)

    let bufferConfig =
    {
        texture:           { i: 0, resource: texture },
        dimensions:        { i: 1, resource: dimensionsBuffer },
        densityDimensions: { i: 2, resource: densityDimensionsBuffer },

        velocity:          { i: 0, resource: velocityBuffer },
        previousVelocity:  { i: 1, resource: previousVelocityBuffer },
        divergence:        { i: 2, resource: divergenceBuffer },
        curl:              { i: 3, resource: curlBuffer },
        pressure:          { i: 4, resource: pressureBuffer },
        previousPressure:  { i: 5, resource: previousPressureBuffer },
        density:           { i: 6, resource: densityBuffer },
        previousDensity:   { i: 7, resource: previousDensityBuffer },

        position:          { i: 0, resource: positionBuffer },
        impulse:           { i: 1, resource: impulseBuffer },
        color:             { i: 2, resource: colorBuffer },
        radius:            { i: 3, resource: radiusBuffer }
    }

    // Initialize shader passes
    let shader = new Shader(device, fluidSimulationCode)

    let advectionPass = new ComputePass(new ComputePipeline(device, shader, "advection"),
        [[bufferConfig.dimensions], [bufferConfig.velocity, bufferConfig.previousVelocity]])

    let calculateDivergencePass = new ComputePass(new ComputePipeline(device, shader, "calculateDivergence"),
        [[bufferConfig.dimensions], [bufferConfig.velocity, bufferConfig.divergence]])
    let calculateCurlPass = new ComputePass(new ComputePipeline(device, shader, "calculateCurl"),
        [[bufferConfig.dimensions], [bufferConfig.velocity, bufferConfig.curl]])
    let vorticityPass = new ComputePass(new ComputePipeline(device, shader, "vorticity"),
        [[bufferConfig.dimensions], [bufferConfig.velocity, bufferConfig.curl]])

    let jacobiPass = new ComputePass(new ComputePipeline(device, shader, "jacobi"),
        [[bufferConfig.dimensions], [bufferConfig.divergence, bufferConfig.pressure, bufferConfig.previousPressure]])
    let gradientSubtractionPass = new ComputePass(new ComputePipeline(device, shader, "gradientSubtraction"),
        [[bufferConfig.dimensions], [bufferConfig.velocity, bufferConfig.pressure]])

    let densityAdvectionPass = new ComputePass(new ComputePipeline(device, shader, "densityAdvection"),
        [[bufferConfig.dimensions, bufferConfig.densityDimensions], [bufferConfig.velocity, bufferConfig.density, bufferConfig.previousDensity]])
    let transferPass = new ComputePass(new ComputePipeline(device, shader, "transfer"),
        [[bufferConfig.texture, bufferConfig.densityDimensions], [bufferConfig.density]])

    let addImpulsePass = new ComputePass(new ComputePipeline(device, shader, "addImpulse"),
        [[bufferConfig.dimensions], [bufferConfig.velocity], [bufferConfig.position, bufferConfig.impulse, bufferConfig.radius]])
    let addDensityPass = new ComputePass(new ComputePipeline(device, shader, "addDensity"),
        [[bufferConfig.densityDimensions], [bufferConfig.density], [bufferConfig.position, bufferConfig.color, bufferConfig.radius]])


    let x = Math.ceil(w / 8), y = Math.ceil(h / 8)
    let nx = Math.ceil(width / 8), ny = Math.ceil(height / 8)

    let r = Math.ceil((2 * RADIUS - 1) / 8)
    let nr = Math.ceil((2 * SCALE * RADIUS + 1) / 8)

    let previous = mouse
    let color = Color3.WHITE

    loop()
    function loop()
    {
        let position = mouse
        if (button)
        {
            let localPosition = new Vector2(position.x * w / canvas.width, h - position.y * h / canvas.height)
            let localPrevious = new Vector2(previous.x * w / canvas.width, h - previous.y * h / canvas.height)
            let impulse = localPosition.sub(localPrevious)

            positionBuffer.write([localPosition])
            impulseBuffer.write([impulse.mul(0.2)])
            radiusBuffer.write([RADIUS - 1])
            addImpulsePass.dispatch(r, r)

            device.submit()
            colorBuffer.write([color.mul(0.02 * impulse.length)])
            radiusBuffer.write([SCALE * RADIUS])
            addDensityPass.dispatch(nr, nr)
        }
        previous = position

        device.copyBuffer(velocityBuffer, previousVelocityBuffer)
        device.copyBuffer(densityBuffer, previousDensityBuffer)

        advectionPass.dispatch(x, y)
        calculateDivergencePass.dispatch(x, y)
        calculateCurlPass.dispatch(x, y)
        vorticityPass.dispatch(x, y)

        for (let i = 0; i < ITERATIONS; i++)
        {
            device.copyBuffer(pressureBuffer, previousPressureBuffer)
            jacobiPass.dispatch(x, y)
        }
        gradientSubtractionPass.dispatch(x, y)

        densityAdvectionPass.dispatch(nx, ny)
        transferPass.dispatch(nx, ny)

        device.beginPass(device.texture, { load: LoadOperation.CLEAR, color: Color4.BLACK })
        pass.render(6)
        device.endPass()

        device.submit()
        requestAnimationFrame(loop)
    }

    return function()
    {
        texture.destroy()
        dimensionsBuffer.destroy()
        densityDimensionsBuffer.destroy()

        vertexBuffer.destroy()

        velocityBuffer.destroy()
        previousVelocityBuffer.destroy()

        divergenceBuffer.destroy()
        curlBuffer.destroy()

        pressureBuffer.destroy()
        previousPressureBuffer.destroy()

        positionBuffer.destroy()
        impulseBuffer.destroy()
        colorBuffer.destroy()
        radiusBuffer.destroy()
    }
}

let init = false

export default function Test() {
    let canvasRef = useRef(null)

    useEffect(() =>
    {
        if (init) return
        init = true
        
        window.addEventListener("mousemove", mousemove)
        window.addEventListener("touchmove", touchmove)
        window.addEventListener("mousedown", mousedown)
        window.addEventListener("touchstart", touchstart)
        window.addEventListener("mouseup", mouseup)
        window.addEventListener("touchend", touchend)

        canvas = canvasRef.current!

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        main()
    }, [])

    return (
        <div>
            <canvas ref={canvasRef}></canvas>
        </div>
    )
}
