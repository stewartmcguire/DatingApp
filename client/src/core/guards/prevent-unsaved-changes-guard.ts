import { CanDeactivateFn } from '@angular/router';
import { MemberProfile } from '../../features/members/member-profile/member-profile';

export const preventUnsavedChangesGuard: CanDeactivateFn<MemberProfile> = (component, _currentRoute, _currentState, _nextState) => {
  if (component.editForm?.dirty) {
    return confirm("Are you sure you want to discard your changes?");
  }
  return true;
};
