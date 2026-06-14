import jwt from "jsonwebtoken";

const secret = () => process.env.JWT_SECRET || "development-secret";

export function signUser(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name, email: user.email },
    secret(),
    { expiresIn: "8h" }
  );
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Kirish talab qilinadi" });
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    res.status(401).json({ message: "Sessiya tugagan" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bu amal uchun ruxsat yetarli emas" });
    }
    next();
  };
}
