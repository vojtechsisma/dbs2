import { UserRole } from '@prisma/client';

export class UserInfo {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export class AuthEntity {
  token: string;
  user: UserInfo;
}
