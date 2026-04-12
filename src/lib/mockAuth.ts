import type { AppRole } from "./constants";

export type DemoUser = {
  role: AppRole;
  name: string;
  email: string;
  password: string;
  description: string;
};

export type AuthSession = {
  role: AppRole;
  name: string;
  email: string;
};

export const DEMO_USERS: DemoUser[] = [
  {
    role: "Admin",
    name: "Aina Admin",
    email: "admin@sejuk.com",
    password: "admin123",
    description: "Creates service orders and assigns technician teams.",
  },
  {
    role: "Technician",
    name: "Ali",
    email: "ali@sejuk.com",
    password: "tech123",
    description: "Technician account mapped directly to assigned jobs for Ali.",
  },
  {
    role: "Technician",
    name: "John",
    email: "john@sejuk.com",
    password: "tech123",
    description: "Technician account mapped directly to assigned jobs for John.",
  },
  {
    role: "Technician",
    name: "Bala",
    email: "bala@sejuk.com",
    password: "tech123",
    description: "Technician account mapped directly to assigned jobs for Bala.",
  },
  {
    role: "Technician",
    name: "Yusoff",
    email: "yusoff@sejuk.com",
    password: "tech123",
    description: "Technician account mapped directly to assigned jobs for Yusoff.",
  },
  {
    role: "Manager",
    name: "Mira Manager",
    email: "manager@sejuk.com",
    password: "manager123",
    description: "Reviews completed jobs and operational summaries.",
  },
];

export function authenticateDemoUser(email: string, password: string): AuthSession {
  const normalizedEmail = email.trim().toLowerCase();
  const demoUser = DEMO_USERS.find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.password === password,
  );

  if (!demoUser) {
    throw new Error("Invalid demo credentials. Use one of the accounts shown below.");
  }

  return {
    email: demoUser.email,
    name: demoUser.name,
    role: demoUser.role,
  };
}

export function getDemoUserByRole(role: AppRole) {
  const demoUser = DEMO_USERS.find((user) => user.role === role);

  if (!demoUser) {
    throw new Error(`No demo user is configured for role: ${role}`);
  }

  return demoUser;
}
