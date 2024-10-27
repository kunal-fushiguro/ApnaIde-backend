 
import { Schema, model } from "mongoose"

interface UserType {
    _id: string
    name: string
    email: string
    containersList: any[]
}

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    containersList: [{ type: Schema.Types.ObjectId, ref: "containers" }]
})

const Users = model("Users", userSchema)

export { Users, UserType }

