import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WorkspaceService } from '../workspaces/services/workspace.service';
import { map } from 'rxjs/operators';

// Mock current userId
const currentUserId = 'user-1';

export const billingOwnerGuard: CanActivateFn = () => {
  const workspaceService = inject(WorkspaceService);
  const router = inject(Router);
  return workspaceService.getCurrentWorkspace().pipe(
    map(workspace => {
      if (!workspace) {
        router.navigate(['/']);
        return true;
      }
      const member = workspace.members.find(m => m.userId === currentUserId);
      if (member && member.workspaceRole === 'owner') {
        return true;
      }
      router.navigate(['/']);
      return true;
    })
  );
}; 