import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'serviceman', 'customer'], default: 'customer', required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  strava: {
    access_token: { type: String },
    refresh_token: { type: String },
    expires_at: { type: Number },
  },
  notificationPreferences: {
    type: Object,
    default: {
      email: true,
      push: true,
      types: ['reservation', 'team', 'system']
    }
  },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  createdAt: { type: Date, default: Date.now },
  permissions: {
    type: [String],
    default: ['create_reservation','view_stats'],
  }
});

// Dynamické nastavení práv podle role při vytváření uživatele
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'owner': this.permissions = ['manage_team','manage_services','view_stats','manage_settings']; break;
      case 'serviceman': this.permissions = ['manage_services','view_stats']; break;
      case 'customer': this.permissions = ['create_reservation','view_stats']; break;
      default: this.permissions = [];
    }
  }
  next();
});

export const User = mongoose.model('User', userSchema);
