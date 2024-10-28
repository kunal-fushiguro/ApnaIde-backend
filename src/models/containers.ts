import { Schema, model } from "mongoose"

const containersSchema = new Schema({
    containerName: { type: String, required: true },
    ip: { type: String, required: true },
    port: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users" }
})

const Containers = model("Containers", containersSchema)

export { Containers }

