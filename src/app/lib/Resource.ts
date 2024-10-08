import { Color3, Color4, Vector2 } from "./Math"
import type Device from "./Device"

export default interface Resource
{

    getBinding(): GPUBindingResource
    destroy(): void

}

export const enum BufferFormat { I32, U32, F32 }
export type BufferData = Int32Array | Uint32Array | Float32Array

const ELEMENT_SIZE = 4

export class Buffer implements Resource
{

    private readonly device: GPUDevice
    public readonly buffer: GPUBuffer

    public readonly length: number

    public constructor({ device }: Device, public readonly format: BufferFormat, usage: GPUBufferUsageFlags,
        length: number)
    {
        this.device = device

        this.length = length
        this.buffer = device.createBuffer({ size: ELEMENT_SIZE * length, usage })
    }


    public write(data: any[], offset: number = 0)
    {
        // Flatten data to pure list of numbers
        let flat = data.map(v =>
        {
            if (v instanceof Vector2) return [v.x, v.y]
            if (v instanceof Color3)  return [v.r, v.g, v.b]
            if (v instanceof Color4)  return [v.r, v.g, v.b, v.a]
            return v
        }).flat()

        // Convert array to ArrayBuffer based on format
        let Array: Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor
        switch (this.format)
        {
            case BufferFormat.I32: Array = Int32Array; break
            case BufferFormat.U32: Array = Uint32Array; break
            case BufferFormat.F32: Array = Float32Array; break
        }

        this.writeData(new Array(flat), offset)
    }

    public writeData(data: BufferData, offset: number = 0)
    {
        this.device.queue.writeBuffer(this.buffer, ELEMENT_SIZE * offset, data)
    }

    public getBinding(): GPUBindingResource { return { buffer: this.buffer } }
    public destroy() { this.buffer.destroy() }

}

export const enum TextureFormat
{
    R_UNORM  = "r8unorm",  RG_UNORM  = "rg8unorm",  RGBA_UNORM  = "rgba8unorm",
    R_SNORM  = "r8snorm",  RG_SNORM  = "rg8snorm",  RGBA_SNORM  = "rgba8snorm",
    R_U8     = "r8uint",   RG_U8     = "rg8uint",   RGBA_U8     = "rgba8uint",
    R_I8     = "r8sint",   RG_I8     = "rg8sint",   RGBA_I8     = "rgba8sint",

    R_U16    = "r16uint",  RG_U16    = "rg16uint",  RGBA_U16    = "rgba16uint",
    R_I16    = "r16sint",  RG_I16    = "rg16sint",  RGBA_I16    = "rgba16sint",
    R_F16    = "r16float", RG_F16    = "rg16float", RGBA_F16    = "rgba16float",

    R_U32    = "r32uint",  RG_U32    = "rg32uint",  RGBA_U32    = "rgba32uint",
    R_I32    = "r32sint",  RG_I32    = "rg32sint",  RGBA_I32    = "rgba32sint",
    R_F32    = "r32float", RG_F32    = "rg32float", RGBA_F32    = "rgba32float",

    DEPTH24 = "depth24plus", DEPTH32 = "depth32float", DEPTH24_STENCIL8 = "depth24plus-stencil8"
}

export type TextureData =
    | Int8Array  | Uint8Array | Uint8ClampedArray
    | Int16Array | Uint16Array
    | Int32Array | Uint32Array
    | Float32Array

export interface TextureParams
{

    samples?: number
    mips?: number

}

export class Texture implements Resource
{

    public static async fromFile(device: Device, src: string, params: TextureParams = {}): Promise<Texture>
    {
        let image = await Texture.toImage(src)

        // Create intermediate canvas and draw image to convert to image data
        let canvas = document.createElement("canvas")
        let c = canvas.getContext("2d")!

        canvas.width = image.width
        canvas.height = image.height
        c.drawImage(image, 0, 0)

        // Create texture and write image data
        let data = c.getImageData(0, 0, image.width, image.height)
        let texture = new Texture(device, TextureFormat.RGBA_UNORM,
            GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST, [image.width, image.height], params)

        texture.write(data.data)
        return texture
    }

    private static async toImage(src: string): Promise<HTMLImageElement>
    {
        return new Promise((res, _) =>
        {
            let image = document.createElement("img")

            image.src = src
            image.onload = () => res(image)
        })
    }

    private static getBytes(format: TextureFormat): number
    {
        switch (format)
        {
            case TextureFormat.R_UNORM:    case TextureFormat.R_SNORM:
            case TextureFormat.R_U8:       case TextureFormat.R_I8:
                return 1

            case TextureFormat.RG_UNORM:   case TextureFormat.RG_SNORM:
            case TextureFormat.RG_U8:      case TextureFormat.RG_I8:
            case TextureFormat.R_U16:      case TextureFormat.R_I16:    case TextureFormat.R_F16:
                return 2

            case TextureFormat.RGBA_UNORM: case TextureFormat.RGBA_SNORM:
            case TextureFormat.RGBA_U8:    case TextureFormat.RGBA_I8:
            case TextureFormat.RG_U16:     case TextureFormat.RG_I16:   case TextureFormat.RG_F16:
            case TextureFormat.R_U32:      case TextureFormat.R_I32:    case TextureFormat.R_F32:

            case TextureFormat.DEPTH24:    case TextureFormat.DEPTH32:  case TextureFormat.DEPTH24_STENCIL8:
                return 4

            case TextureFormat.RGBA_U16:   case TextureFormat.RGBA_I16: case TextureFormat.RGBA_F16:
            case TextureFormat.RG_U32:     case TextureFormat.RG_I32:   case TextureFormat.RG_F32:
                return 8

            case TextureFormat.RGBA_U32:   case TextureFormat.RGBA_I32: case TextureFormat.RGBA_F32:
                return 16
        }
    }

    private readonly device: GPUDevice
    public readonly texture: GPUTexture

    public readonly size: [number, number, number]

    public get format(): TextureFormat { return this.texture.format as TextureFormat }
    public get view(): GPUTextureView { return this.texture.createView() }

    public constructor(device: Device, texture: GPUTexture)
    public constructor(device: Device, format: TextureFormat, usage: GPUTextureUsageFlags, size: [number, number?, number?], params?: TextureParams)

    public constructor({ device }: Device, texture: GPUTexture | TextureFormat, usage?: GPUTextureUsageFlags,
        size?: [number, number?, number?], { samples, mips }: TextureParams = {})
    {
        this.device = device
        if (typeof(texture) === "string")
        {
            let format = texture, [x, y = 1, z = 1] = size!

            this.size = [x, y, z]
            this.texture = device.createTexture(
            {
                size: this.size,
                format, usage: usage!,
                sampleCount: samples,
                mipLevelCount: mips
            })
        }
        else
        {
            // Create texture wrapper from existing GPUTexture
            this.texture = texture
            this.size = [texture.width, texture.height, texture.depthOrArrayLayers]
        }
    }


    public write(data: TextureData, mip?: number)
    {
        let width = this.size[0] * Texture.getBytes(this.format)
        this.device.queue.writeTexture({ texture: this.texture, mipLevel: mip }, data, { bytesPerRow: width },
            this.size)
    }

    public getBinding(): GPUBindingResource { return this.view }
    public destroy() { this.texture.destroy() }

}

export class Shader
{

    public readonly module: GPUShaderModule

    public constructor({ device }: Device, code: string) { this.module = device.createShaderModule({ code }) }

}

export const enum SamplerAddressMode { REPEAT = "repeat", MIRROR_REPEAT = "mirror-repeat", CLAMP = "clamp-to-edge" }
export const enum SamplerFilterMode { NEAREST = "nearest", LINEAR = "linear" }

export interface SamplerParams
{

    u?: SamplerAddressMode
    v?: SamplerAddressMode
    w?: SamplerAddressMode

    mag?: SamplerFilterMode
    min?: SamplerFilterMode
    mip?: SamplerFilterMode

}

export class Sampler implements Resource
{
    
    private readonly sampler: GPUSampler

    public constructor({ device }: Device,
    {
        u = SamplerAddressMode.CLAMP, v = SamplerAddressMode.CLAMP, w = SamplerAddressMode.CLAMP,
        mag = SamplerFilterMode.NEAREST, min = SamplerFilterMode.NEAREST, mip = SamplerFilterMode.NEAREST
    }: SamplerParams = {})
    {
        this.sampler = device.createSampler(
        {
            addressModeU: u, addressModeV: v, addressModeW: w,
            magFilter: mag, minFilter: min, mipmapFilter: mip
        })
    }

    public getBinding(): GPUBindingResource { return this.sampler }
    public destroy() { }

}
