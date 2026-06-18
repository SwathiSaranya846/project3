// ─── models/Task.js ───────────────────────────────────────────────
// Pillar 1: The Blueprint — Schema & Design
//
// Relationship: Many Tasks → One User (Foreign Key via ObjectId ref)
// This is the 1:Many relationship shown in the PDF
// ──────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type     : String,
      required : [true, 'Task title is required'],   // NOT NULL
      trim     : true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type    : String,
      trim    : true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default : ''
    },

    status: {
      type   : String,
      enum   : {                                     // CHECK constraint
        values : ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done'
      },
      default: 'todo'
    },

    priority: {
      type   : String,
      enum   : {                                     // CHECK constraint
        values : ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      default: 'medium'
    },

    // ── Foreign Key — links Task to a User ────────────────────────
    // This is the "structural glue" shown in the PDF keys slide
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,          // Foreign Key (ObjectId)
      ref : 'User',                                  // References User collection
      default: null
    },

    dueDate: {
      type    : Date,
      default : null,
      validate: {
        validator: function (val) {
          // CHECK: dueDate must be in the future (if provided)
          return !val || val > new Date();
        },
        message: 'Due date must be a future date'
      }
    }
  },
  {
    timestamps: true,
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

// ── Indexes for faster queries ─────────────────────────────────────
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ assignedTo: 1 });

// ── Virtual: is this task overdue? ────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  return this.dueDate && this.status !== 'done' && this.dueDate < new Date();
});

module.exports = mongoose.model('Task', taskSchema);