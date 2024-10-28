import { Schema, model } from "mongoose"

interface containerType {
    containerName: string
    ip: string
    port: number
    userId: any
    containerId: string
    status: boolean
}

const containersSchema = new Schema({
    containerName: { type: String, required: true },
    ip: { type: String, required: true },
    port: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    containerId: { type: Number, required: true },
    status: { type: Boolean, required: true }
})

const Containers = model("Containers", containersSchema)

export { Containers, containerType }

