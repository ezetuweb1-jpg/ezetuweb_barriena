import { setAuthorFollowed } from '@/lib/data';
import { isUserFollowed, toggleFollowUser, type UserProfile } from '@/lib/followed-users';

export async function setUserFollowed(user: UserProfile, follow: boolean): Promise<boolean> {
  if (isUserFollowed(user.id) !== follow) toggleFollowUser(user);
  try {
    await setAuthorFollowed(user.name, follow);
    return true;
  } catch {
    if (isUserFollowed(user.id) === follow) toggleFollowUser(user);
    return false;
  }
}
