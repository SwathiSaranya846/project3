// ─── models/User.js ───────────────────────────────────────────────
// Pillar 1: The Blueprint — Schema & Design
//
// Schema enforces:
//   - NOT NULL  → required: true
//   - UNIQUE    → unique: true
//   - CHECK     → enum, minlength, match (regex)
//
// Relationship: One User → Many Tasks (1:Many)
// ──────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Name is required'],       // NOT NULL
      trim    : true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type    : String,
      required: [true, 'Email is required'],       // NOT NULL
      unique  : true,                              // UNIQUE constraint
      trim    : true,
      lowercase: true,
      match   : [                                  // CHECK — format validation
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },

    role: {
      type   : String,
      enum   : {                                   // CHECK — allowed values only
        values : ['admin', 'member'],
        message: 'Role must be either admin or member'
      },
      default: 'member'
    },

    isActive: {
      type   : Boolean,
      default: true
    }
  },
  {
    // Auto-adds createdAt and updatedAt timestamps
    timestamps: true,

    // Clean up output — remove __v, rename _id to id
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// ── Index for faster email lookups ────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ── Virtual: full display name (shows how virtuals work) ──────────
userSchema.virtual('displayName').get(function () {
  return `${this.name} (${this.role})`;
});

module.exports = mongoose.model('User', userSchema);