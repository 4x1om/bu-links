export class Vector2
{

    public static readonly ZERO: Vector2 = new Vector2(0, 0)

    public static lerp(a: Vector2, b: Vector2, t: number): Vector2 { return a.mul(1 - t).add(b.mul(t)) }

    public constructor(public readonly x: number, public readonly y: number) { }


    public add(v: Vector2): Vector2 { return new Vector2(this.x + v.x, this.y + v.y) }
    public sub(v: Vector2): Vector2 { return new Vector2(this.x - v.x, this.y - v.y) }

    public mul(v: number): Vector2 { return new Vector2(this.x * v, this.y * v) }
    public div(v: number): Vector2 { return new Vector2(this.x / v, this.y / v) }
    public neg(): Vector2 { return new Vector2(-this.x, -this.y) }

    public get length(): number { return Math.sqrt(this.lengthSq) }
    public get lengthSq(): number { return this.x * this.x + this.y * this.y }

    public normalize(): Vector2
    {
        let len = this.lengthSq
        if (len === 0) return this

        return this.div(Math.sqrt(len))
    }

    public equals(v: Vector2): boolean { return this.x === v.x && this.y === v.y }

}

export class Color3
{

    public static readonly BLACK: Color3 = new Color3(0, 0, 0)
    public static readonly WHITE: Color3 = new Color3(1, 1, 1)

    public constructor(public readonly r: number, public readonly g: number, public readonly b: number) { }

    public mul(v: number): Color3 { return new Color3(this.r * v, this.g * v, this.b * v) }

}

export class Color4 extends Color3
{

    public static readonly BLACK: Color4 = new Color4(0, 0, 0, 1)
    public static readonly WHITE: Color4 = new Color4(1, 1, 1, 1)

    public constructor(r: number, g: number, b: number, public readonly a: number) { super(r, g, b) }

}
