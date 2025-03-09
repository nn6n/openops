import { Organization, UpdateOrganizationRequestBody } from '@openops/shared';

import { api } from './api';
import { authenticationSession } from './authentication-session';

export const platformApi = {
  getCurrentOrganization() {
    const organizationId = authenticationSession.getOrganizationId();
    if (!organizationId) {
      throw Error('No organization id found');
    }
    return api.get<Organization>(`/v1/organizations/${organizationId}`);
  },

  update(req: UpdateOrganizationRequestBody, organizationId: string) {
    return api.post<void>(`/v1/organizations/${organizationId}`, req);
  },
};
