// Helper pro bezpečné získání userId z req.user (podpora Mongoose dokumentu i plain objektu)
export function getUserId(user: any): string | undefined {
  if (!user) return undefined;
  if (typeof user._id === 'object' && user._id.toString) return user._id.toString();
  if (typeof user._id === 'string') return user._id;
  if (typeof user.id === 'string') return user.id;
  return undefined;
}
