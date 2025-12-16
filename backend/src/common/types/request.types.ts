import { User } from '../../auth/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    roles: string[];
    tenant_id: string;
  };
}
