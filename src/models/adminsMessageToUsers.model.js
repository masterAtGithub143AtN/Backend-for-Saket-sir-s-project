import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const adminMessageToUsersSchema = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true // Corrected typo here
    },
    message: {
        type: String,
        required: true
    }
},
{
    timestamps:true
});

adminMessageToUsersSchema.pre('save', async function(next) {
    if (!this.isModified('message')) {
        return next();
    }
    // Assuming the intention is to hash the message. If not, reconsider this approach.
    this.message = await bcrypt.hash(this.message, 10);
    next();
});

export const AdminTUM = mongoose.model('AdminTUM', adminMessageToUsersSchema);