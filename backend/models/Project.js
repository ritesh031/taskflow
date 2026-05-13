const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
});

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    members: [MemberSchema],
  },
  { timestamps: true }
);

// Virtual: get all user IDs in the project
ProjectSchema.virtual('memberIds').get(function () {
  return this.members.map((m) => m.user.toString());
});

module.exports = mongoose.model('Project', ProjectSchema);
